/** @todo Clean-up, split stores into stores/*.ts and stores/index.ts */
import { writable, derived, Writable, Readable } from 'svelte/store'
import { PALETTE } from './util/palette'

import {
  PatternOffset, StrokeMode, CoordinatesTuple, InstructionObject, DirectionText, ColorIndex,
  PatternInstruction, InsertInstruction,
  parseInstructionStream, formatInstruction
} from './util/instruction'
import type { MatrixCell } from './util/matrix'

import {
  INCREMENTS,
  getNextCoordinatesFromDirection,
  getSurroundingCoordinates,
  getStrokeCells
} from './util/coordinates'

/** Helper fn to retrieve current store value, then immediately unsubscribe (lambda) */
export const getCurrentStoreValue = <T>(store: Readable<T>): T => {
  let value: T
  store.subscribe((currentValue) => {
    value = currentValue
  })()

  return value
}

interface Coordinates {
  x: number;
  y: number;
}

export type DirectionArrow = '←' | '↓' | '→' | '↑'
type RotationArrow ='↙' | '↘' | '↗' | '↖'
export type RotationText ='UP_LEFT' | 'UP_RIGHT' | 'DOWN_LEFT' | 'DOWN_RIGHT'

export const matrix: Writable<MatrixCell[][]> = writable([[]])

export const cursorX: Writable<number> = writable(1)
export const cursorY: Writable<number> = writable(1)

type CursorStore = [Readable<number>, Readable<number>]
export const cursor = derived<CursorStore, CoordinatesTuple>([cursorX, cursorY], ([$cursorX, $cursorY]) => [$cursorX, $cursorY] as CoordinatesTuple)
export const prevCursor: Writable<CoordinatesTuple | []> = writable([])

export const direction: Writable<DirectionArrow> = writable('→')
export const directionText = derived<Readable<DirectionArrow>, DirectionText>(direction, $direction => {
  if ($direction === '←') return 'LEFT'
  if ($direction === '↓') return 'DOWN'
  if ($direction === '→') return 'RIGHT'
  if ($direction === '↑') return 'UP'
  throw new Error('invalid direction set')
})
export const prevDirection: Writable<DirectionArrow | ''> = writable('')

export const cw: Writable<boolean> = writable(false)

type RotationStore = [Readable<DirectionText>, Readable<boolean>]
export const rotation = derived<RotationStore, RotationArrow>([directionText, cw], ([$directionText, $cw]) => {
  return {
    LEFT: {true: '↖', false: '↙'},
    DOWN: {true: '↙', false: '↘'},
    RIGHT: {true: '↘', false: '↗'},
    UP: {true: '↗', false: '↖'},
  }[$directionText][`${$cw}`] as RotationArrow
})
export const rotationText = derived<Readable<RotationArrow>, RotationText>(rotation, $rotation => {
  if ($rotation === '↖') return 'UP_LEFT'
  if ($rotation === '↗') return 'UP_RIGHT'
  if ($rotation === '↙') return 'DOWN_LEFT'
  if ($rotation === '↘') return 'DOWN_RIGHT'
  throw new Error('invalid rotation set')
})

export const directionIncrements = derived<Readable<DirectionText>, CoordinatesTuple>(directionText, $directionText => {
  return INCREMENTS[$directionText]
})

export const rotationIncrements = derived<Readable<RotationText>, CoordinatesTuple>(rotationText, $rotationText => {
  return INCREMENTS[$rotationText]
})

export type DrawMode = 'pattern' | 'insert' | 'fill'
export const drawMode: Writable<DrawMode> = writable('pattern')

/* Pattern controls */
export const patternOneLength: Writable<PatternOffset> = writable(1)
export const patternTwoOffset: Writable<PatternOffset> = writable(1)

type PatternTwoLength = 2 | 3 | 4 | 5 | 6 | 7 | 8
type PatternTwoLengthStore = [Readable<PatternOffset>, Readable<PatternOffset>]
export const patternTwoLength = derived<PatternTwoLengthStore, PatternTwoLength>([patternOneLength, patternTwoOffset], ([$patternOneLength, $patternTwoOffset]) => $patternOneLength + $patternTwoOffset as PatternTwoLength)

