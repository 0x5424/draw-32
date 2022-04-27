import type { DirectionText, StrokeMode, CoordinatesTuple } from './instruction'
import type { RotationText, CanvasLike } from '../stores'

export const INCREMENTS: Record<DirectionText | RotationText, CoordinatesTuple> = {
  UP: [0, -1],
  LEFT: [-1, 0],
  RIGHT: [1, 0],
  DOWN: [0, 1],
  UP_LEFT: [-1, -1],
  UP_RIGHT: [1, -1],
  DOWN_LEFT: [-1, 1],
  DOWN_RIGHT: [1, 1],
}

export const getNextCoordinatesFromDirection = (direction: DirectionText | RotationText, x: number, y: number) => {
  const [xInc, yInc] = INCREMENTS[direction]

  const outX = x + xInc
  const outY = y + yInc

  return {direction, x: outX, y: outY}
}

/**
 * Returns a tuple of CoordinateTuples: [U, R, D, L]
 */
export const getSurroundingCoordinates = (inputX: number, inputY: number): Record<DirectionText, CoordinatesTuple> => {
  const entries = ['UP', 'RIGHT', 'DOWN', 'LEFT'].map((dir: DirectionText) => {
    const { x, y } = getNextCoordinatesFromDirection(dir, inputX, inputY)

    return [dir, [x, y]]
  })

  return Object.fromEntries(entries)
}

interface GetStrokeCellsParameters {
  mode: StrokeMode;
  x: number;
  y: number;
  dir: DirectionText;
  visited: CanvasLike;
  color: string;
}

/**
 * Utility function to evaluate which cells should be filled surrounding a pair of coords
 */
export const getStrokeCells = (args: GetStrokeCellsParameters): CoordinatesTuple[] => {
  const {
    mode,
    x: inputX,
    y: inputY,
    dir,
    visited,
    color,
  } = args
  const baseCell = [inputX, inputY] as const

  if (mode === 0) return [baseCell]

  // Logic: Fill all surrounding cells; Omitting the already  visited coords is for UX feedback
  const extraCells = Object.values(getSurroundingCoordinates(inputX, inputY)).map(([x, y]) => {
    if (visited[`${x}:${y}`] === color) return // Skip if we've already filled it with same color

    return [x, y] as const
  }).filter(Boolean)

  return [baseCell, ...extraCells]
}
