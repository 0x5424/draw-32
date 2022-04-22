import { expect } from 'chai'
import { encodeRle, decodeRle, decodeRleAsTuple } from '../encode'

describe('encode.ts', () => {
  describe('#encodeRle()', () => {
    it('fails for values less than 1', () => {
      const encZero = () => encodeRle(0)
      const encNegative = () => encodeRle(-1)

      expect(encZero).to.throw()
      expect(encNegative).to.throw()
    })

    it('succeeds with valid arguments', () => {
      expect(encodeRle(1)).to.eql('00')
      expect(encodeRle(2)).to.eql('01')
      expect(encodeRle(6)).to.eql('1011')
      expect(encodeRle(8)).to.eql('110001')
      expect(encodeRle(192)).to.eql('11111101000001')
      expect(encodeRle(4201)).to.eql('111111111110000001101010')
    })
  })

  describe('#decodeRle()', () => {
    it('succeeds with valid arguments', () => {
      expect(decodeRle('00')).to.eql(1)
      expect(decodeRle('01')).to.eql(2)
      expect(decodeRle('1011')).to.eql(6)
      expect(decodeRle('110001')).to.eql(8)
      expect(decodeRle('11111101000001')).to.eql(192)
      expect(decodeRle('111111111110000001101010')).to.eql(4201)
      expect(decodeRle('**111111111110000001101010', 2)).to.eql(4201)
      expect(decodeRle('**111111111110000001101010**', 2)).to.eql(4201)
    })
  })

  describe('#decodeRleAsTuple()', () => {
    it('succeeds with valid arguments', () => {
      expect(decodeRleAsTuple('111111111110000001101010', 0)).to.eql([4201, 24])
      expect(decodeRleAsTuple('**111111111110000001101010', 2)).to.eql([4201, 24])
      expect(decodeRleAsTuple('**111111111110000001101010**', 2)).to.eql([4201, 24])
    })
  })

  /*
  describe('#encodeDelta()', () => {})
  describe('#decodeDelta()', () => {})
  */
})
