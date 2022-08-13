import { Mesh } from './mesh'

export const jsonToMesh = (json: string): Mesh => {
  const sanityCheck = process.env['SANITY_CHECK'] === 'true'
  const parsedJson = JSON.parse(json)
  return new Mesh(parsedJson.nodes, parsedJson.elements, parsedJson.values, sanityCheck)
}
