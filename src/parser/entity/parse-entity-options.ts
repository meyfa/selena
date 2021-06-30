import { Token, TokenType } from '../../tokenizer/token'
import { DuplicateOptionError, UnsupportedOptionError } from '../errors'
import { entityOptions } from '../strings'
import { defaultEntityOptions, EntityOptions } from './entity-options'
import { TokenAccessor } from '../token-accessor'

function applyOption (token: Token, option: string, obj: EntityOptions): void {
  if (option === entityOptions.actor) {
    obj.isActor = true
    return
  }
  throw new UnsupportedOptionError(token, option, [entityOptions.actor])
}

function getOptions (tokens: TokenAccessor): EntityOptions {
  const set = new Set<string>()
  const options: EntityOptions = { ...defaultEntityOptions }
  for (let optToken; (optToken = tokens.popOptional(TokenType.WORD)) != null;) {
    const opt = optToken.value
    if (set.has(opt)) {
      throw new DuplicateOptionError(optToken, opt)
    }
    applyOption(optToken, opt, options)
    set.add(opt)
  }
  return options
}

/**
 * Determine whether the given token marks the beginning of entity options.
 * This will only produce valid results for tokens at the correct position within entity definitions.
 *
 * @param {Token} token The next token in the input stream.
 * @returns {boolean} Whether the token could be parsed as entity options.
 */
export function detectEntityOptions (token: Token): boolean {
  return token.type === TokenType.PAREN_LEFT
}

/**
 * Force-parse entity options from the given stream.
 *
 * @param {TokenAccessor} tokens The input stream.
 * @returns {EntityOptions} The parsed options.
 */
export function parseEntityOptions (tokens: TokenAccessor): EntityOptions {
  tokens.pop(TokenType.PAREN_LEFT)
  const options = getOptions(tokens)
  tokens.pop(TokenType.PAREN_RIGHT)

  return options
}
