import { expect } from 'chai'

import { VerticalLayout } from '../../../src/diagram/layout/vertical-layout'

describe('src/diagram/layout/vertical-layout.ts', function () {
  it('computes empty layout if no parts are specified', function () {
    const layout = new VerticalLayout([], 0, {
      messageSpacing: 0
    })
    const computed = layout.compute()
    expect(computed.totalHeight).to.equal(0)
    expect(computed.entityOffsets.size).to.equal(0)
    expect(computed.messagePositions).to.have.lengthOf(0)
  })

  it('calculates height for entities only', function () {
    const layout = new VerticalLayout(['foo', 'bar', 'baz'], 0, {
      messageSpacing: 0
    })
    layout.applyHeadHeight('foo', 37)
    layout.applyHeadHeight('bar', 42)
    layout.applyHeadHeight('baz', 39)
    const computed = layout.compute()
    expect(computed.totalHeight).to.equal(42)
    expect(computed.entityOffsets.size).to.equal(3)
    expect(computed.entityOffsets.get('foo')).to.equal(0)
    expect(computed.entityOffsets.get('bar')).to.equal(0)
    expect(computed.entityOffsets.get('baz')).to.equal(0)
  })

  it('calculates message positions', function () {
    const layout = new VerticalLayout(['foo', 'bar'], 3, {
      messageSpacing: 42
    })
    layout.applyHeadHeight('foo', 20)
    layout.applyHeadHeight('bar', 30)
    const computed = layout.compute()
    expect(computed.totalHeight).to.equal(156)
    expect(computed.messagePositions).to.have.lengthOf(3)
    expect(computed.messagePositions[0]).to.deep.equal({
      top: 30 + 42,
      bottom: 30 + 42
    })
    expect(computed.messagePositions[1]).to.deep.equal({
      top: 30 + 2 * 42,
      bottom: 30 + 2 * 42
    })
    expect(computed.messagePositions[2]).to.deep.equal({
      top: 30 + 3 * 42,
      bottom: 30 + 3 * 42
    })
  })

  it('sets entity offset for create messages', function () {
    const layout = new VerticalLayout(['foo', 'bar', 'baz'], 3, {
      messageSpacing: 42
    })
    layout.applyHeadHeight('foo', 20)
    layout.applyHeadHeight('bar', 30)
    layout.applyHeadHeight('baz', 40)
    layout.applyCreator('foo', 2)
    layout.applyCreator('bar', 1)
    const computed = layout.compute()
    expect(computed.totalHeight).to.equal(216)
    expect(computed.messagePositions[0]).to.deep.equal({
      top: 40 + 42,
      bottom: 40 + 42
    })
    expect(computed.messagePositions[1]).to.deep.equal({
      top: 40 + 2 * 42 + 30 / 2,
      bottom: 40 + 2 * 42 + 30 / 2
    })
    expect(computed.messagePositions[2]).to.deep.equal({
      top: 40 + 3 * 42 + 30 + 20 / 2,
      bottom: 40 + 3 * 42 + 30 + 20 / 2
    })
  })

  it('includes message height if set', function () {
    const layout = new VerticalLayout(['foo', 'bar'], 3, {
      messageSpacing: 42
    })
    layout.applyHeadHeight('foo', 20)
    layout.applyHeadHeight('bar', 30)
    layout.applyMessageHeight(1, 70)
    const computed = layout.compute()
    expect(computed.totalHeight).to.equal(226)
    expect(computed.messagePositions).to.have.lengthOf(3)
    expect(computed.messagePositions[0]).to.deep.equal({
      top: 30 + 42,
      bottom: 30 + 42
    })
    expect(computed.messagePositions[1]).to.deep.equal({
      top: 30 + 2 * 42,
      bottom: 30 + 2 * 42 + 70
    })
    expect(computed.messagePositions[2]).to.deep.equal({
      top: 30 + 3 * 42 + 70,
      bottom: 30 + 3 * 42 + 70
    })
  })
})
