export interface MatrixRow {
  bit: '0' | '1';
  i: number;
  x: number;
  y: number;
}

/**
 * Given a stream of bits, create a `width*width` matrix
 */
const streamToSquareMatrix = (stream: string, width: number): MatrixRow[] => {
  const output = [];

  for (let i = 0; i < width; i++) {
    output.push([])
  }

  for (let i = 0; i < stream.length; i++) {
    const currentBit = stream[i];
    const row = Math.floor(i / width);
    const cellNum = Math.floor(i % width);

    // NOTE: dimensions on-screen start at 1,1
    output[row].push({
      bit: currentBit,
      i,
      x: cellNum + 1,
      y: row + 1,
     })
  }

  return output;
}

/**
 * Given a stream of bits, create a `width*height` matrix
 */
const streamToMatrix = (stream: string, width: number, height: number): MatrixRow[] => {
  const output = [];

  // 1. Init all rows (height)
  for (let i = 0; i < height; i++) {
    output.push([])
  }

  // 2. Fill rows with cells (width)
  for (let i = 0; i < stream.length; i++) {
    const currentBit = stream[i];

    // TODO: smartify this later
    let inserted = false;
    output.forEach((ary, currentRow) => {
      if (!inserted && ary.length < width) {
        const x = ary.length + 1;
        const y = currentRow + 1;

        output[currentRow].push({ bit: currentBit, i, x, y });
        inserted = true;
      }
    });
  }

  return output;
}

/**
 * Given a stream of bits (& optionally dimensions), create a matrix
 *
 * @note If no dimensions are given, assumed to be square
 */
export const parseBitmap = (stream: string, width?: number, height?: number): MatrixRow[] => {
  let squareLength = width || height;
  let isSquare = width && height && width === height;

  // Else, assume square canvas & calculate side length now
  if (!width || !height) {
    squareLength = Math.sqrt(stream.length);
    isSquare = true
  }

  if (isSquare) return streamToSquareMatrix(stream, squareLength)

  return streamToMatrix(stream, width, height)
}
