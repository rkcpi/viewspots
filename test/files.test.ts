import { expect } from 'chai'
import { join } from 'path'
import { readFile } from '../src/files'

describe('Files', () => {
  it('can read a file', () => {
    const content = readFile(join(__dirname, '../testresources/testfile.txt'))
    expect(content).to.equal('potato')
  })
})
