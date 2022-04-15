import { expect } from 'chai'
import {
  commitInsertDraw, commitPatternDraw, commitRotate, commitColor, commitFill, commitJump, commitStrokeSize,
  performDraw,
  PatternInstruction, Direction
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
      const leftInstruction: Direction = 'LEFT'
      const downInstruction: Direction = 'DOWN'
      const rightInstruction: Direction = 'RIGHT'
      const upInstruction: Direction = 'UP'

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

  describe('#commitColor()', () => {
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

  describe('#commitStrokeSize()', () => {
    it('matches expected output', () => {
      expect(commitStrokeSize(1)).to.eql('10')
      expect(commitStrokeSize(3)).to.eql('11')
    })
  })

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
})
