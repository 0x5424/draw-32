import { encodeRle } from './encode'
import type { DirectionText } from '../stores'

/**
 * @todo Consider TS template literal for return types here
 */

/**
 * Raw format: (0, *, 1, N)
 *
 * - `0` = Constant 0; "Draw subroutine"
 * - `*` = 1 bit; Rotation, cw/ccw
 * - `1` = Constant 1; "Insert mode"
 * - `N` = Variable; RLE encoded length to insert
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
 * @see {@link ./encode.ts#enodeRle}
 */
interface InsertInstruction {
  cw: boolean;
  length: number;
}

export type PatternOffset = 1 | 2 | 3 | 4;

/**
 * Raw format: (0, *, 0, ****, N, N)
 *
 * - `0` = Constant 0; "Draw subroutine"
 * - `*` = 1 bit; Rotation, cw/ccw
 * - `0` = Constant 0; "Pattern mode"
 * - `****` = 4 bits; Upper are length/size of P1, Lower are length/size of P2--only from 1-4 & 2-5 respectively
 * - `N` = Variable; RLE encoded length of pattern to insert
 * - `N` = Variable; Bitstream instructions read sequentially, wherein 0 inserts P1, 1 inserts P2
 */
export interface PatternInstruction {
  cw: boolean;
  p1Length: PatternOffset;
  p2Offset: PatternOffset;
  pattern: string;
}

export const commitInsertDraw = (instruction: InsertInstruction) => {
  const rotation = instruction.cw ? '0' : '1'

  return ['0', rotation, '1', encodeRle(instruction.length)].join('')
}

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

/**
 * Raw format: (1, 111, N, N)
 *
 * - `1` = Constant 1; "Command subroutine"
 * - `111` = Constant 111; "Move cursor/jump"
 * - `N` = Variable; RLE encoded X coordinate
 * - `N` = Variable; RLE encoded Y coordinate
 */
export const commitJump = (x: number, y: number) => {
  const xy = [x, y].map(encodeRle).join('')

  return ['1', '111', xy].join('')
}

/**
 * Raw format: ^(1, *)
 *
 * - `^` = This instruction only appears at the beginning of a new sequence (a header)
 * - `1` = Constant 1; Hard-coded hack to persist most significant bit
 * - `*` = Stroke size; `0`` = length 1, `1` = length 3
 */
export const commitStrokeMode = (mode: 0 | 1) => `1${mode}`

export interface PerformDrawArguments {
  drawInstruction: string;
  rotateInstruction?: string;
  jumpInstruction?: string;
}
export const performDraw = (instructions: PerformDrawArguments) => {
  const { drawInstruction, rotateInstruction, jumpInstruction } = instructions

  const output = [drawInstruction]

  if (rotateInstruction) output.unshift(rotateInstruction)
  if (jumpInstruction) output.unshift(jumpInstruction)

  return output.join('')
}
