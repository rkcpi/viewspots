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
    this.nodes = nodes
    this.elements = elements
    this.values = values
  }
}
