import { expect } from 'chai'

import { Sequence } from '../../src/sequence/sequence'
import { Entity, EntityType } from '../../src/sequence/entity'
import { Activation } from '../../src/sequence/activation'
import { FoundMessage } from '../../src/sequence/message'

describe('src/sequence/sequence.ts', function () {
  it('has a working constructor', function () {
    const entity = new Entity(EntityType.COMPONENT, 'a', 'A')
    const activation = new Activation(new FoundMessage(entity, 'foo'), undefined, [])

    const sequence = new Sequence([entity], [activation])
    expect(sequence.entities).to.deep.equal([entity])
    expect(sequence.activations).to.deep.equal([activation])
  })
})
