import { encodeRle } from './encode'

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
 * - `****` = 4 bits; Upper are length/size of P1, Lower are length/size of P2
 * - `N` = Variable; RLE encoded length of pattern to insert
 * - `N` = Variable; Bitstream instructions read sequentially, wherein 0 inserts P1, 1 inserts P2
 */
interface PatternInstruction {
  cw: boolean;
  p1Length: 1 | 2 | 3 | 4;
  p2Length: 2 | 3 | 4 | 5;
  patternLength: number;
  pattern: string;
}

export const commitInsertDraw = (instruction: InsertInstruction) => {
  const rotation = instruction.cw ? '0' : '1'

  return ['0', rotation, '1', encodeRle(instruction.length)].join('')
}
export const commitPatternDraw = (instruction: PatternInstruction) => {}

/**
 * @todo Revisit after headers documented
 */
const commitJump = () => {}
