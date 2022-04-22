import { expect } from 'chai'
import {
  discernInstructionName, parseInstruction, parseInstructionStream,
  formatInstruction
} from '../parse'

import type { CoordinatesTuple } from '../instruction'

describe('parse.ts', () => {
  describe('#discernInstructionName()', () => {
    const run = (instr: string) => discernInstructionName(instr, 0)

    it('succeeds with valid arguments', () => {
      const expectedPatternDraw = ['commitPatternDraw', 3]
      const expectedInsertDraw = ['commitInsertDraw', 3]

      const expectedRotate = ['commitRotate', 2]
      const expectedColor = ['commitColor', 3]
      const expectedFill = ['commitFill', 4]
      const expectedJump = ['commitJump', 4]

      expect(run('0*0')).to.eql(expectedPatternDraw)
      expect(run('0*1')).to.eql(expectedInsertDraw)

      expect(run('10')).to.eql(expectedRotate)
      expect(run('110')).to.eql(expectedColor)
      expect(run('1110')).to.eql(expectedFill)
      expect(run('1111')).to.eql(expectedJump)
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
    const expectedJump = [{name: 'commitJump', arg: [2, 7] as CoordinatesTuple}, 12] as const
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
