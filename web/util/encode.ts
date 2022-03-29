export const encodeRle = (int: number) => {
  if (int < 1) throw new Error('cannot encode numbers < 1')
}

export const decodeRle = (stream: string) => {
  throw new Error('not implemented')
}
