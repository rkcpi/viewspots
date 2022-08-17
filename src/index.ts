import { readFile } from './files'
import { jsonToMesh } from './mesh_json'

const fileName = process.argv[2]

if (!fileName) {
  console.error('There was an error: You need to specify a json mesh file as first parameter.')
  process.exit(1)
}
const numberOfDesiredViewSpots = parseInt(process.argv[3])

try {
  const json = readFile(fileName)
  const mesh = jsonToMesh(json)
  const viewSpots = mesh.computeBestNViewSpots(numberOfDesiredViewSpots)

  console.log(
    JSON.stringify(
      viewSpots.map((viewSpot) => {
        return { element_id: viewSpot.id, value: viewSpot.value }
      }),
      null,
      2
    )
  )
} catch (e) {
  console.error(`There was an error: ${(e as Error).message}.`)
  process.exit(1)
}
