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

export const decodeRle = (stream: string) => {
  let mask = '0'
  let bitsRead = 0
  // Iterate until we hit a non-1
  for (; stream[bitsRead] === '1'; ++bitsRead) {
    mask = '1' + mask
  }

  const rest = stream.slice(bitsRead + 1)

  return parseInt(rest, 2) + (parseInt(mask, 2) + 0b1)
}
