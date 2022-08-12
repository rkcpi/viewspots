import { Mesh, MeshNode, MeshElement, MeshValue } from './mesh'

export const jsonToMesh = (json: string): Mesh => {
  const parsedJson = JSON.parse(json)
  return new Mesh(
    toMeshNodes(parsedJson.nodes),
    toMeshElements(parsedJson.elements),
    toMeshValues(parsedJson.values)
  )
}

const toMeshNodes = (nodes: any[]): MeshNode[] =>
  nodes.map((node)=> new MeshNode(node.id, node.x, node.y))

const toMeshElements = (elements: any[]): MeshElement[] =>
  elements.map((element)=> new MeshElement(element.id, element.nodes))

const toMeshValues = (values: any[]): MeshValue[] =>
  values.map((value)=> new MeshValue(value.element_id, value.value))