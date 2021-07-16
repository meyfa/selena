import { Sequence } from './src/sequence/sequence'
import { tokenize } from './src/tokenizer/tokenizer'
import { parse } from './src/parser/parser'

/**
 * Given an input string containing the sequence specification, perform a full tokenize and parse
 * to obtain the resulting sequence.
 *
 * @param input The input code.
 * @returns The parsed sequence.
 */
export function compileToSequence (input: string): Sequence {
  const tokens = tokenize(input)
  return parse(tokens)
}

// re-export important types

export { tokenize } from './src/tokenizer/tokenizer'
export { Token, TokenType } from './src/tokenizer/token'
export { TokenStream } from './src/tokenizer/token-stream'
export { TokenizerError } from './src/tokenizer/errors'

export { parse } from './src/parser/parser'
export { ParserError } from './src/parser/errors'

export { Sequence } from './src/sequence/sequence'
export { Entity, EntityType } from './src/sequence/entity'
export { Activation } from './src/sequence/activation'
export { Message, MessageStyle } from './src/sequence/message'

export { Size } from './src/util/geometry/size'
export { Point } from './src/util/geometry/point'
export { Diagram } from './src/diagram/diagram'

export { RenderAttributes, Renderer, DirectRenderer, LineMarker, StrokeOptions } from './src/renderer/renderer'
export { BrowserSvgRenderer } from './src/renderer/browser-svg/browser-svg-renderer'
