import { readFile } from './files'
import { jsonToMesh } from './mesh_json'

const fileName = process.argv[2]
const numberOfDesiredViewSpots = parseInt(process.argv[3])

const startTimeParsing = Date.now()
const json = readFile(fileName)
const mesh = jsonToMesh(json)
const parsingTime = Date.now() - startTimeParsing

const startTimeCalculation = Date.now()
const viewSpots = mesh.computeBestNViewSpots(numberOfDesiredViewSpots)
const calculationTime = Date.now() - startTimeCalculation

console.log(JSON.stringify(viewSpots.map(e => {
  return { element_id: e.id, value: e.value }
}), null, 2))

console.warn(`Total time: ${parsingTime + calculationTime}ms`)