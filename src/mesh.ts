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

  constructor(nodes: MeshNode[], elements: MeshElement[], values: MeshValue[]) {
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

    this.nodes = nodes
    this.elements = elements
    this.values = values
  }
}
