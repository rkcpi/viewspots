import { expect } from 'chai'
import { Mesh } from '../src/mesh'
import { jsonStringToMesh } from '../src/mesh_json'

describe('Mesh', () => {
  let mesh: Mesh

  describe('A regular mesh', () => {
    beforeEach(() => {
      mesh = jsonStringToMesh(`
        {
          "nodes": [
            {"id": 0},
            {"id": 1},
            {"id": 2},
            {"id": 3},
            {"id": 4},
            {"id": 5}
          ],
          "elements": [
            {"id": 0, "nodes": [0, 1, 3]},
            {"id": 1, "nodes": [0, 2, 3]},
            {"id": 2, "nodes": [2, 3, 4]},
            {"id": 3, "nodes": [2, 4, 5]}
          ],
          "values": [
            {"element_id": 0, "value": 0.9},
            {"element_id": 1, "value": 0.8},
            {"element_id": 2, "value": 0.5},
            {"element_id": 3, "value": 1.0}
          ]
        }
      `)
    })

    it('finds all view spots', () => {
      const viewSpots = mesh.computeBestNViewSpots()

      expect(viewSpots).to.have.length(2)
      expect(viewSpots[0].element_id).to.be.equal(3)
      expect(viewSpots[1].element_id).to.be.equal(0)
    })

    it('finds best n view spots for n <= number of total viewspots', () => {
      const viewSpots = mesh.computeBestNViewSpots(1)

      expect(viewSpots).to.have.length(1)
      expect(viewSpots[0].element_id).to.be.equal(3)
    })

    it('finds all view spots if n > number of total viewspots', () => {
      const viewSpots = mesh.computeBestNViewSpots(3)

      expect(viewSpots).to.have.length(2)
      expect(viewSpots[0].element_id).to.be.equal(3)
      expect(viewSpots[1].element_id).to.be.equal(0)
    })
  })

  describe('A plane mesh', () => {
    beforeEach(() => {
      mesh = jsonStringToMesh(`
        {
          "nodes":[
            {"id": 0},
            {"id": 1},
            {"id": 2},
            {"id": 3},
            {"id": 4},
            {"id": 5}
          ],
          "elements": [
            {"id": 0, "nodes": [0, 1, 3]},
            {"id": 1, "nodes": [0, 2, 3]},
            {"id": 2, "nodes": [2, 3, 4]},
            {"id": 3, "nodes": [2, 4, 5]}
          ],
          "values": [
            {"element_id": 0, "value": 0},
            {"element_id": 1, "value": 0},
            {"element_id": 2, "value": 0},
            {"element_id": 3, "value": 0}
          ]
        }
      `)
    })

    it('finds two view spots', () => {
      const viewSpots = mesh.computeBestNViewSpots()

      expect(viewSpots).to.have.length(2)
      expect(viewSpots.map(v => v.element_id)).to.contain.members([0, 3])
    })
  })

  describe('A mesh with viewspots with same value', () => {
    beforeEach(() => {
      mesh = jsonStringToMesh(`
        {
          "nodes":[
            {"id": 0},
            {"id": 1},
            {"id": 2},
            {"id": 3},
            {"id": 4},
            {"id": 5}
          ],
          "elements": [
            {"id": 0, "nodes": [0, 1, 3]},
            {"id": 1, "nodes": [0, 2, 3]},
            {"id": 2, "nodes": [2, 3, 4]},
            {"id": 3, "nodes": [2, 4, 5]}
          ],
          "values": [
            {"element_id": 0, "value": 1.0},
            {"element_id": 1, "value": 0.8},
            {"element_id": 2, "value": 0.5},
            {"element_id": 3, "value": 1.0}
          ]
        }
      `)
    })

    it('finds two view spots', () => {
      const viewSpots = mesh.computeBestNViewSpots()

      expect(viewSpots).to.have.length(2)
      expect(viewSpots.map(v => v.element_id)).to.contain.members([0, 3])
    })
  })
})
