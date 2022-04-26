/** @todo Consider TS template literal for return types here */

import { encodeRle, decodeRleAsTuple } from './encode'

export type DirectionText = 'LEFT' | 'DOWN' | 'RIGHT' | 'UP'

export type InstructionName =
  'commitInsertDraw' |
  'commitPatternDraw' |
  'commitRotate' |
  'commitColor' |
  'commitFill' |
  'commitJump' |
  'commitStrokeMode';

export type InstructionArg = PatternInstruction | InsertInstruction | DirectionText | CoordinatesTuple | StrokeMode | ColorIndex

/** @todo R&D some magic with `infer` to make `arg` safer */
export interface InstructionObject {
  name: InstructionName,
  arg: InstructionArg | null
}

export interface PatternInstruction {
  cw: boolean;
  p1Length: PatternOffset;
  p2Offset: PatternOffset;
  pattern: string;
}

export interface InsertInstruction {
  cw: boolean;
  length: number;
}

export type PatternOffset = 1 | 2 | 3 | 4;

/**
 * Raw format: (0, *, 1, N) - Minimum 5; VL = 00 (1)
 *
 * - `0` = Constant 0; "Draw subroutine"
 * - `*` = 1 bit; Rotation, cw/ccw
 * - `1` = Constant 1; "Insert mode"
 * - `VL` = Variable; RLE encoded length to insert (# bits always divisible by 2)
 *
 * @example The raw instruction `0111011` means:
 *   "Draw clockwise, using insert mode, 6 units"
 *
 * Assuming a rotation going RIGHT, this results in:
 * ```
 *   s.....
 *         e
 * ```
 * Where `s` is the cursor start position, `e` is the end position--now shifted "clockwise", relative to the N units inserted.
 *
 * @example Using 2 sequential inserts where p1,p2=(1|2) is 1 less bit than pattern mode:
 * ```
 * ins = '0*1**' // 5
 * `${ins}${ins}`.length === 10
 *
 * pattern = '0*0000001**'.length === 11
 * ```
 *
 * @example Comparing 3 sequential inserts where p1,p2=(1|2) to pattern mode:
 * ```
 * ins = '0*1**' // 5
 * `${ins}${ins}${ins}`.length === 15
 *
 * pattern = `0*000001000***`.length === 14
 * ```
 *
 * @example Comparing 2 sequential inserts where p1,p2=(4|[5-6]) to pattern mode:
 * ```
 * ins = '0*1****' // 7
 * `${ins}${ins}`.length === 14
 *
 * pattern = `0*011**01**`.length === 11
 * ```
 *
 * @example Comparing 2 sequential inserts where p1,p2=(1|[2-5]) to pattern mode:
 * ```
 * i1_2 = '0*1**' // 5
 * i3_4_5 = '0*1****' // 7
 * // insert*2: length is === 10 | 12
 *
 * pattern = `0*000**01**`.length === 11
 * ```
 *
 * * @example Comparing 3 sequential inserts where p1,p2=(1|[2-5]) to pattern mode:
 * ```
 * i1_2 = '0*1**' // 5
 * i3_4_5 = '0*1****' // 7
 * // insert*3: length is === 15 | 17 | 19
 *
 * pattern = `0*000**1000***`.length === 14
 * ```
 *
 * @note Due to above, pattern mode is generally suggested for:
 * - Sequences of 3 or greater
 * - Sequences of 2, where any of the members are larger than length 2
 *
 * @see {@link ./encode.ts#enodeRle}
 */
export const commitInsertDraw = (instruction: InsertInstruction) => {
  const rotation = instruction.cw ? '0' : '1'

  return ['0', rotation, '1', encodeRle(instruction.length)].join('')
}

/**
 * Raw format: (0, *, 0, ****, VL, N) - Minimum 10; VL = 00 (1) N = *
 *
 * - `0` = Constant 0; "Draw subroutine"
 * - `*` = 1 bit; Rotation, cw/ccw
 * - `0` = Constant 0; "Pattern mode"
 * - `****` = 4 bits; Upper are length/size of P1, Lower are length/size of P2--only from 1-4 & 2-5 respectively
 * - `VL` = Variable; RLE encoded length of pattern to insert (# bits always divisible by 2)
 * - `N` = Variable; Bitstream instructions read sequentially, wherein 0 inserts P1, 1 inserts P2
 */
