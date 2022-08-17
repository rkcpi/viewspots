import { expect } from 'chai'
import { jsonStringToMesh } from '../src/mesh_json'
import { Mesh } from '../src/mesh'

describe('Mesh (json)', () => {
  before(() => {
    process.env['SANITY_CHECK'] = 'true'
  })

  after(() => {
    process.env['SANITY_CHECK'] = undefined
  })

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
    const mesh = jsonStringToMesh(json)
    expect(mesh instanceof Mesh).to.be.true
  })

  it('cannot be constructed from invalid json', () => {
    expect(() => jsonStringToMesh('{}')).to.throw(Error)
    expect(() => jsonStringToMesh('[]')).to.throw(Error)
  })

  it('cannot be constructed from invalid json (invalid node reference)', () => {
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
    expect(() => jsonStringToMesh(json)).to.throw(Error)
  })

  it('cannot be constructed from invalid json (invalid element reference)', () => {
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
          {"element_id": 20, "value": 0.125}
        ]
      }
    `
    expect(() => jsonStringToMesh(json)).to.throw(Error)
  })
})
