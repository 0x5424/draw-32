import type { DirectionText, RotationText } from '../stores'

type XY = [number, number]

export const INCREMENTS: Record<DirectionText | RotationText, XY> = {
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
export const getSurroundingCoordinates = (inputX: number, inputY: number): Record<DirectionText, XY> => {
  const entries = ['UP', 'RIGHT', 'DOWN', 'LEFT'].map((dir: DirectionText) => {
    const { x, y } = getNextCoordinatesFromDirection(dir, inputX, inputY)

    return [dir, [x, y]]
  })

  return Object.fromEntries(entries)
}
