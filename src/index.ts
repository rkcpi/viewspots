import { readFile } from './files'
import { jsonToMesh } from './mesh_json'

const fileName = process.argv[2]
const numberOfDesiredViewSpots = parseInt(process.argv[3])

const json = readFile(fileName)
const mesh = jsonToMesh(json)

const viewSpots = mesh.computeBestNViewSpots(numberOfDesiredViewSpots)

console.log(JSON.stringify(viewSpots.map(e => {
  return { element_id: e.id, value: e.value }
}), null, 2))
