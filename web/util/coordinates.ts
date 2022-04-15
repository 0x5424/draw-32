import type { DirectionText, RotationText } from '../stores'

export const INCREMENTS: Record<DirectionText | RotationText, [number, number]> = {
  UP: [0, -1],
  LEFT: [-1, 0],
  RIGHT: [1, 0],
  DOWN: [0, 1],
  UP_LEFT: [-1, -1],
  UP_RIGHT: [1, -1],
  DOWN_LEFT: [-1, 1],
  DOWN_RIGHT: [1, 1],
}

export const getNextCoordinatesFromDirection = (direction: string, x: number, y: number) => {
  const [xInc, yInc] = INCREMENTS[direction]

  const outX = x + xInc
  const outY = y + yInc

  return {direction, x: outX, y: outY}
}
