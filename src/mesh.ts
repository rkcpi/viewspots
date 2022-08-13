interface MeshNode {
  id: number
  x: number
  y: number
}

interface MeshElement {
  id: number
  nodes: number[]
}

class ValueMeshElement {
  id: number
  nodes: number[]
  value: number

  constructor(id: number, nodes: number[], value: number) {
    this.id = id
    this.nodes = nodes
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
      // Check validity of node references in elements
      elements.forEach((element) => {
        element.nodes.forEach((elementNode) => {
          if (!nodes.some((node) => node.id === elementNode)) {
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

    const elementToValue = new Map(values.map((v) => [v.element_id, v.value]))

    this.nodes = nodes
    this.elements = elements.map(
      // @ts-ignore
      (e) => new ValueMeshElement(e.id, e.nodes, elementToValue.get(e.id))
    )
    this.elementIdsToElements = new Map(this.elements.map((e) => [e.id, e]))
  }

  computeBestNViewSpots(n: number) {
    const nodesWithTheirAdjacentElements = new Map(
      this.nodes.map((n) => [
        n.id,
        this.elements.filter((e) => e.nodes.includes(n.id)),
      ])
    )
    // @ts-ignore
    const elementsWithTheirNeighbourhoods: [number, ValueMeshElement[]][] =
      this.elements.map((currentElement) => {
        return [
          currentElement.id,
          currentElement.nodes
            .flatMap((n) => nodesWithTheirAdjacentElements.get(n))
            .filter((e) => e !== undefined && e !== currentElement),
        ]
      })
    const elementsAreViewSpots = new Map(
      elementsWithTheirNeighbourhoods.map((elementWithNeighbours) => {
        const currentElementId = elementWithNeighbours[0]
        const maxNeighbour = elementWithNeighbours[1].reduce((prev, current) =>
          prev.value > current.value ? prev : current
        )
        const currentElementValue =
          this.elementIdsToElements.get(currentElementId)?.value
        // @ts-ignore
        return [currentElementId, currentElementValue >= maxNeighbour.value]
      })
    )
    const allViewSpots = this.elements
      .filter((e) => elementsAreViewSpots.get(e.id))
      .sort((a, b) => b.value - a.value)
    return isNaN(n) ? allViewSpots : allViewSpots.slice(0, n)
  }
}
