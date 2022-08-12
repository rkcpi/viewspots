import { readFile } from './files'
import { jsonToMesh } from './mesh_json'

const fileName = process.argv[2]

const json = readFile(fileName)
const mesh = jsonToMesh(json)
console.log(mesh)