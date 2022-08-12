import { readFileSync } from 'fs'

export const readFile = (fileName: string): string => {
  return readFileSync(fileName, 'utf-8')
}
