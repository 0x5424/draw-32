/**
 * Utils for parsing values from `instruction.ts`. Necessary for undo/redo functions, and replaying instructions
 */
import type { DirectionText } from '../stores'

import type {
  PatternInstruction, InsertInstruction, CoordinatesTuple, StrokeMode, ColorIndex,
  PatternOffset
} from './instruction'

import { decodeRleAsTuple } from './encode'

type InstructionName =
  'commitInsertDraw' |
  'commitPatternDraw' |
  'commitRotate' |
  'commitColor' |
  'commitFill' |
  'commitJump' |
  'commitStrokeMode';

type InstructionArg = PatternInstruction | InsertInstruction | DirectionText | CoordinatesTuple | StrokeMode | ColorIndex

/** @todo R&D some magic with `infer` to make `arg` safer */
interface InstructionObject {
  name: InstructionName,
  arg: InstructionArg | null
}

const throwInvalidBitstreamError = (stream: string, pc: number, toRead = 1): never => {
  const rangeMessage = toRead > 1 ? `between ${pc}-${pc + toRead} are` : `at index ${pc} is`
  const values = stream.slice(pc, pc + toRead)

  throw new Error(`bitstream values ${rangeMessage} invalid; (Got ${values}, expected 0 | 1)`)
}

/**
 * Given a raw bitstream `[0-1]*` and program counter, parse the instruction at the given index
 */
type ParseInstructionArgs = [stream: string, pc?: number]
export const discernInstructionName: (...a: ParseInstructionArgs) => [name: InstructionName, bitsRead: number] = (stream, pc) => {
  if (stream[pc] === '0') { // draw mode
    // pc + 1 is rotation
    if (stream[pc + 2] === '0') return ['commitPatternDraw', 3]
    if (stream[pc + 2] === '1') return ['commitInsertDraw', 3]
    throwInvalidBitstreamError(stream, pc + 2)
  } else if (stream[pc] === '1') { // interrupt
    const offset = pc + 1

    if (stream[offset] === '0') return ['commitRotate', 2]
    if (stream.slice(offset, offset + 2) === '10') return ['commitColor', 3]
    if (stream.slice(offset, offset + 3) === '110') return ['commitFill', 4]
    if (stream.slice(offset, offset + 3) === '111') return ['commitJump', 4]
    throwInvalidBitstreamError(stream, offset, 3)
  }

  throwInvalidBitstreamError(stream, pc)
}

const binToInt = (stream: string, offset: number, numBits: number) => parseInt(stream.slice(offset, offset + numBits), 2)

const discernArg: (...a: [InstructionName, ...ParseInstructionArgs]) => [arg: InstructionArg | null, bitsRead: number] = (name, stream, pc) => {
  if (name === 'commitFill') return [null, 0] // 1110() ; None read after initial discriminator
  if (name === 'commitColor') return [binToInt(stream, pc, 4) as ColorIndex, 4]
  if (name === 'commitRotate') {
    const table: Record<string, DirectionText> = {
      '00': 'UP',
      '01': 'RIGHT',
      '10': 'DOWN',
      '11': 'LEFT'
    }
    const dir = table[stream.slice(pc, pc + 2)]

    if (!dir) throwInvalidBitstreamError(stream, pc, 2)

    return [dir, 2]
  }
  if (name === 'commitJump') {
    const [x, xRead] = decodeRleAsTuple(stream, pc)
    const [y, yRead] = decodeRleAsTuple(stream, pc + xRead)

    return [[x, y], xRead + yRead]
  }
  if (name === 'commitInsertDraw') {
    const cw = stream[pc - 2] === '0' ? true : false
    const [length, bitsRead] = decodeRleAsTuple(stream, pc)

    return [{cw, length}, bitsRead]
  }
  if (name === 'commitPatternDraw') {
    const cw = stream[pc - 2] === '0' ? true : false
    let offset = pc + 0
    const p1Length = binToInt(stream, offset, 2) + 0b1 as PatternOffset
    offset += 2
    const p2Offset = binToInt(stream, offset, 2) + 0b1 as PatternOffset
    offset += 2
    const [patternLength, patternBitsRead] = decodeRleAsTuple(stream, offset)
    offset += patternBitsRead
    const pattern = stream.slice(offset, offset + patternLength)

    const bitsRead = (offset + patternLength) - pc

    return [{cw, p1Length, p2Offset, pattern}, bitsRead]
  }

  throw new Error(`Invalid name provided (Got ${name})`) // Shouldn't happen if ts compiled 🤨
}

export const parseInstruction: (...a: ParseInstructionArgs) => [InstructionObject, number] = (stream, pc = 0) => {
  // Only exception to parsing: pc===0 will only be `commitStrokeMode`
  if (pc === 0) return [{name: 'commitStrokeMode', arg: parseInt(stream[1], 2) as 0 | 1}, 2]

  // Else, parsing logic works as expected
  const [name, instructionBitsRead] = discernInstructionName(stream, pc)
  pc += instructionBitsRead
  const [arg, argBitsRead] = discernArg(name, stream, pc)

  return [{name, arg}, instructionBitsRead + argBitsRead]
}

/**
 * Normalize a hex string (with or without a prefixed `0x`) to a string comprised of binary digits
 */
const hexStringToBinString = (str: string) => {
  if (!str.startsWith('0x')) str = `0x${str}`

  return BigInt(str).toString(2)
}

/** Take raw instruction arg (in bin or hex format) and convert to InstructionObject ary */
export const parseInstructionStream = (instructions: string): InstructionObject[] => {
  if (!/^[0-1]{2,255}$/.test(instructions)) {
    if (!/^(0x)?([0-9]|[a-f]){2,64}$/.test(instructions)) throw new Error(`Invalid instructions: ${instructions}`)

    instructions = hexStringToBinString(instructions)
  }

  let pc = 0
  const out = []

  // Iterate while we have a value at the program counter index
  for (; !!instructions[pc];) {
    const [instr, bitsRead] = parseInstruction(instructions, pc)
    pc += bitsRead

    out.push(instr)
  }

  return out
}
