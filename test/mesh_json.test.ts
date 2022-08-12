import { expect } from 'chai'
import { jsonToMesh } from '../src/mesh_json'
import { Mesh } from '../src/mesh'

describe('Mesh', () => {
  it('can be constructed from json', () => {
    const json = `
      {
        "nodes": [
          {"id": 0, "x": 0.0, "y": 0.0},
          {"id": 1, "x": 1.0, "y": 0.0},
          {"id": 2, "x": 1.0, "y": 1.0}
        ],
        "elements": [
          {"id": 10, "nodes": [0,1,2]}
        ],
        "values": [
          {"element_id": 10, "value": 0.125}
        ]
      }
    `
    const mesh = jsonToMesh(json)
    expect(mesh instanceof Mesh).to.be.true
  })

  it('cannot be constructed from invalid json', () => {
    const json = `
      {
        "nodes": [
          {"id": 0, "x": 0.0, "y": 0.0},
          {"id": 1, "x": 1.0, "y": 0.0},
          {"id": 2, "x": 1.0, "y": 1.0}
        ],
        "elements": [
          {"id": 10, "nodes": [0,1,20]}
        ],
        "values": [
          {"element_id": 10, "value": 0.125}
        ]
      }
    `
    expect(() => jsonToMesh(json)).to.throw(Error)
  })
})