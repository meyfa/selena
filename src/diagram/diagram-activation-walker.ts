import { ActivationWalker } from './activation-walker.js'
import { ActivationBarDiagramPart } from './parts/activation-bar-diagram-part.js'
import { Activation } from '../sequence/activation.js'
import { MessageStyle } from '../sequence/message.js'
import { DiagramBuilder } from './diagram-builder.js'

/**
 * A class that recursively visits activations ("walking") and constructs the required
 * messages and activation bars on a diagram builder.
 */
export class DiagramActivationWalker extends ActivationWalker<ActivationBarDiagramPart | undefined> {
  constructor (
    private readonly builder: DiagramBuilder
  ) {
    super()
  }

  protected override shouldActivate (node: Activation): boolean {
    // only the following types of messages cause activations, all others don't
    switch (node.message.style) {
      case MessageStyle.SYNC:
      case MessageStyle.ASYNC:
      case MessageStyle.FOUND:
        return true
      default:
        return false
    }
  }

  protected override pre (node: Activation, fromLevel: number, toLevel: number, active: boolean): ActivationBarDiagramPart | undefined {
    // every activation causes a message to be created
    const message = this.builder.appendMessage(node, fromLevel, toLevel)
    // specific types of messages also cause activation bars to be created
    if (active && node.message.to != null) {
      return this.builder.appendActivationBar(node.message.to, message.index, toLevel)
    }
    return undefined
  }

  protected override post (node: Activation, fromLevel: number, toLevel: number, activation: ActivationBarDiagramPart | undefined): void {
    // every activation with a target causes a reply to be created (some are synthetic)
    const reply = this.builder.appendReply(node, fromLevel, toLevel, activation != null)
    // if an activation bar exists, let it know about the reply
    if (activation != null && reply != null) {
      activation.endMessageId = reply.index
    }
  }
}