export const rawPattern: Writable<string> = (() => {
  let value = ''
  let subs = []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscribe = (handler: any) => {
    subs = [...subs, handler]
    handler(value)
    return () => subs = subs.filter(sub => sub !== handler)
  }

  // Custom `set` validation to only append 0 or 1 strings
  const set = (newSequence: string) => {
    if (!/^[01]+|$/.test(newSequence)) return

    value = newSequence
    subs.forEach(sub => sub(value))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update = (update: any) => set(update(value))

  return { subscribe, set, update }
})()

/* Canvas info */
type MatrixLike = MatrixCell[][]
export type CanvasLike = Record<string, string>
export const visited: Writable<CanvasLike> = writable({})
export const canvas = derived<[Readable<MatrixLike>, Readable<CanvasLike>], CanvasLike>([matrix, visited], ([$matrix, $visited]) => {
  // Output a new canvas with all visited cells set
  const out = {}
  const BG_COLOR = 'alpha' /** @todo Move to constant (hard-coded BACKGROUND_COLOR) */

  $matrix.forEach(row => {
    row.forEach(({ x, y }) => out[[x, y].join(':')] = $visited[[x, y].join(':')] || BG_COLOR)
  })

  return out
})

/* Color controls */
export const color: Writable<string> = writable('000000')

/* Insert controls */
export const insertLength: Writable<number> = writable(1)

/* Stroke controls */
export const strokeMode: Writable<StrokeMode> = writable(0)
type StrokeCellsStore = [
  Readable<StrokeMode>,
  Readable<CoordinatesTuple>,
  Readable<DirectionText>,
  Readable<CanvasLike>,
  Readable<string>,
]
export const strokeCells = derived<StrokeCellsStore, CoordinatesTuple[]>([strokeMode, cursor, directionText, visited, color], ([$strokeMode, $cursor, $directionText, $visited, $color]) => {
  const [x, y] = $cursor
  const args = {
    x, y,
    mode: $strokeMode,
    dir: $directionText,
    visited: $visited,
    color: $color,
  }

  return Object.values(getStrokeCells(args))
})

/* Fill info */
/** @todo Performance */
type FillCellsStore = [Readable<CoordinatesTuple>, Readable<MatrixLike>, Readable<string>, Readable<CanvasLike>]
const fillCells = derived<FillCellsStore, CanvasLike>([cursor, matrix, color, canvas], ([$cursor, $matrix, $color, $canvas]) => {
  const maxHeight = $matrix.length
  const maxWidth = $matrix[0].length
  // Guard clause for uninitialized matrix
  if (maxWidth === 0) return

  // Init output
  const out = {}
  const startColor: string = $canvas[$cursor.join(':')]

  // Normalize cursor, as the matrix will use 0-indexed values
  const currentX = $cursor[0] - 1
  const currentY = $cursor[1] - 1

  // Initialize the cells to check
  const initialCoordinates = [[currentX, currentY]] as CoordinatesTuple[]
  const recurse = (stack: CoordinatesTuple[]) => {
    if (stack.length === 0) return
    const [x, y] = stack.pop()

    Object.values(getSurroundingCoordinates(x, y)).forEach(([possibleX, possibleY]) => {
      if (possibleX < 0 || possibleY < 0) return // Underflow
      if (possibleX >= maxWidth || possibleY >= maxHeight) return // Overflow

      const possibleCoord = [possibleX + 1, possibleY + 1].join(':')
      if ($canvas[possibleCoord] !== startColor) return // New color
      if (out[possibleCoord]) return // Already included (identity)

      // Else, add to output hash & stack
      out[possibleCoord] = $color
      stack.push([possibleX, possibleY])
    })

    recurse(stack)
  }
  recurse(initialCoordinates)

  return out
})

type PatternCoordinatesStore = [
  Readable<CoordinatesTuple>, // Cursor
  Readable<DirectionText>,
  Readable<RotationText>,
  Readable<CoordinatesTuple>, // Increments
  Readable<PatternOffset>, // P1
  Readable<PatternTwoLength>, // P2
  Readable<string> // Raw pattern
]
export type PatternCoordinatesResult = [CoordinatesTuple[], CoordinatesTuple[], CoordinatesTuple | []]
export const patternCoordinates = derived<PatternCoordinatesStore, PatternCoordinatesResult>(
  [cursor, directionText, rotationText, directionIncrements, patternOneLength, patternTwoLength, rawPattern],
  ([$cursor, $directionText, $rotationText, $directionIncrements, $patternOneLength, $patternTwoLength, $rawPattern]) => {
    if ($rawPattern === '') return [[], [], []] as PatternCoordinatesResult

    let lastCoords: Coordinates
    let [pseudoX, pseudoY] = $cursor
    const [incX, incY] = $directionIncrements
    // NOTE: Must decrement pseudocursor by 1 in order to start pattern draw on proper coordinates
    pseudoX -= incX
    pseudoY -= incY
    const out: PatternCoordinatesResult = [[], [], []]

    $rawPattern.split('').forEach(bit => {
      const currentLength = bit === '0' ? $patternOneLength : $patternTwoLength

      for (let i = 0; i < currentLength; ++i) {
        lastCoords = getNextCoordinatesFromDirection($directionText, pseudoX, pseudoY)
        out[bit].push([lastCoords.x, lastCoords.y] as CoordinatesTuple)

        // For final iteration, skip cursor update (will be updated separately next)
        if (i !== currentLength - 1) {
          pseudoX = lastCoords.x
          pseudoY = lastCoords.y
        }
      }

      // After writing the full pattern, move cursor to new pattern location--depending on current rotation
      const nextPatternStart = getNextCoordinatesFromDirection($rotationText, pseudoX, pseudoY)
      pseudoX = nextPatternStart.x
      pseudoY = nextPatternStart.y
    })

    // Save next cursor coordinates; NOTE: Must re-decrement due to initial shift
    pseudoX += incX
    pseudoY += incY
    out[2] = [pseudoX, pseudoY] as CoordinatesTuple

    return out
  })

type InsertCoordinatesStore = [
  Readable<CoordinatesTuple>, // Cursor
  Readable<DirectionText>,
  Readable<RotationText>,
  Readable<number> // Insertion length
]
export type InsertCoordinatesResult = [CoordinatesTuple[], CoordinatesTuple | []]
export const insertCoordinates = derived<InsertCoordinatesStore, InsertCoordinatesResult>(
  [cursor, directionText, rotationText, insertLength],
  ([$cursor, $directionText, $rotationText, $insertLength]) => {
    /**
     * idx0 = pixels visited
     * idx1 = new cursor position
     */
    const out: InsertCoordinatesResult = [[], []]
    let [nextX, nextY] = $cursor

    for (let i = 0; i < $insertLength; ++i) {
      const lastCoords = getNextCoordinatesFromDirection($directionText, nextX, nextY)

      out[0].push([nextX, nextY] as CoordinatesTuple)

      nextX = lastCoords.x
      nextY = lastCoords.y
    }

    // NOTE: Final cursor needs final shift +-1 based on _last_ element
    const nextCursor = getNextCoordinatesFromDirection($rotationText, ...out[0][out[0].length - 1] as CoordinatesTuple)

    out[1] = [nextCursor.x, nextCursor.y] as CoordinatesTuple

    return out
  })

/* Instructions */
type Subscriber<T, R = void> = (v: T) => R
export const currentInstructionBuffer: Writable<string[]> = (() => {
  let value: string[] = []
  let subs: Subscriber<string[]>[] = []

  const subscribe = (handler: Subscriber<string[]>) => {
    subs = [...subs, handler]
    handler(value)
    return () => subs = subs.filter(sub => sub !== handler)
  }

  const set = (newInstruction: string[]) => {
    /* Custom `set` validation to throw on overflow */
    if (newInstruction.join('').length > 255) throw new Error('Instruction will overflow; Refusing write')

    value = newInstruction
    subs.forEach(sub => sub(value))
  }

  /**
   * Store will provide the current `value` to the caller,
   * Caller is expected to return new state for `value`
   */
  const update = (handler: Subscriber<string[], string[]>) => set(handler(value))

  return { subscribe, set, update }
})()

type ToVisitStore = [
  Readable<StrokeMode>,
  Readable<string>,
  Readable<DirectionText>,
  Readable<DrawMode>,
  Readable<PatternCoordinatesResult>,
  Readable<InsertCoordinatesResult>,
  Readable<CanvasLike>,
  Readable<CanvasLike>
]
export const toVisit = derived<ToVisitStore, CanvasLike>(
  [strokeMode, color, directionText, drawMode, patternCoordinates, insertCoordinates, visited, fillCells],
  ([$strokeMode, $color, $directionText, $drawMode, $patternCoordinates, $insertCoordinates, $visited, $fillCells]) => {
    const out = {}
    const baseArgs = {
      mode: $strokeMode,
      dir: $directionText,
      visited: $visited,
      color: $color
    }

    switch ($drawMode) {
    case 'insert':
      $insertCoordinates[0].map(([insertX, insertY]) => {
        getStrokeCells({ ...baseArgs, x: insertX, y: insertY }).forEach(([x, y]) => out[`${x}:${y}`] = $color)
      })
      break
    case 'pattern':
      [...$patternCoordinates[0], ...$patternCoordinates[1]].forEach(([patternX, patternY]) => {
        getStrokeCells({ ...baseArgs, x: patternX, y: patternY }).forEach(([x, y]) => out[`${x}:${y}`] = $color)
      })
      break
    case 'fill':
      return $fillCells
    default:
      break
    }

    return out
  })


export const pastSequences: Writable<InstructionObject[][]> = writable([])
export const currentSequence = derived<Readable<string[]>, InstructionObject[]>(currentInstructionBuffer, $currentInstructionBuffer => {
  const stream = $currentInstructionBuffer.join('')
  return stream === '' ? [] : parseInstructionStream(stream)
})
export const currentSequenceInitialized = derived<Readable<InstructionObject[]>, boolean>(currentSequence, $currentSequence => !!$currentSequence[0])

type AllSequencesStore = [Readable<InstructionObject[]>, Readable<InstructionObject[][]>]
export const allSequences = derived<AllSequencesStore, InstructionObject[][]>(
  [currentSequence, pastSequences],
  ([$currentSequence, $pastSequences]) => [...$pastSequences, $currentSequence]
)

// Requires all stores that are referenced as args, and a few webapp-specific stores for paint
export type ExecutableStores = {
  /* Stores used to initialize canvas */
  currentInstructionBufferStore: Writable<string[]>
  pastSequencesStore: Writable<InstructionObject[][]>
  /* Main stores to modify canvas, used by all */
  cwStore: Writable<boolean>
  visitedStore: Writable<CanvasLike>
  drawModeStore: Writable<DrawMode>
  toVisitStore: Readable<CanvasLike>
  /* STROKE */
  strokeModeStore: Writable<StrokeMode>
  /* PATTERN */
  patternOneLengthStore: Writable<PatternOffset>
  patternTwoOffsetStore: Writable<PatternOffset>
  rawPatternStore: Writable<string>
  patternCoordinatesStore: Readable<PatternCoordinatesResult>
  /* INSERT */
  insertLengthStore: Writable<number>
  insertCoordinatesStore: Readable<InsertCoordinatesResult>
  /* DIRECTION */
  directionStore: Writable<DirectionArrow>
  prevDirectionStore: Writable<DirectionArrow | ''>
  /* COLOR */
  colorStore: Writable<string>
  /* FILL */
  /* JUMP */
  cursorXStore: Writable<number>
  cursorYStore: Writable<number>
  prevCursorStore: Writable<CoordinatesTuple | []>
}


/**
 * Helper object for grabbing all stores needed to replay instructions
 *
 * @see {@link #execInstruction}
 */
export const executableStores: ExecutableStores = {
  cwStore: cw,
  visitedStore: visited,
  drawModeStore: drawMode,
  toVisitStore: toVisit,
  strokeModeStore: strokeMode,
  patternOneLengthStore: patternOneLength,
  patternTwoOffsetStore: patternTwoOffset,
  patternCoordinatesStore: patternCoordinates,
  rawPatternStore: rawPattern,
  insertLengthStore: insertLength,
  insertCoordinatesStore: insertCoordinates,
  directionStore: direction,
  prevDirectionStore: prevDirection,
  colorStore: color,
  cursorXStore: cursorX,
  cursorYStore: cursorY,
  prevCursorStore: prevCursor,
  currentInstructionBufferStore: currentInstructionBuffer,
  pastSequencesStore: pastSequences,
} as const

/* Helpers for webapp state */

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
 * Append to `currentSequence` and `currentInstructionBuffer`
 *
 * @todo Clean this up; At present we cannot write to currentBuffer with instructions, we still use raw strings
 */
export const appendSequences = (stores: ExecutableStores, toAppend: InstructionObject[]): void => {
  const currentInstructions = stores.currentInstructionBufferStore
  let buffer = getCurrentStoreValue<string[]>(currentInstructions)

  // console.log('Will append:', toAppend)
  // console.log('Instructions before:', buffer)
  toAppend.forEach(obj => {
    const latestInstruction = formatInstruction(obj) // Re-format until @todo solved
    buffer = [...buffer, latestInstruction]

    currentInstructions.set(buffer)
    execInstruction(obj, stores)
  })
  // console.log('After:', buffer)
}
