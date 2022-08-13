export class MeshNode {
  id: number
  x: number
  y: number

  constructor(id: number, x: number, y: number) {
    this.id = id
    this.x = x
    this.y = y
  }
}

export class MeshElement {
  id: number
  nodes: number[]

  constructor(id: number, nodes: number[]) {
    this.id = id
    this.nodes = nodes
  }
}

export class MeshValue {
  element_id: number
  value: number

  constructor(element_id: number, value: number) {
    this.element_id = element_id
    this.value = value
  }
}

export class Mesh {
  nodes: MeshNode[]
  elements: MeshElement[]
  values: MeshValue[]
  elementToValue: Map<number, number>

  constructor(nodes: MeshNode[], elements: MeshElement[], values: MeshValue[], sanityCheck: boolean = false) {
    if (sanityCheck) {
      // Check validity of node references in elements
      elements.forEach((element) => {
        element.nodes.forEach((elementNode) => {
          if (! nodes.some((node) => node.id === elementNode)) {
            throw new Error(`Element ${element.id} refers to unknown node with id ${elementNode}`)
          }
        })
      })

      // Check validity of element references in values
      values.forEach((value) => {
        if (! elements.some((element) => element.id === value.element_id)) {
          throw new Error(`Value refers to unknown element with id ${value.element_id}`)
        }
      })
    }

    this.nodes = nodes
    this.elements = elements
    this.values = values
    this.elementToValue = new Map<number, number>()
    values.forEach(v => this.elementToValue.set(v.element_id, v.value))
  }

  private getValueForElement(id: number) {
    const value = this.elementToValue.get(id)
    if (value === undefined) {
      return Number.NEGATIVE_INFINITY
    } else {
      return value
    }
  }

  computeBestNViewSpots(n: number) {
    const nodesWithTheirAdjacentElements = new Map<number, MeshElement[]>()
    this.nodes.forEach(n => {
      const adjacentElements = this.elements.filter(e => e.nodes.includes(n.id))
      nodesWithTheirAdjacentElements.set(n.id, adjacentElements)
    })
    const elementsWithTheirNeighbourhoods = new Map<number, Set<MeshElement>>()
    this.elements.forEach(currentElement => {
      const neighboursForThisElement = new Set<MeshElement>()
      currentElement.nodes
        .flatMap(n => nodesWithTheirAdjacentElements.get(n))
        .forEach(e => { if (e !== undefined && e !== currentElement) neighboursForThisElement.add(e) })
        elementsWithTheirNeighbourhoods.set(currentElement.id, neighboursForThisElement)
    })
    const elementsAreViewSpots = new Map<number, boolean>()
    elementsWithTheirNeighbourhoods.forEach((neighbours, currentElementId) => {
      const maxNeighbour = Array.from(neighbours).reduce((prev, current) => this.getValueForElement(prev.id) > this.getValueForElement(current.id) ? prev : current)
      const currentElementValue = this.getValueForElement(currentElementId)
      const maxNeighbourValue = this.getValueForElement(maxNeighbour.id)
      elementsAreViewSpots.set(currentElementId, currentElementValue >= maxNeighbourValue)
    })
    const allViewSpots = this.values.filter(v => elementsAreViewSpots.get(v.element_id)).sort((a, b) => b.value - a.value)
    return isNaN(n) ? allViewSpots : allViewSpots.slice(0, n)
  }
}
