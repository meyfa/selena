import { Entity, EntityType } from '../../sequence/entity.js'
import { Token, TokenType } from '../../tokenizer/token.js'
import { unquote } from '../unquote.js'
import { detectEntityOptions, parseEntityOptions } from './parse-entity-options.js'
import { keywords } from '../strings.js'
import { defaultEntityOptions } from './entity-options.js'
import { TokenAccessor } from '../token-accessor.js'

/**
 * Determine whether the given token marks the beginning of an entity definition.
 * This will only produce valid results for tokens at global scope.
 *
 * @param token The next token in the input stream.
 * @returns Whether the token could be parsed as an entity definition.
 */
export function detectEntity (token: Token): boolean {
  return token.type === TokenType.WORD && token.value === keywords.object
}

/**
 * Force-parse an entity definition from the given stream.
 *
 * @param tokens The input stream.
 * @returns The parsed entity.
 */
export function parseEntity (tokens: TokenAccessor): Entity {
  tokens.pop(TokenType.WORD, keywords.object)

  const options = detectEntityOptions(tokens.peek())
    ? parseEntityOptions(tokens)
    : defaultEntityOptions

  const type = options.isActor ? EntityType.ACTOR : EntityType.COMPONENT

  const id = tokens.pop(TokenType.WORD).value
  tokens.pop(TokenType.EQUALS)
  const displayName = unquote(tokens.pop(TokenType.STRING))

  return new Entity(type, id, displayName)
}
