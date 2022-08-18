interface MeshNode {
  id: number
}

interface MeshElement {
  id: number
  nodes: number[]
}

class ValueMeshElement {
  id: number
  nodeIds: number[]
  value: number

  constructor(id: number, nodes: number[], value: number) {
    this.id = id
    this.nodeIds = nodes
    this.value = value
  }
}

interface MeshValue {
  element_id: number
  value: number
}

interface ElementMapping {
  elements: ValueMeshElement[]
  mapping: Map<number, ValueMeshElement>
}

interface ViewSpotFilter {
  knownValuesWithElements: Map<number, number[]>
  actualViewSpots: ValueMeshElement[]
}

export class Mesh {
  nodes: MeshNode[]
  elements: ValueMeshElement[]
  elementIdsToElements: Map<number, ValueMeshElement>

  constructor(
    nodes: MeshNode[],
    elements: MeshElement[],
    values: MeshValue[],
    sanityCheck = false
  ) {
    if (sanityCheck) {
      this.checkSanity(nodes, elements, values)
    }

    this.nodes = nodes

    const elementMapping = this.elementsToValueMeshElements(elements, values)
    this.elements = elementMapping.elements
    this.elementIdsToElements = elementMapping.mapping
  }

  private checkSanity(nodes: MeshNode[], elements: MeshElement[], values: MeshValue[]) {
    // Check validity of node references in elements
    const allNodes = new Set(nodes.map(node => node.id))
    elements.forEach((element) => {
      element.nodes.forEach((elementNode) => {
        if (!allNodes.has(elementNode)) {
          throw new Error(
            `Element ${element.id} refers to unknown node with id ${elementNode}`
          )
        }
      })
    })

    // Check validity of element references in values
    values.forEach((value) => {
      if (!elements.some((element) => element.id === value.element_id)) {
        throw new Error(
          `Value refers to unknown element with id ${value.element_id}`
        )
      }
    })
  }

  private elementsToValueMeshElements(elements: MeshElement[], values: MeshValue[]): ElementMapping {
    const elementToValue = new Map(values.map((v) => [v.element_id, v.value]))
    return elements.reduce<ElementMapping>((acc: ElementMapping, element: MeshElement) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const valueMeshElement = new ValueMeshElement(element.id, element.nodes, elementToValue.get(element.id)!)
      acc.elements.push(valueMeshElement)
      acc.mapping.set(valueMeshElement.id, valueMeshElement)
      return acc
    }, { elements: [], mapping: new Map() } as ElementMapping)
  }

  private findNodesWithTheirAdjacentElements(): Map<number, Set<ValueMeshElement>> {
    const result = new Map<number, Set<ValueMeshElement>>()
    this.elements.forEach(element => {
      element.nodeIds.forEach(nodeId => {
        if (result.has(nodeId)) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          result.get(nodeId)!.add(element)
        } else {
          result.set(nodeId, new Set([element]))
        }
      })
    })
    return result
  }

  private findNeighbourhoods(
    nodesWithTheirAdjacentElements: Map<number, Set<ValueMeshElement>>
  ): Map<number, ValueMeshElement[]> {
    return new Map(
      this.elements.map((currentElement) => {
        const neighbours =  currentElement.nodeIds
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .flatMap((nodeId) => Array.from(nodesWithTheirAdjacentElements.get(nodeId)!))
        .filter((element) => element !== undefined && element.id !== currentElement.id)

        return [currentElement.id, neighbours]
      })
    )
  }

  private checkIfElementsAreViewSpots(
    elementsWithTheirNeighbourhoods: Map<number, ValueMeshElement[]>
  ) {
    const result = new Map<number, boolean>()
    for (const [
      currentElementId,
      neighbours,
    ] of elementsWithTheirNeighbourhoods.entries()) {
      const maxNeighbour = neighbours.reduce((prev, current) =>
        prev.value > current.value ? prev : current
      )
      const currentElementValue =
        this.elementIdsToElements.get(currentElementId)?.value
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      result.set(currentElementId, currentElementValue! >= maxNeighbour.value)
    }
    return result
  }

  private filterAndSortViewSpots(elementsAreViewSpots: Map<number, boolean>) {
    return this.elements
      .filter((element) => elementsAreViewSpots.get(element.id))
      .sort((a, b) => b.value - a.value)
  }

  private removePossibleDuplicatesIfTheyAreNeighbours(
    allViewSpots: ValueMeshElement[],
    neighbourhoods: Map<number, ValueMeshElement[]>
  ) {
    if (
      new Set(allViewSpots.map((viewSpot) => viewSpot.value)).size === allViewSpots.length
    ) {
      return allViewSpots
    }

    const filteredViewSpots = allViewSpots.reduce<ViewSpotFilter>((acc, currentViewSpot) => {
      if (acc.knownValuesWithElements.has(currentViewSpot.value)) {
        const viewSpotsWithSameValue = acc.knownValuesWithElements.get(currentViewSpot.value)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const thereIsANeighbourWithSameValue = viewSpotsWithSameValue!.some((elementId) => {
          const neighboursForThisElement = neighbourhoods.get(elementId)
          const currentViewSpotIsNeighbourOfElementWithSameValue =
            neighboursForThisElement?.some((neighbour) => neighbour.id === currentViewSpot.id)
          return currentViewSpotIsNeighbourOfElementWithSameValue
        })
        if (!thereIsANeighbourWithSameValue) {
          acc.knownValuesWithElements.get(currentViewSpot.value)?.push(currentViewSpot.id)
          acc.actualViewSpots.push(currentViewSpot)
        }
      } else {
        acc.knownValuesWithElements.set(currentViewSpot.value, [currentViewSpot.id])
        acc.actualViewSpots.push(currentViewSpot)
      }
      return acc

    }, { knownValuesWithElements: new Map(), actualViewSpots: [] } as ViewSpotFilter)
    return filteredViewSpots.actualViewSpots
  }

  private format(viewSpots: ValueMeshElement[]) {
    return viewSpots.map(viewSpot => {
      return { element_id: viewSpot.id, value: viewSpot.value }
    })
  }

  computeBestNViewSpots(n = NaN) {
    if (n <= 0) return []
    const nodesWithTheirAdjacentElements =
      this.findNodesWithTheirAdjacentElements()
    const elementsWithTheirNeighbourhoods = this.findNeighbourhoods(
      nodesWithTheirAdjacentElements
    )
    const elementsAreViewSpots = this.checkIfElementsAreViewSpots(
      elementsWithTheirNeighbourhoods
    )
    const allViewSpots = this.filterAndSortViewSpots(elementsAreViewSpots)
    const viewSpotsWithoutDuplicates =
      this.removePossibleDuplicatesIfTheyAreNeighbours(
        allViewSpots,
        elementsWithTheirNeighbourhoods
      )
    return this.format(isNaN(n)
      ? viewSpotsWithoutDuplicates
      : viewSpotsWithoutDuplicates.slice(0, n))
  }
}
