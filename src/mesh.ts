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

  private elementNeighbourhoods(): Map<number, Set<MeshElement>> {
    const nodeToElements = new Map<number, MeshElement[]>()
    this.nodes.forEach((node: MeshNode) => {
      const adjacentElements = this.elements.filter((e) => e.nodes.includes(node.id))
      nodeToElements.set(node.id, adjacentElements)
    })

    const elementToNeighbours = new Map<number, Set<MeshElement>>()
    this.elements.forEach(e => {
      const elementNeighbours = new Set<MeshElement>()
      e.nodes
        .flatMap((n) => nodeToElements.get(n))
        .forEach((el) => {if (el !== undefined && el !== e) elementNeighbours.add(el)})
        elementToNeighbours.set(e.id, elementNeighbours)
    })
    return elementToNeighbours
  }

  private checkIfElementIsViewSpotInItsNeighbourHood(neighborhoods: Map<number, Set<MeshElement>>) {
    const elementToViewSpotStatus = new Map<number, boolean>()
    neighborhoods.forEach((neighbours, elementId) => {
      const elementValue = this.getValueForElement(elementId)
      const max = Array.from(neighbours).reduce((prev, current) => {
        if (this.getValueForElement(prev.id) > this.getValueForElement(current.id)) {
          return prev
        } else {
          return current
        }
      })
      elementToViewSpotStatus.set(elementId, elementValue >= this.getValueForElement(max.id))
    })
    return elementToViewSpotStatus
  }

  private killMultiples(allViewSpots: MeshValue[], neighborhoods: Map<number, Set<MeshElement>>): MeshValue[] {
    if (allViewSpots.length === new Set<number>(allViewSpots.map(v => v.value)).size) {
      console.log('everything unique')
      return allViewSpots
    } else {
      console.log('not so very unique')
      const copy = Array.from(allViewSpots)
      for (let index = 0; index < allViewSpots.length -1; index++) {
        const element = allViewSpots[index];
        const nextElement = allViewSpots[index + 1]
        if (element.value === nextElement.value) {
          const neighbours = neighborhoods.get(element.element_id)
          if (neighbours !== undefined && Array.from(neighbours).find(n => n.id == nextElement.element_id)) {
            copy.splice(copy.indexOf(nextElement), 1)
          }
        }
      }
      return copy
    }
  }

  computeBestNViewSpots(n: number) {
    const neighborhoods = this.elementNeighbourhoods()
    const elementsAreViewSpots = this.checkIfElementIsViewSpotInItsNeighbourHood(neighborhoods)
    const allViewSpots = this.values.filter(v => elementsAreViewSpots.get(v.element_id)).sort((a, b) => b.value - a.value)
    if (isNaN(n)) {
      return allViewSpots
    } else {
      return allViewSpots.slice(0, n)
    }
  }
}
