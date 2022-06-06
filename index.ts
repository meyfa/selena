import { Sequence } from './src/sequence/sequence.js'
import { tokenize } from './src/tokenizer/tokenizer.js'
import { parse } from './src/parser/parser.js'

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

export { tokenize } from './src/tokenizer/tokenizer.js'
export { Token, TokenType } from './src/tokenizer/token.js'
export { TokenStream } from './src/tokenizer/token-stream.js'
export { TokenizerError } from './src/tokenizer/errors.js'

export { parse } from './src/parser/parser.js'
export { ParserError } from './src/parser/errors.js'

export { Sequence } from './src/sequence/sequence.js'
export { Entity, EntityType } from './src/sequence/entity.js'
export { Activation } from './src/sequence/activation.js'
export { Message, MessageStyle } from './src/sequence/message.js'

export { Size } from './src/util/geometry/size.js'
export { Point } from './src/util/geometry/point.js'
export { Diagram } from './src/diagram/diagram.js'

export { RenderAttributes, Renderer, DirectRenderer, LineMarker, StrokeOptions } from './src/renderer/renderer.js'
export { BrowserSvgRenderer } from './src/renderer/browser-svg/browser-svg-renderer.js'
