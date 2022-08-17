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
      (e) => new ValueMeshElement(e.id, e.nodes, elementToValue.get(e.id)!)
    )
    this.elementIdsToElements = new Map(this.elements.map((e) => [e.id, e]))
  }

  private checkSanity(nodes: MeshNode[], elements: MeshElement[], values: MeshValue[]) {
    // Check validity of node references in elements
    const allNodes = new Set(nodes.map(n => n.id))
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
    this.elements.forEach(e => {
      e.nodeIds.forEach(n => {
        if (!result.has(n)) {
          result.set(n, new Set())
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        result.get(n)!.add(e)
      })
    })
    return result
  }

  findNeighbourhoods(
    nodesWithTheirAdjacentElements: Map<number, Set<ValueMeshElement>>
  ): Map<number, ValueMeshElement[]> {
    return new Map(
      this.elements.map((currentElement) => {
        return [
          currentElement.id,
          currentElement.nodeIds
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .flatMap((n) => Array.from(nodesWithTheirAdjacentElements.get(n)!))
            .filter((e) => e !== undefined && e !== currentElement),
        ]
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
      .filter((e) => elementsAreViewSpots.get(e.id))
      .sort((a, b) => b.value - a.value)
  }

  removePossibleDuplicatesIfTheyAreNeighbours(
    allViewSpots: ValueMeshElement[],
    neighbourhoods: Map<number, ValueMeshElement[]>
  ) {
    if (
      new Set(allViewSpots.map((v) => v.value)).size === allViewSpots.length
    ) {
      return allViewSpots
    }
    const knownValuesWithElements = new Map<number, number[]>()
    return allViewSpots.filter((v) => {
      let duplicate
      if (knownValuesWithElements.has(v.value)) {
        knownValuesWithElements.get(v.value)?.forEach((elementId) => {
          duplicate = neighbourhoods
            .get(elementId)
            ?.find((neighbour) => neighbour.id === v.id)
        })
        if (!duplicate) {
          knownValuesWithElements.get(v.value)?.push(v.id)
        }
        return false
      } else {
        knownValuesWithElements.set(v.value, [v.id])
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
