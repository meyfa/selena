import { expect } from 'chai'
import { ActivationWalker } from '../../src/diagram/activation-walker.js'
import { Activation } from '../../src/sequence/activation.js'
import { Entity, EntityType } from '../../src/sequence/entity.js'
import { LostMessage, SyncMessage } from '../../src/sequence/message.js'

interface MockWalkerConfig {
  shouldActivate?: (node: Activation) => boolean
  pre?: (node: Activation, fromLevel: number, toLevel: number, active: boolean) => any
  post?: (node: Activation, fromLevel: number, toLevel: number, state: any) => void
}

class MockWalker extends ActivationWalker<any> {
  constructor (
    private readonly config: MockWalkerConfig
  ) {
    super()
  }

  protected override shouldActivate (node: Activation): boolean {
    return this.config.shouldActivate != null ? this.config.shouldActivate(node) : false
  }

  protected override pre (node: Activation, fromLevel: number, toLevel: number, active: boolean): any {
    return this.config.pre != null ? this.config.pre(node, fromLevel, toLevel, active) : undefined
  }

  protected override post (node: Activation, fromLevel: number, toLevel: number, state: any): void {
    if (this.config.post != null) {
      this.config.post(node, fromLevel, toLevel, state)
    }
  }
}

describe('src/diagram/activation-walker.ts', function () {
  const foo = new Entity(EntityType.COMPONENT, 'foo', 'Foo')
  const bar = new Entity(EntityType.COMPONENT, 'bar', 'Bar')

  // helper method for construction of activation trees
  function act (label: string, ...children: Activation[]): Activation {
    return new Activation(new SyncMessage(foo, bar, label), undefined, children)
  }

  it('calls #pre() in pre-order, #post() in post-order', function () {
    const preOrder: string[] = []
    const postOrder: string[] = []
    const walker = new MockWalker({
      pre (node) {
        preOrder.push(node.message.label)
      },
      post (node) {
        postOrder.push(node.message.label)
      }
    })
    const activation = (
      act('a',
        act('b',
          act('c')),
        act('d'),
        act('e'))
    )
    walker.walk(activation)
    expect(preOrder).to.deep.equal(['a', 'b', 'c', 'd', 'e'])
    expect(postOrder).to.deep.equal(['c', 'b', 'd', 'e', 'a'])
  })

  it('passes state from pre to post', function () {
    const states: Record<string, number> = {
      a: 10,
      b: 20,
      c: 30,
      d: 40
    }
    const walker = new MockWalker({
      pre (node) {
        return states[node.message.label]
      },
      post (node, fromLevel, toLevel, state) {
        expect(state).to.equal(states[node.message.label])
      }
    })
    const activation = (
      act('a',
        act('b',
          act('c')),
        act('d'))
    )
    walker.walk(activation)
  })

  it('uses fromLevel=0 and toLevel=0 if nothing ever activates', function () {
    const walker = new MockWalker({
      pre (node, fromLevel, toLevel) {
        expect(fromLevel).to.equal(0)
        expect(toLevel).to.equal(0)
      },
      post (node, fromLevel, toLevel) {
        expect(fromLevel).to.equal(0)
        expect(toLevel).to.equal(0)
      }
    })
    const activation = (
      act('a',
        act('b',
          act('c')),
        act('d'))
    )
    walker.walk(activation)
  })

  it('uses fromLevel prior to activation, toLevel after activation for self-calls', function () {
    const walker = new MockWalker({
      shouldActivate () {
        return true
      },
      pre (node, fromLevel, toLevel) {
        const level = Number.parseInt(node.message.label, 10)
        expect(fromLevel).to.equal(level)
        expect(toLevel).to.equal(level + 1)
      },
      post (node, fromLevel, toLevel) {
        const level = Number.parseInt(node.message.label, 10)
        expect(fromLevel).to.equal(level)
        expect(toLevel).to.equal(level + 1)
      }
    })

    const activation = new Activation(new SyncMessage(foo, foo, '0'), undefined, [
      new Activation(new SyncMessage(foo, foo, '1'), undefined, [])
    ])
    walker.walk(activation)
  })

  it('calculates levels correctly between 2 participants', function () {
    const expectedLevels: Record<string, number[]> = {
      0: [0, 1],
      1: [1, 0],
      2: [0, 2]
    }
    const walker = new MockWalker({
      shouldActivate (node) {
        return node.message.label === '0' || node.message.label === '2'
      },
      pre (node, fromLevel, toLevel) {
        expect(fromLevel).to.equal(expectedLevels[node.message.label][0])
        expect(toLevel).to.equal(expectedLevels[node.message.label][1])
      },
      post (node, fromLevel, toLevel) {
        expect(fromLevel).to.equal(expectedLevels[node.message.label][0])
        expect(toLevel).to.equal(expectedLevels[node.message.label][1])
      }
    })

    const activation = new Activation(new SyncMessage(foo, bar, '0'), undefined, [
      new Activation(new SyncMessage(bar, foo, '1'), undefined, [
        new Activation(new SyncMessage(foo, bar, '2'), undefined, [])
      ])
    ])
    walker.walk(activation)
  })

  it('never activates without message target', function () {
    const walker = new MockWalker({
      shouldActivate (node) {
        expect(node.message.to).to.be.oneOf([foo, bar])
        return true
      },
      pre (node, fromLevel, toLevel) {
        if (node.message.to != null) {
          expect(toLevel).to.be.greaterThan(0)
        } else {
          expect(toLevel).to.equal(0)
        }
      }
    })

    const activation = new Activation(new SyncMessage(foo, bar, '0'), undefined, [
      new Activation(new SyncMessage(bar, foo, '1'), undefined, [
        new Activation(new LostMessage(foo, '2'), undefined, [])
      ]),
      new Activation(new LostMessage(bar, '3'), undefined, [])
    ])
    walker.walk(activation)
  })
})
