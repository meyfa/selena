import { expect } from 'chai'

import { IndexedConstraintLayout } from '../../../src/diagram/layout/indexed-constraint-layout'

describe('src/diagram/layout/indexed-constraint-layout.ts', function () {
  it('computes empty layout for itemCount=0', function () {
    const layout = new IndexedConstraintLayout(0, {
      itemMargin: 10
    })
    const computed = layout.compute()
    expect(computed.totalDimensions).to.equal(0)
    expect(computed.items.size).to.equal(0)
  })

  it('works for elements of zero size (no margin)', function () {
    const layout = new IndexedConstraintLayout(3, {
      itemMargin: 0
    })
    const computed = layout.compute()
    expect(computed.totalDimensions).to.equal(0)
    expect(computed.items.size).to.equal(3)
    for (let i = 0; i < 3; ++i) {
      expect(computed.items.get(i)).to.deep.equal({ start: 0, center: 0, dimension: 0 })
    }
  })

  it('works for elements of zero size (with margin)', function () {
    const layout = new IndexedConstraintLayout(3, {
      itemMargin: 10
    })
    const computed = layout.compute()
    expect(computed.totalDimensions).to.equal(20)
    expect(computed.items.size).to.equal(3)
    expect(computed.items.get(0)).to.deep.equal({ start: 0, center: 0, dimension: 0 })
    expect(computed.items.get(1)).to.deep.equal({ start: 10, center: 10, dimension: 0 })
    expect(computed.items.get(2)).to.deep.equal({ start: 20, center: 20, dimension: 0 })
  })

  it('works for elements with non-zero size (with margin)', function () {
    const layout = new IndexedConstraintLayout(3, {
      itemMargin: 10
    })
    layout.applyDimension(0, 15)
    layout.applyDimension(1, 150)
    layout.applyDimension(2, 1500)
    const computed = layout.compute()
    expect(computed.totalDimensions).to.equal(1685)
    expect(computed.items.get(0)).to.deep.equal({ start: 0, center: 15 / 2, dimension: 15 })
    expect(computed.items.get(1)).to.deep.equal({ start: 25, center: 25 + 150 / 2, dimension: 150 })
    expect(computed.items.get(2)).to.deep.equal({ start: 185, center: 185 + 1500 / 2, dimension: 1500 })
  })

  it('uses the largest size ever set', function () {
    const layout = new IndexedConstraintLayout(3, {
      itemMargin: 10
    })
    layout.applyDimension(0, 20)
    // vvvv
    layout.applyDimension(1, 32)
    layout.applyDimension(1, 40)
    layout.applyDimension(1, 36)
    // ^^^^
    layout.applyDimension(2, 80)
    const computed = layout.compute()
    expect(computed.totalDimensions).to.equal(160)
    expect(computed.items.get(0)).to.deep.equal({ start: 0, center: 20 / 2, dimension: 20 })
    expect(computed.items.get(1)).to.deep.equal({ start: 30, center: 30 + 40 / 2, dimension: 40 })
    expect(computed.items.get(2)).to.deep.equal({ start: 80, center: 80 + 80 / 2, dimension: 80 })
  })

  it('can apply spacing between left edge and first item center', function () {
    const layout = new IndexedConstraintLayout(3, {
      itemMargin: 10
    })
    layout.applyDimension(0, 20)
    layout.applyDimension(1, 40)
    layout.applyDimension(2, 80)
    layout.applyBefore(0, 300)
    const computed = layout.compute()
    expect(computed.totalDimensions).to.equal((300 - 10) + 160)
    expect(computed.items.get(0)).to.deep.equal({ start: 290, center: 300, dimension: 20 })
    expect(computed.items.get(1)).to.deep.equal({ start: 320, center: 320 + 40 / 2, dimension: 40 })
    expect(computed.items.get(2)).to.deep.equal({ start: 370, center: 370 + 80 / 2, dimension: 80 })
  })

  it('can apply spacing between adjacent item centers (0-1, 1-0)', function () {
    function check (modifier: (layout: IndexedConstraintLayout) => void): void {
      const layout = new IndexedConstraintLayout(3, {
        itemMargin: 10
      })
      layout.applyDimension(0, 20)
      layout.applyDimension(1, 40)
      layout.applyDimension(2, 80)
      modifier(layout)
      const computed = layout.compute()
      expect(computed.totalDimensions).to.equal(160 + (300 - 10 - 20 / 2 - 40 / 2))
      expect(computed.items.get(0)).to.deep.equal({ start: 0, center: 10, dimension: 20 })
      expect(computed.items.get(1)).to.deep.equal({ start: 290, center: 310, dimension: 40 })
      expect(computed.items.get(2)).to.deep.equal({ start: 340, center: 340 + 80 / 2, dimension: 80 })
    }
    // test this in different ways that should all behave the same
    check(layout => layout.applyBetween(0, 1, 300))
    check(layout => layout.applyBetween(1, 0, 300))
    check(layout => layout.applyBefore(1, 300))
  })

  it('can apply spacing between adjacent item centers (1-2, 2-1)', function () {
    function check (modifier: (layout: IndexedConstraintLayout) => void): void {
      const layout = new IndexedConstraintLayout(3, {
        itemMargin: 10
      })
      layout.applyDimension(0, 20)
      layout.applyDimension(1, 40)
      layout.applyDimension(2, 80)
      modifier(layout)
      const computed = layout.compute()
      expect(computed.totalDimensions).to.equal(160 + (300 - 10 - 40 / 2 - 80 / 2))
      expect(computed.items.get(0)).to.deep.equal({ start: 0, center: 10, dimension: 20 })
      expect(computed.items.get(1)).to.deep.equal({ start: 30, center: 30 + 40 / 2, dimension: 40 })
      expect(computed.items.get(2)).to.deep.equal({ start: 310, center: 310 + 80 / 2, dimension: 80 })
    }
    // test this in different ways that should all behave the same
    check(layout => layout.applyBetween(1, 2, 300))
    check(layout => layout.applyBetween(2, 1, 300))
    check(layout => layout.applyBefore(2, 300))
  })

  it('can apply spacing between non-adjacent item centers (0-2, 2-0)', function () {
    function check (modifier: (layout: IndexedConstraintLayout) => void): void {
      const layout = new IndexedConstraintLayout(3, {
        itemMargin: 10
      })
      layout.applyDimension(0, 20)
      layout.applyDimension(1, 40)
      layout.applyDimension(2, 80)
      modifier(layout)
      const computed = layout.compute()
      expect(computed.totalDimensions).to.equal(160 + (300 - 2 * 10 - 40 - 20 / 2 - 80 / 2))
      expect(computed.items.get(0)).to.deep.equal({ start: 0, center: 10, dimension: 20 })
      expect(computed.items.get(1)).to.deep.equal({ start: 30, center: 30 + 40 / 2, dimension: 40 })
      expect(computed.items.get(2)).to.deep.equal({ start: 270, center: 270 + 80 / 2, dimension: 80 })
    }
    // test this in different ways that should all behave the same
    check(layout => layout.applyBetween(0, 2, 300))
    check(layout => layout.applyBetween(2, 0, 300))
  })

  it('uses the largest constraints ever set (applyBefore)', function () {
    const layout = new IndexedConstraintLayout(3, {
      itemMargin: 10
    })
    layout.applyDimension(0, 20)
    layout.applyDimension(1, 40)
    layout.applyDimension(2, 80)
    // vvvv
    layout.applyBefore(0, 296)
    layout.applyBefore(0, 300)
    layout.applyBefore(0, 298)
    // ^^^^
    const computed = layout.compute()
    expect(computed.totalDimensions).to.equal((300 - 10) + 160)
    expect(computed.items.get(0)).to.deep.equal({ start: 290, center: 300, dimension: 20 })
  })

  it('uses the largest constraints ever set (applyBetween)', function () {
    const layout = new IndexedConstraintLayout(3, {
      itemMargin: 10
    })
    layout.applyDimension(0, 20)
    layout.applyDimension(1, 40)
    layout.applyDimension(2, 80)
    // vvvv
    layout.applyBetween(0, 2, 296)
    layout.applyBetween(0, 2, 300)
    layout.applyBetween(0, 2, 298)
    // ^^^^
    const computed = layout.compute()
    expect(computed.totalDimensions).to.equal(160 + (300 - 2 * 10 - 40 - 20 / 2 - 80 / 2))
  })
})
