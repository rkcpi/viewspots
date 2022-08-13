import { expect } from 'chai'
import { MeshElement, MeshNode, MeshValue, Mesh } from '../src/mesh'

describe('Mesh', () => {
  it('can construct nodes', () => {
    const node = new MeshNode(0, 1.0, 0.0)

    expect(node.id).to.equal(0)
    expect(node.x).to.equal(1.0)
    expect(node.y).to.equal(0.0)
  })

  it('can construct elements', () => {
    const element = new MeshElement(0, [42, 43, 44])

    expect(element.id).to.equal(0)
    expect(element.nodes).to.eql([42, 43, 44])
  })

  it('can construct values', () => {
    const value = new MeshValue(0, 0.125)

    expect(value.element_id).to.equal(0)
    expect(value.value).to.equal(0.125)
  })

  it('can construct a valid mesh', () => {
    const node1 = new MeshNode(0, 0.0, 0.0)
    const node2 = new MeshNode(1, 1.0, 0.0)
    const node3 = new MeshNode(2, 0.0, 1.0)
    const element = new MeshElement(10, [0, 1, 2])
    const value = new MeshValue(10, 0.125)
    const mesh = new Mesh([node1, node2, node3], [element], [value], true)

    expect(mesh.nodes).to.eql([node1, node2, node3])
    expect(mesh.elements).to.eql([element])
    expect(mesh.values).to.eql([value])
  })

  it('cannot construct an invalid mesh with wrong node reference', () => {
    const node1 = new MeshNode(0, 0.0, 0.0)
    const node2 = new MeshNode(1, 1.0, 0.0)
    const node3 = new MeshNode(2, 0.0, 1.0)
    const element = new MeshElement(10, [0, 1, 200000])
    const value = new MeshValue(10, 0.125)
    expect( () => {
      new Mesh([node1, node2, node3], [element], [value], true)
    }).to.throw( Error )
  })


  it('cannot construct an invalid mesh with wrong element reference', () => {
    const node1 = new MeshNode(0, 0.0, 0.0)
    const node2 = new MeshNode(1, 1.0, 0.0)
    const node3 = new MeshNode(2, 0.0, 1.0)
    const element = new MeshElement(10, [0, 1, 2])
    const value = new MeshValue(100000, 0.125)
    expect( () => {
      new Mesh([node1, node2, node3], [element], [value], true)
    }).to.throw( Error )
  })
})
