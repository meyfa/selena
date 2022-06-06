import { expect } from 'chai'
import { TypedConstraintLayout } from '../../../src/diagram/layout/typed-constraint-layout.js'

describe('src/diagram/layout/typed-constraint-layout.ts', function () {
  it('computes empty layout for itemCount=0', function () {
    const layout = new TypedConstraintLayout<string>([], {
      itemMargin: 10
    })
    const computed = layout.compute()
    expect(computed.totalDimensions).to.equal(0)
    expect(computed.items.size).to.equal(0)
  })

  it('can compute complex layouts', function () {
    const layout = new TypedConstraintLayout<string>(['a', 'b', 'c'], {
      itemMargin: 10
    })
    layout.applyDimension('a', 20)
    layout.applyDimension('b', 40)
    layout.applyDimension('c', 80)
    layout.applyBefore('a', 100)
    layout.applyBefore('b', 150)
    layout.applyBetween('a', 'b', 500)
    const computed = layout.compute()
    // dim(a) + dim(b) + dim(c) + 2*margin + space(-,a)-dim(a)/2 + space(a,b)-dim(a)/2-dim(b)/2-margin
    expect(computed.totalDimensions).to.equal(20 + 40 + 80 + 2 * 10 + (100 - 10) + (500 - 10 - 20 - 10))
    expect(computed.items.size).to.equal(3)
    expect(computed.items.get('a')).to.deep.equal({ start: 90, center: 100, dimension: 20 })
    expect(computed.items.get('b')).to.deep.equal({ start: 580, center: 600, dimension: 40 })
    expect(computed.items.get('c')).to.deep.equal({ start: 630, center: 670, dimension: 80 })
  })
})
