import { encodeRle } from './encode'

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
  p1Length: 1 | 2 | 3 | 4;
  p2Length: 2 | 3 | 4 | 5;
  pattern: string;
}


export const commitInsertDraw = (instruction: InsertInstruction): string => {
  const rotation = instruction.cw ? '0' : '1'

  return ['0', rotation, '1', encodeRle(instruction.length)].join('')
}

export const commitPatternDraw = (instruction: PatternInstruction) => {
  const { p1Length, p2Length, pattern } = instruction

  const rotation = instruction.cw ? '0' : '1'
  // 00 | 01 | 10 | 11
  const p1 = (p1Length - 1).toString(2).padStart(2, '0')
  const p2 = (p2Length - 2).toString(2).padStart(2, '0')
  const patternLength = encodeRle(pattern.length)

  return ['0', rotation, '0', p1, p2, patternLength, pattern].join('')
}

export type Direction = 'LEFT' | 'DOWN' | 'RIGHT' | 'UP'
/**
 * @todo Use Util Types here to infer/auto-omit `current` value as valid for newDirection; Omit<> or Exclude<>
 */
export const commitRotate = (current: Direction, newDirection?: Direction) => {
  if (current === newDirection) throw new Error('Same direction; No-op')

  // If newDirection omitted, assume simple CW rotation
  if (!newDirection) return '1'

  return {
    UP: {
      RIGHT: '1',
      DOWN: '11',
      LEFT: '111'
    },
    RIGHT: { DOWN: '1', LEFT: '11', UP: '111' },
    DOWN: { LEFT: '1', UP: '11', RIGHT: '111' },
    LEFT: { UP: '1', RIGHT: '11', DOWN: '111' },
  }[current][newDirection]
}

/**
 * @todo Revisit after headers documented
 */
// const commitJump = () => {}
