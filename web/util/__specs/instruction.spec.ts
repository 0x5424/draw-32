import { expect } from 'chai'
import {
  commitInsertDraw, commitPatternDraw, commitRotate, commitColor, commitFill, commitJump,
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
      const cwP1P2: PatternInstruction = {cw: true, p1Length: 1, p2Length: 2, pattern: '00101'} // len: 5
      const ccwP2P3: PatternInstruction = {cw: false, p1Length: 2, p2Length: 3, pattern: '1100010'} // 7
      const cwP3P4: PatternInstruction = {cw: true, p1Length: 3, p2Length: 4, pattern: '01'} // 2
      const ccwP4P5: PatternInstruction = {cw: false, p1Length: 4, p2Length: 5, pattern: '000001000'} // 9
      const cwP1: PatternInstruction = {cw: true, p1Length: 1, p2Length: 2, pattern: '0000'} // 4

      expect(commitPatternDraw(cwP1P2)).to.eql('0000000101000101')
      expect(commitPatternDraw(ccwP2P3)).to.eql('01001011100001100010')
      expect(commitPatternDraw(cwP3P4)).to.eql('00010100101')
      expect(commitPatternDraw(ccwP4P5)).to.eql('0101111110010000001000')
      expect(commitPatternDraw(cwP1)).to.eql('000000010010000')
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

  describe('#performDraw()', () => {
    it('matches expected output', () => {
      const oneArg = {drawInstruction: 'draw'}
      const twoArgs = {drawInstruction: 'draw', rotateInstruction: 'Rotate'}
      const threeArgs = {drawInstruction: 'draw', rotateInstruction: 'Rotate', jumpInstruction: 'Jump'}
      const noRotate = {drawInstruction: 'draw', jumpInstruction: 'Jump'}

      expect(performDraw(oneArg)).to.eql('draw')
      expect(performDraw(twoArgs)).to.eql('drawRotate')
      expect(performDraw(threeArgs)).to.eql('drawRotateJump')
      expect(performDraw(noRotate)).to.eql('drawJump')
    })
  })
})
