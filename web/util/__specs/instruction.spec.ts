import { expect } from 'chai'
import {
  commitInsertDraw, commitPatternDraw, commitRotate, commitColor, commitFill, commitJump, commitStrokeMode,
  performDraw, formatInstruction, parseInstruction, parseInstructionStream, discernInstructionName,
  PatternInstruction
} from '../instruction'

describe('instruction.ts', () => {
  describe('#commitInsertDraw()', () => {
    it('succeeds with valid arguments', () => {
      const cwLength1 = {cw: true, length: 1}
      const ccwLength5 = {cw: false, length: 5}
      const cwLength14 = {cw: true, length: 14}
      const ccwLength14 = {cw: false, length: 14}
      const cwLength29 = {cw: true, length: 29}

      expect(commitInsertDraw(cwLength1)).to.eql('00100')
      expect(commitInsertDraw(ccwLength5)).to.eql('0111010')
      expect(commitInsertDraw(cwLength14)).to.eql('001110111')
      expect(commitInsertDraw(ccwLength14)).to.eql('011110111')
      expect(commitInsertDraw(cwLength29)).to.eql('00111101110')
    })
  })

  describe('#commitPatternDraw()', () => {
    it('succeeds with valid arguments', () => {
      const cw1Offset1: PatternInstruction = {cw: true, p1Length: 1, p2Offset: 1, pattern: '010101'}
      const cw1Offset2: PatternInstruction = {cw: true, p1Length: 1, p2Offset: 2, pattern: '010101'}
      const cw1Offset3: PatternInstruction = {cw: true, p1Length: 1, p2Offset: 3, pattern: '010101'}
      const cw1Offset4: PatternInstruction = {cw: true, p1Length: 1, p2Offset: 4, pattern: '010101'}

      expect(commitPatternDraw(cw1Offset1)).to.eql('0 0 0 00 00 1011 010101'.replace(/ /g, ''))
      expect(commitPatternDraw(cw1Offset2)).to.eql('00000011011010101')
      expect(commitPatternDraw(cw1Offset3)).to.eql('00000101011010101')
      expect(commitPatternDraw(cw1Offset4)).to.eql('00000111011010101')

      const cw2Offset1: PatternInstruction = {cw: true, p1Length: 2, p2Offset: 1, pattern: '010101'}
      const cw2Offset2: PatternInstruction = {cw: true, p1Length: 2, p2Offset: 2, pattern: '010101'}
      const cw2Offset3: PatternInstruction = {cw: true, p1Length: 2, p2Offset: 3, pattern: '010101'}
      const ccw2Offset4: PatternInstruction = {cw: false, p1Length: 2, p2Offset: 4, pattern: '010101'}

      expect(commitPatternDraw(cw2Offset1)).to.eql('0 0 0 01 00 1011 010101'.replace(/ /g, ''))
      expect(commitPatternDraw(cw2Offset2)).to.eql('00001011011010101')
      expect(commitPatternDraw(cw2Offset3)).to.eql('00001101011010101')
      expect(commitPatternDraw(ccw2Offset4)).to.eql('0 1 0 01 11 1011 010101'.replace(/ /g, ''))
    })
  })

  describe('#commitRotate()', () => {
    it('succeeds with valid arguments', () => {
      const leftInstruction = 'LEFT'
      const downInstruction = 'DOWN'
      const rightInstruction = 'RIGHT'
      const upInstruction = 'UP'

      expect(commitRotate(upInstruction)).to.eql('1000')
      expect(commitRotate(rightInstruction)).to.eql('1001')
      expect(commitRotate(downInstruction)).to.eql('1010')
      expect(commitRotate(leftInstruction)).to.eql('1011')
    })
  })

  describe('#commitColor()', () => {
    it('succeeds with valid arguments', () => {
      const firstColor = 0
      const fourthColor = 3
      const eighthColor = 7
      const sixteenthColor = 15

      expect(commitColor(firstColor)).to.eql('1100000')
      expect(commitColor(fourthColor)).to.eql('1100011')
      expect(commitColor(eighthColor)).to.eql('1100111')
      expect(commitColor(sixteenthColor)).to.eql('1101111')
    })
  })

  describe('#commitFill()', () => {
    it('matches expected output', () => {
      expect(commitFill()).to.eql('1110')
    })
  })

  describe('#commitJump()', () => {
    it('succeeds with valid arguments', () => {
      const coordsSmall: [number, number] = [8, 10]
      const coordsBig: [number, number] = [143, 187]
      expect(commitJump(...coordsSmall)).to.eql('1111110001110011')
      expect(commitJump(...coordsBig)).to.eql('11111111110001000011111100111100')
    })
  })

  describe('#commitStrokeMode()', () => {
    it('matches expected output', () => {
      expect(commitStrokeMode(0)).to.eql('10')
      expect(commitStrokeMode(1)).to.eql('11')
    })
  })

  /* Perform helpers (webapp-specific functions) */

  describe('#performDraw()', () => {
    it('matches expected output', () => {
      const oneArg = {drawInstruction: 'draw'}
      const twoArgs = {drawInstruction: 'draw', rotateInstruction: 'Rotate'}
      const threeArgs = {drawInstruction: 'draw', rotateInstruction: 'Rotate', jumpInstruction: 'Jump'}
      const noRotate = {drawInstruction: 'draw', jumpInstruction: 'Jump'}

      expect(performDraw(oneArg)).to.eql('draw')
      expect(performDraw(twoArgs)).to.eql('Rotatedraw')
      expect(performDraw(threeArgs)).to.eql('JumpRotatedraw')
      expect(performDraw(noRotate)).to.eql('Jumpdraw')
    })
  })

  describe('#discernInstructionName()', () => {
    const run = (instr: string, pc: number) => discernInstructionName(instr, pc)

    it('succeeds with valid arguments', () => {
      const expectedStrokeMode = ['commitStrokeMode', 2]
      const expectedPatternDraw = ['commitPatternDraw', 3]
      const expectedInsertDraw = ['commitInsertDraw', 3]

      const expectedRotate = ['commitRotate', 2]
      const expectedColor = ['commitColor', 3]
      const expectedFill = ['commitFill', 4]
      const expectedJump = ['commitJump', 4]

      expect(run('0*', 0)).to.eql(expectedStrokeMode)
      expect(run('  0*0', 2)).to.eql(expectedPatternDraw)
      expect(run('  0*1', 2)).to.eql(expectedInsertDraw)

      expect(run('  10', 2)).to.eql(expectedRotate)
      expect(run('  110', 2)).to.eql(expectedColor)
      expect(run('  1110', 2)).to.eql(expectedFill)
      expect(run('  1111', 2)).to.eql(expectedJump)
    })
  })

  describe('when parsing instructions', () => {
    const jump = '1 111 01 110000'.replace(/ /g, '') // 2,7
    const pattern = '0 0 0 00 00 1011 010101'.replace(/ /g, '')
    const insert = '011 110111'.replace(/ /g, '')
    const down = '1010'
    const color = '1101111' // index 15 color
    const fill = '1110'

    // Stroke: [0], Jump: [2, 7], Pattern: [cw, 1, 1, 4, 010101], Color: [15], Fill
    const sequence0 = ['10', jump, pattern, color, fill].join('')
    // Stroke: [0], Jump: [2, 7], Insert: [ccw, 14], Rotate: [down], Pattern: [cw, 1, 1, 4, 010101]
    const sequence1 = ['11', jump, insert, down, pattern].join('')

    // Expected args
    const expectedStroke0 = [{name: 'commitStrokeMode', arg: 0}, 2] as const
    const expectedStroke1 = [{name: 'commitStrokeMode', arg: 1}, 2] as const
    const expectedJump = [{name: 'commitJump', arg: [2, 7]}, 12] as const
    const expectedPatternDraw = [
      {name: 'commitPatternDraw', arg: {cw: true, p1Length: 1, p2Offset: 1, pattern: '010101'}},
      17
    ] as const
    const expectedInsertDraw = [{name: 'commitInsertDraw', arg: {cw: false, length: 14}}, 9] as const
    const expectedColor = [{name: 'commitColor', arg: 15}, 7] as const
    const expectedDown = [{name: 'commitRotate', arg: 'DOWN'}, 4] as const
    const expectedFill = [{name: 'commitFill', arg: null}, 4] as const

    describe('#parseInstruction()', () => {
      const prepare0 = (n: number): [string, number] => [sequence0, n]
      const prepare1 = (n: number): [string, number] => [sequence1, n]

      it('succeeds with valid arguments', () => {
        expect(parseInstruction(...prepare0(0))).to.eql(expectedStroke0)
        expect(parseInstruction(...prepare1(0))).to.eql(expectedStroke1)

        expect(parseInstruction(...prepare0(2))).to.eql(expectedJump)
        expect(parseInstruction(...prepare1(2))).to.eql(expectedJump)

        expect(parseInstruction(...prepare0(14))).to.eql(expectedPatternDraw)
        expect(parseInstruction(...prepare1(14))).to.eql(expectedInsertDraw)

        expect(parseInstruction(...prepare0(31))).to.eql(expectedColor)
        expect(parseInstruction(...prepare1(23))).to.eql(expectedDown)

        expect(parseInstruction(...prepare0(38))).to.eql(expectedFill)
      })
    })

    describe('#parseInstructionStream()', () => {
      it('succeeds with valid arguments', () => {
        const expected0 = [
          expectedStroke0, expectedJump, expectedPatternDraw, expectedColor, expectedFill
        ].map(([i,]) => i) // Only keep the instruction, bitsRead not needed

        const expected1 = [
          expectedStroke1, expectedJump, expectedInsertDraw, expectedDown, expectedPatternDraw
        ].map(([i,]) => i)

        // Same instructions as `sequence(0|1)` but in hex format
        const hex0 = '0x2f70016aefe'
        const hex1 = 'fdc1ef402d5'

        expect(parseInstructionStream(sequence0)).to.eql(expected0)
        expect(parseInstructionStream(sequence1)).to.eql(expected1)
        expect(parseInstructionStream(hex0)).to.eql(expected0)
        expect(parseInstructionStream(hex1)).to.eql(expected1)
      })
    })

    describe('#formatInstruction()', () => {
      it('succeeds with valid arguments', () => {
        expect(formatInstruction(expectedStroke0[0])).to.eql('10')
        expect(formatInstruction(expectedStroke1[0])).to.eql('11')

        expect(formatInstruction(expectedJump[0])).to.eql(jump)
        expect(formatInstruction(expectedPatternDraw[0])).to.eql(pattern)
        expect(formatInstruction(expectedInsertDraw[0])).to.eql(insert)
        expect(formatInstruction(expectedColor[0])).to.eql(color)
        expect(formatInstruction(expectedDown[0])).to.eql(down)
        expect(formatInstruction(expectedFill[0])).to.eql(fill)
      })
    })
  })
})
