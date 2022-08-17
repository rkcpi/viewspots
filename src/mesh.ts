interface MeshNode {
  id: number
}

interface MeshElement {
  id: number
  nodes: number[]
}

export class ValueMeshElement {
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

    const elementToValue = new Map(values.map((v) => [v.element_id, v.value]))

    this.nodes = nodes
    this.elements = elements.map(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (element) => new ValueMeshElement(element.id, element.nodes, elementToValue.get(element.id)!)
    )
    this.elementIdsToElements = new Map(this.elements.map((element) => [element.id, element]))
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

  findNodesWithTheirAdjacentElements(): Map<number, Set<ValueMeshElement>> {
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

  findNeighbourhoods(
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

  checkIfElementsAreViewSpots(
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

  filterAndSortViewSpots(elementsAreViewSpots: Map<number, boolean>) {
    return this.elements
      .filter((element) => elementsAreViewSpots.get(element.id))
      .sort((a, b) => b.value - a.value)
  }

  removePossibleDuplicatesIfTheyAreNeighbours(
    allViewSpots: ValueMeshElement[],
    neighbourhoods: Map<number, ValueMeshElement[]>
  ) {
    if (
      new Set(allViewSpots.map((viewSpot) => viewSpot.value)).size === allViewSpots.length
    ) {
      return allViewSpots
    }
    const knownValuesWithElements = new Map<number, number[]>()
    return allViewSpots.filter((viewSpot) => {
      let duplicate
      if (knownValuesWithElements.has(viewSpot.value)) {
        knownValuesWithElements.get(viewSpot.value)?.forEach((elementId) => {
          duplicate = neighbourhoods
            .get(elementId)
            ?.find((neighbour) => neighbour.id === viewSpot.id)
        })
        if (!duplicate) {
          knownValuesWithElements.get(viewSpot.value)?.push(viewSpot.id)
        }
        return false
      } else {
        knownValuesWithElements.set(viewSpot.value, [viewSpot.id])
        return true
      }
    })
  }

  computeBestNViewSpots(n = NaN) {
    if (n === 0) return []
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
    return isNaN(n)
      ? viewSpotsWithoutDuplicates
      : viewSpotsWithoutDuplicates.slice(0, n)
  }
}
