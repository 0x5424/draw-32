/** @todo Consider TS template literal for return types here */

import { encodeRle } from './encode'
import { InstructionObject, parseInstructionStream, formatInstruction } from './parse'
import {
  DirectionText, DirectionArrow, CanvasLike, ExecutableStores,
  getCurrentStoreValue
} from '../stores'
import { PALETTE } from './palette'

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

/**
 * Raw format: (1, 111, N, N)
 *
 * - `1` = Constant 1; "Command subroutine"
 * - `111` = Constant 111; "Move cursor/jump"
 * - `N` = Variable; RLE encoded X coordinate
 * - `N` = Variable; RLE encoded Y coordinate
 */
export type CoordinatesTuple = [x: number, y: number]
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

/**
 * Execute the specified instruction, modifying canvas state; Does not modify instruction state
 *
 * @see {@link performLoad | Function to modify instruction state}
 */
const execInstruction = (instruction: InstructionObject, stores: ExecutableStores) => {
  const { name, arg } = instruction

  if (name === 'commitStrokeMode') return stores.strokeModeStore.set(arg as StrokeMode)
  if (name === 'commitColor') return stores.colorStore.set(PALETTE[arg as ColorIndex])
  if (name === 'commitRotate') {
    const { directionStore, prevDirectionStore } = stores
    /** @todo Make directionArrow a derived store, directionText writable */
    const direction = (<const>{
      UP: '↑', RIGHT: '→', DOWN: '↓', LEFT: '←'
    })[arg as DirectionText]

    directionStore.set(direction)
    return prevDirectionStore.set(direction)
  }
  // All instructions beyond this point use cursorStore
  const { cursorXStore, cursorYStore, prevCursorStore } = stores

  if (name === 'commitJump') {
    const [x, y] = arg as CoordinatesTuple

    cursorXStore.set(x)
    cursorYStore.set(y)
    return prevCursorStore.set([x, y])
  }

  // Otherwise, we're performing a draw routine & we can DRY the logic to create toVisit
  const { drawModeStore } = stores
  const currentVisited = getCurrentStoreValue<CanvasLike>(stores.visitedStore)
  let newCursor: CoordinatesTuple = [
    getCurrentStoreValue<number>(cursorXStore),
    getCurrentStoreValue<number>(cursorYStore)
  ]

  if (name === 'commitFill') drawModeStore.set('fill')
  if (name === 'commitPatternDraw' || name === 'commitInsertDraw') {
    const { cw } = <InsertInstruction | PatternInstruction>arg
    stores.cwStore.set(cw)
  }

  if (name === 'commitInsertDraw') {
    const { length } = <InsertInstruction>arg

    drawModeStore.set('insert')
    stores.insertLengthStore.set(length)

    /**
     * @note Typecheck is to silence tsc, as empty array will never appear
     * @todo Ensure insertDraw[1] always returns next cursor (assume length always >= 1)
     */
    const possibleCursor = getCurrentStoreValue<[unknown, CoordinatesTuple | []]>(stores.insertCoordinatesStore)[1]
    if (possibleCursor.length === 0) throw new Error('Empty tuple received from InsertInstruction')

    newCursor = [...possibleCursor]
  }
  if (name === 'commitPatternDraw') {
    const { p1Length, p2Offset, pattern } = <PatternInstruction>arg

    drawModeStore.set('pattern')
    stores.patternOneLengthStore.set(p1Length)
    stores.patternTwoOffsetStore.set(p2Offset)
    stores.rawPatternStore.set(pattern)

    /** @note See above typecheck comment in commitInsertDraw */
    const possibleCursor = getCurrentStoreValue<[unknown, unknown, CoordinatesTuple | []]>(stores.patternCoordinatesStore)[2]
    if (possibleCursor.length === 0) throw new Error('Empty tuple received from PatternInstruction')

    newCursor = [...possibleCursor]
  }

  // Set visited
  const toVisit = getCurrentStoreValue<CanvasLike>(stores.toVisitStore)
  stores.visitedStore.set({...currentVisited, ...toVisit})

  // Lastly, update the cursor position & rotation (is redundant for commitFill)
  if (name === 'commitFill') return
  const { directionStore, prevDirectionStore } = stores
  const direction = getCurrentStoreValue<DirectionArrow>(directionStore)

  cursorXStore.set(newCursor[0])
  cursorYStore.set(newCursor[1])
  prevCursorStore.set(newCursor) // Location of last write
  prevDirectionStore.set(direction) // Location of last write
  if (name === 'commitInsertDraw') stores.insertLengthStore.set(1) // Reinitialize
  if (name === 'commitPatternDraw') stores.rawPatternStore.set('') // Reinitialize
}

/**
 * Reset the webapp state, and provide an optional new set of instructions to reload in it's place
 *
 * @todo Combine this with hard-coded constants
 *
 * @todo Persist `allSequences` store as InstructionObject[][], thus removing need to re-convert back to raw bitstream
 */
export const performReset = (stores: ExecutableStores, newState: string[] | false = false): void => {
  // 1. Parse instructions first, as to not reset app state before validating
  const allInstructions: InstructionObject[][] = []
  if (newState) newState.forEach(str => allInstructions.push(parseInstructionStream(str)))

  stores.visitedStore.set({})
  stores.cursorXStore.set(1)
  stores.cursorYStore.set(1)
  stores.colorStore.set('000000')
  stores.directionStore.set('→')
  stores.prevCursorStore.set([])
  stores.pastSequencesStore.set([])
  stores.currentInstructionBufferStore.set([])

  if (allInstructions.length > 0) performLoad(stores, allInstructions)
}

/**
 * The easiest way to ensure instruction parity is to sequentially re-parse everything from 0
 */
export const performLoad = (stores: ExecutableStores, toLoad: InstructionObject[][]): void => {
  // Init stores
  const { pastSequencesStore: past } = stores
  let pastState = getCurrentStoreValue<InstructionObject[][]>(past)

  // We must prepare new values for current/past _before_ calling the setter function, as we have no way to expand the Readable value from the store
  toLoad.forEach((sequence: InstructionObject[], i) => {
    appendSequences(stores, sequence)

    // Only set new pastState if we're _NOT_ on the final iteration of our instruction set
    if (toLoad.length - 1 !== i) pastState = [...pastState, sequence]
  })
  past.set(pastState)
}

/**
 * Append to `currentSequence` and `currentInstructionBuffer`
 *
 * @todo Clean this up; At present we cannot write to currentBuffer with instructions, we still use raw strings
 */
export const appendSequences = (stores: ExecutableStores, toAppend: InstructionObject[]): void => {
  const currentInstructions = stores.currentInstructionBufferStore
  const buffer = getCurrentStoreValue<string[]>(currentInstructions)

  console.log('Will append:', toAppend)
  console.log('Instructions before:', buffer)
  toAppend.forEach((obj) => {
    execInstruction(obj, stores)
    buffer.push(formatInstruction(obj)) // Re-formatting until @todo solved
  })
  console.log('After:', buffer)
  currentInstructions.set(buffer)
}
