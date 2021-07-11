import { expect } from 'chai'

import { CountMap } from '../../src/util/count-map'

describe('src/util/count-map.ts', function () {
  it('returns 0 by default', function () {
    expect(new CountMap<string>().get('foo')).to.equal(0)
    expect(new CountMap<string>().get('bar')).to.equal(0)
  })

  it('can increment', function () {
    const map = new CountMap<string>()
    expect(map.incrementAndGet('foo')).to.equal(1)
    expect(map.incrementAndGet('foo')).to.equal(2)
    expect(map.incrementAndGet('foo')).to.equal(3)
  })

  it('can decrement', function () {
    const map = new CountMap<string>()
    expect(map.incrementAndGet('foo')).to.equal(1)
    expect(map.incrementAndGet('foo')).to.equal(2)
    map.decrement('foo')
    expect(map.get('foo')).to.equal(1)
    map.decrement('foo')
    expect(map.get('foo')).to.equal(0)
  })

  it('throws when decrementing value that was never incremented', function () {
    const map = new CountMap<string>()
    expect(() => map.decrement('foo')).to.throw()
  })

  it('throws when decrementing too often', function () {
    const map = new CountMap<string>()
    map.incrementAndGet('foo')
    map.incrementAndGet('foo')
    map.decrement('foo')
    map.decrement('foo')
    expect(() => map.decrement('foo')).to.throw()
  })
})