export const commitPatternDraw = (instruction: PatternInstruction) => {
  const { p1Length, p2Offset, pattern } = instruction

  const rotation = instruction.cw ? '0' : '1'
  // 00 | 01 | 10 | 11
  const p1 = (p1Length - 1).toString(2).padStart(2, '0')
  const p2 = (p2Offset - 1).toString(2).padStart(2, '0')
  const patternLength = encodeRle(pattern.length)

  return ['0', rotation, '0', p1, p2, patternLength, pattern].join('')
}

/**
 * Raw format: (1, 0, **)
 *
 * - `1` = Constant 1; "Command subroutine"
 * - `0` = Constant 0; "Set rotation"
 * - `**` = 2 bits; U/R/D/L, mapped to 0,1,2,3 in binary
 */
export const commitRotate = (newDirection: DirectionText) => {
  const direction = {
    UP: '00',
    RIGHT: '01',
    DOWN: '10',
    LEFT: '11'
  }[newDirection]

  return ['1', '0', direction].join('')
}

type Bit = '0' | '1'
export type ColorIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15
type Nibble = `${Bit}${Bit}${Bit}${Bit}`

/**
 * Raw format: (1, 10, ****)
 *
 * - `1` = Constant 1; "Command subroutine"
 * - `10` = Constant 10; "Set color"
 * - `****` = 4 bits; Index # of the color in the palette (16 colors out of 16,777,216; Includes alpha)
 */
export const commitColor = (colorIndex: ColorIndex) => {
  const newColor = colorIndex.toString(2).padStart(4, '0') as Nibble

  return ['1', '10', newColor].join('')
}

/**
 * Raw format: (1, 110)
 *
 * - `1` = Constant 1; "Command subroutine"
 * - `110` = Constant 110; "Fill w/ current color"
 */
export const commitFill = () => '1110'

export type CoordinatesTuple = readonly [x: number, y: number]

/**
 * Raw format: (1, 111, N, N)
 *
 * - `1` = Constant 1; "Command subroutine"
 * - `111` = Constant 111; "Move cursor/jump"
 * - `N` = Variable; RLE encoded X coordinate
 * - `N` = Variable; RLE encoded Y coordinate
 */
export const commitJump: (...args: CoordinatesTuple) => string = (x, y) => {
  const xy = [x, y].map(encodeRle).join('')

  return ['1', '111', xy].join('')
}

export type StrokeMode = 0 | 1
/**
 * Raw format: ^(1, *)
 *
 * - `^` = This instruction only appears at the beginning of a new sequence (a header)
 * - `1` = Constant 1; Hard-coded hack to persist most significant bit
 * - `*` = Stroke size; `0`` = length 1, `1` = length 3
 */
export const commitStrokeMode = (mode: StrokeMode) => `1${mode}`

export interface PerformDrawArguments {
  drawInstruction: string;
  rotateInstruction?: string;
  jumpInstruction?: string;
}

/**
 * `perform` helpers to be used for DRYing webapp-specific actions -- not actual instructions
 */
export const performDraw = (instructions: PerformDrawArguments) => {
  const { drawInstruction, rotateInstruction, jumpInstruction } = instructions

  const output = [drawInstruction]

  if (rotateInstruction) output.unshift(rotateInstruction)
  if (jumpInstruction) output.unshift(jumpInstruction)

  return output.join('')
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
  for (; instructions[pc];) {
    const [instr, bitsRead] = parseInstruction(instructions, pc)
    pc += bitsRead

    out.push(instr)
  }

  return out
}

/**
 * @todo Remove when `allSequences` store is InstructionObject[][]
 *
 * @todo Safer typecasts, see InstructionObject
 *
 * @see {@link InstructionObject}
 */
export const formatInstruction = (obj: InstructionObject): string => {
  const { name, arg } = obj

  if (name === 'commitStrokeMode') return commitStrokeMode(arg as StrokeMode)
  if (name === 'commitPatternDraw') return commitPatternDraw(arg as PatternInstruction)
  if (name === 'commitInsertDraw') return commitInsertDraw(arg as InsertInstruction)
  if (name === 'commitRotate') return commitRotate(arg as DirectionText)
  if (name === 'commitColor') return commitColor(arg as ColorIndex)
  if (name === 'commitFill') return commitFill()
  if (name === 'commitJump') return commitJump(...arg as CoordinatesTuple)
}
