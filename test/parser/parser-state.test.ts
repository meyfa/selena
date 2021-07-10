import { expect } from 'chai'

import { ParserState } from '../../src/parser/parser-state'
import { Entity, EntityType } from '../../src/sequence/entity'
import { Activation } from '../../src/sequence/activation'
import { SyncMessage } from '../../src/sequence/message'

describe('src/parser/parser-state.ts', function () {
  it('has empty entities and activations at first', function () {
    const obj = new ParserState()
    expect(obj.getEntities()).to.be.an('array').with.lengthOf(0)
    expect(obj.getRootActivations()).to.be.an('array').with.lengthOf(0)
  })

  describe('#insertEntity()', function () {
    it('add entities to the array', function () {
      const entity1 = new Entity(EntityType.ACTOR, 'foo', 'Foo')
      const entity2 = new Entity(EntityType.COMPONENT, 'bar', 'Bar')
      const obj = new ParserState()
      obj.insertEntity(entity1)
      expect(obj.getEntities()).to.deep.equal([entity1])
      obj.insertEntity(entity2)
      expect(obj.getEntities()).to.deep.equal([entity1, entity2])
    })

    it('throws for duplicate ids', function () {
      const entity1 = new Entity(EntityType.ACTOR, 'foo', 'Foo 1')
      const entity2 = new Entity(EntityType.COMPONENT, 'foo', 'Foo 2')
      const obj = new ParserState()
      obj.insertEntity(entity1)
      expect(() => obj.insertEntity(entity2)).to.throw()
    })
  })

  describe('#insertActivation()', function () {
    it('add activations to the array', function () {
      const entity1 = new Entity(EntityType.ACTOR, 'foo', 'Foo')
      const entity2 = new Entity(EntityType.COMPONENT, 'bar', 'Bar')
      const act1 = new Activation(new SyncMessage(entity1, entity2, '1'), undefined, [])
      const act2 = new Activation(new SyncMessage(entity2, entity1, '2'), undefined, [])
      const obj = new ParserState()
      obj.insertActivation(act1)
      expect(obj.getRootActivations()).to.deep.equal([act1])
      obj.insertActivation(act2)
      expect(obj.getRootActivations()).to.deep.equal([act1, act2])
    })
  })

  describe('#lookupEntity()', function () {
    it('returns undefined for unknown ids', function () {
      const entity1 = new Entity(EntityType.ACTOR, 'foo', 'Foo')
      const entity2 = new Entity(EntityType.ACTOR, 'bar', 'Bar')
      const obj = new ParserState()
      expect(obj.lookupEntity('bar')).to.be.undefined
      obj.insertEntity(entity1)
      expect(obj.lookupEntity('bar')).to.be.undefined
      obj.insertEntity(entity2)
      expect(obj.lookupEntity('bar')).to.equal(entity2)
    })
  })
})
