import { Sequence } from './sequence/sequence.js'
import { tokenize } from './tokenizer/tokenizer.js'
import { parse } from './parser/parser.js'

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

export { tokenize } from './tokenizer/tokenizer.js'
export { Token, TokenType } from './tokenizer/token.js'
export { TokenStream } from './tokenizer/token-stream.js'
export { TokenizerError } from './tokenizer/errors.js'

export { parse } from './parser/parser.js'
export { ParserError } from './parser/errors.js'

export { Sequence } from './sequence/sequence.js'
export { Entity, EntityType } from './sequence/entity.js'
export { Activation } from './sequence/activation.js'
export { Message, MessageStyle } from './sequence/message.js'

export { Size } from './util/geometry/size.js'
export { Point } from './util/geometry/point.js'
export { Diagram } from './diagram/diagram.js'

export type { RenderAttributes, Renderer, DirectRenderer, LineMarker, StrokeOptions } from './renderer/renderer.js'
export { BrowserSvgRenderer } from './renderer/browser-svg/browser-svg-renderer.js'
