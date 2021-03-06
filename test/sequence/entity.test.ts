import { expect } from 'chai'
import { Entity, EntityType } from '../../src/sequence/entity.js'

describe('src/sequence/entity.ts', function () {
  it('has a working constructor', function () {
    const component = new Entity(EntityType.COMPONENT, 'a', 'A')
    expect(component.type).to.equal(EntityType.COMPONENT)
    expect(component.id).to.equal('a')
    expect(component.name).to.equal('A')

    const actor = new Entity(EntityType.ACTOR, 'b', 'B')
    expect(actor.type).to.equal(EntityType.ACTOR)
    expect(actor.id).to.equal('b')
    expect(actor.name).to.equal('B')
  })
})
