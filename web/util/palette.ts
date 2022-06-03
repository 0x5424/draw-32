/** @todo Make global */
type Tuple<T, N extends number, R extends T[] = []> = N extends R['length'] ? R : Tuple<T, N, [...R, T]>

export const PALETTE = [
  'ffffff', // 0; 'White'
  '000000', // 1; 'Black'
  'fd7aa0', // 2; 'Pink'
  '4b98ff', // 3; 'Blue'
  ...(new Array(11)) as Tuple<unknown, 11>,
  'alpha', // 15; 'Transparent/BG'
] as Tuple<string, 16> // NOTE: Even with a Tuple, Typescript is unable to resolve `indexOf` returning between 0-15 (and -1)
