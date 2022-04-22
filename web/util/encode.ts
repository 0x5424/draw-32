/**
 * Encode a positive Integer
 *
 * @note Larger integers may end up represented in e notation. As a workaround, semi-arbitrary limit of ~16k has been set in place
 */
export const encodeRle = (int: number) => {
  if (int < 1) throw new Error('cannot encode numbers < 1')
  if (int > 15360) throw new Error('will not encode numbers > 15360')

  const binString = (int + 1).toString(2)
  const binLower = binString.slice(1)

  const maskString = [binString[0], binLower.replace(/1/g, '0')].join('')
  const mask = parseInt(maskString, 2) - 0b10

  return [
    mask.toString(2),
    binLower
  ].join('')
}

/**
 * @todo Add nice Type narrowing based on a descriminator arg/param (returnBitsRead or similar)
 *
 * @example Non-working overload
 * ```
 * type FnDecodeRle = {
 *   (stream: string, pc?: number, returnBitsRead?: true): [number, number];
 *   (stream: string, pc?: number, returnBitsRead?: false): number
 * }
 * ```
 *
 * @example Non-working narrowing with `is` predicate
 * ```
 * isTuple = (outp): outp is [number, number] => Array.isArray(outp) && outp.length === 2
 *
 * decodeRle = (...args): [number, number] | number => {
 *   // ...
 *   return isTuple(x) ? x : x[0]
 * }
 * ```
 *
 * @example Non-working narrowing with conditional param check
 * ```
 * decodeRle = (...args, returnTuple = false): typeof returnTuple extends true ? [number, number] : number => {
 *   // ...
 * }
 * ```
 */
export const decodeRleAsTuple = (stream: string, pc = 0): [number, number] => {
  let mask = '0'
  let bitsRead = 0
  // Iterate until we hit a non-1
  for (; stream[pc + bitsRead] === '1'; ++bitsRead) {
    mask = '1' + mask
  }

  // We need to slice starting from the immediate bit after the mask
  const startIndex = pc + bitsRead + 1
  const endIndex = startIndex + mask.length

  const rest = stream.slice(startIndex, endIndex)
  const parsedNumber = parseInt(rest, 2) + (parseInt(mask, 2) + 0b1)

  // Final guard clause, for redundancy
  if (rest.length !== mask.length) throw new Error(`Fatal decode error; Check bitstream & mask [${rest}, ${mask}]`)

  return [parsedNumber, rest.length + mask.length]
}

export const decodeRle = (stream: string, pc = 0): number => decodeRleAsTuple(stream, pc)[0]
