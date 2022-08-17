import { assert, expect } from 'chai'
import { ValueMeshElement, Mesh } from '../src/mesh'
import { jsonToMesh } from '../src/mesh_json'

describe('Mesh', () => {
  let mesh: Mesh

  describe('A regular mesh', () => {
    beforeEach(() => {
      mesh = jsonToMesh(`
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

    it('finds all elements connected to a node', () => {
      const nodesWithElements = mesh.findNodesWithTheirAdjacentElements()

      expectNodeHasElements(nodesWithElements, 0, [0, 1])
      expectNodeHasElements(nodesWithElements, 1, [0])
      expectNodeHasElements(nodesWithElements, 2, [1, 2])
      expectNodeHasElements(nodesWithElements, 3, [0, 1, 2])
      expectNodeHasElements(nodesWithElements, 4, [2])
      expectNodeHasElements(nodesWithElements, 5, [3])
    })

    it('finds elements\' neighbourhoods', () => {
      const neighbourhoods: Map<number, ValueMeshElement[]> =
        mesh.findNeighbourhoods(mesh.findNodesWithTheirAdjacentElements())

      expectElementHasNeighbours(0, neighbourhoods, [1, 2])
      expectElementHasNeighbours(1, neighbourhoods, [0, 2, 3])
      expectElementHasNeighbours(2, neighbourhoods, [1, 0, 3])
      expectElementHasNeighbours(3, neighbourhoods, [1, 2])
    })

    it('identifies view spots', () => {
      const neighbourhoods: Map<number, ValueMeshElement[]> =
        mesh.findNeighbourhoods(mesh.findNodesWithTheirAdjacentElements())

      const elementsAreViewSpots =
        mesh.checkIfElementsAreViewSpots(neighbourhoods)

      expect(elementsAreViewSpots.get(0)).to.be.true
      expect(elementsAreViewSpots.get(1)).to.be.false
      expect(elementsAreViewSpots.get(2)).to.be.false
      expect(elementsAreViewSpots.get(3)).to.be.true
    })

    it('filters and sorts view spots', () => {
      const neighbourhoods: Map<number, ValueMeshElement[]> =
        mesh.findNeighbourhoods(mesh.findNodesWithTheirAdjacentElements())
      const elementsAreViewSpots =
        mesh.checkIfElementsAreViewSpots(neighbourhoods)

      const viewSpots = mesh.filterAndSortViewSpots(elementsAreViewSpots)

      expect(viewSpots).to.have.length(2)
      expect(viewSpots[0].id).to.be.equal(3)
      expect(viewSpots[1].id).to.be.equal(0)
    })

    it('finds all view spots', () => {
      const viewSpots = mesh.computeBestNViewSpots()

      expect(viewSpots).to.have.length(2)
      expect(viewSpots[0].id).to.be.equal(3)
      expect(viewSpots[1].id).to.be.equal(0)
    })

    it('finds best n view spots for n <= number of total viewspots', () => {
      const viewSpots = mesh.computeBestNViewSpots(1)

      expect(viewSpots).to.have.length(1)
      expect(viewSpots[0].id).to.be.equal(3)
    })

    it('finds all view spots if n > number of total viewspots', () => {
      const viewSpots = mesh.computeBestNViewSpots(3)

      expect(viewSpots).to.have.length(2)
      expect(viewSpots[0].id).to.be.equal(3)
      expect(viewSpots[1].id).to.be.equal(0)
    })
  })

  describe('A plane mesh', () => {
    beforeEach(() => {
      mesh = jsonToMesh(`
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
      expect(viewSpots.map(v => v.id)).to.contain.members([0, 3])
    })
  })

  describe('A mesh with viewspots with same value', () => {
    beforeEach(() => {
      mesh = jsonToMesh(`
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
      expect(viewSpots.map(v => v.id)).to.contain.members([0, 3])
    })
  })

  const expectNodeHasElements = (
    nodesWithElements: Map<number, Set<ValueMeshElement>>,
    nodeId: number,
    expectedElements: number[]
  ) => {
    expect(
      (Array.from(nodesWithElements.get(nodeId) || assert.fail())).map((e) => e.id)
    ).to.include.members(expectedElements)
  }

  const expectElementHasNeighbours = (
    elementId: number,
    neighbourhoods: Map<number, ValueMeshElement[]>,
    expectedNeighbours: number[]
  ) => {
    const neighbours = neighbourhoods.get(elementId) || assert.fail()
    expect(neighbours.map((e) => e.id)).to.include.members(expectedNeighbours)
  }
})
