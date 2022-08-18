import { Mesh } from './mesh'

export const jsonStringToMesh = (json: string): Mesh => {
  const sanityCheck = process.env['SANITY_CHECK'] === 'true'
  const parsedJson = JSON.parse(json)
  if (
    parsedJson === undefined ||
    parsedJson.nodes === undefined ||
    parsedJson.values === undefined
  ) {
    throw new Error('The given json does not have the expected structure')
  }
  return new Mesh(
    parsedJson.nodes,
    parsedJson.elements,
    parsedJson.values,
    sanityCheck
  )
}
