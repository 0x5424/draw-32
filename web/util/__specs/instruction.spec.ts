import { expect } from 'chai'
import { commitInsertDraw, commitPatternDraw } from '../instruction'

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
    it('succeeds with valid arguments', () => {})
  })

  /*
  describe('#encodeDelta()', () => {})
  describe('#decodeDelta()', () => {})
  */
})
