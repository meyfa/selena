import { Activation } from '../sequence/activation.js'
import { CountMap } from '../util/count-map.js'

/**
 * This class can be extended to enable any kind of action on the tree-like Activation data structure.
 *
 * Methods can be provided to execute on every node: one is called in pre-order, the other in post-order.
 * In other words, the tree is iterated in natural order and one function is called before recursion,
 * the other after recursion.
 *
 * Additionally, the walker takes care of counting activation levels.
 * A level is the number of times a particular node was activated, i.e., visited during the walk.
 * Sometimes, nodes should not become activated even when visited (for "create" messages, for example).
 * For that purpose, a third method can be provided that decides whether to activate a node or not.
 */
export abstract class ActivationWalker<S> {
  /**
   * Perform a recursive walk on the given activation.
   *
   * @param root The activation.
   */
  walk (root: Activation): void {
    this.walkRecursively(root, new CountMap())
  }

  private walkRecursively (node: Activation, levels: CountMap<string>): void {
    // determine levels and potentially increment toLevel
    const fromLevel = node.message.from != null
      ? levels.get(node.message.from.id)
      : 0
    const toLevel = node.message.to != null && this.shouldActivate(node)
      ? levels.incrementAndGet(node.message.to.id)
      : 0

    // pre -> (recurse) -> post
    const state = this.pre(node, fromLevel, toLevel, toLevel > 0)
    node.children.forEach((child) => this.walkRecursively(child, levels))
    this.post(node, fromLevel, toLevel, state)

    // if level was incremented, decrement it again (make use of the fact that toLevel===0 iff it was not activated)
    if (node.message.to != null && toLevel > 0) {
      levels.decrement(node.message.to.id)
    }
  }

  /**
   * Given a node, determine whether the message target should become activated.
   *
   * @param node The current node.
   * @returns Whether the node should become activated.
   */
  protected abstract shouldActivate (node: Activation): boolean

  /**
   * This method is called in pre-order traversal of the tree.
   * In other words, this is the first thing that gets called for every node that is visited,
   * before recursion and before the post-order method.
   *
   * Implementing classes can choose to compute some state object in this method.
   * The state will be stored and passed on to the post-order method as soon as it is run.
   *
   * @param node The current node.
   * @param fromLevel The number of activations the message source had when sending the message.
   * @param toLevel The number of activations the message target now has due to the message; always 0 if not activated.
   * @param active Whether the target was activated by the message.
   * @returns The computed state.
   */
  protected abstract pre (node: Activation, fromLevel: number, toLevel: number, active: boolean): S

  /**
   * This method is called in post-order traversal of the tree.
   * In other words, this is the last thing that gets called for every node that is visited,
   * after the pre-order method and after recursion.
   *
   * Implementing classes can choose to compute some state object in the pre-order method.
   * This state is stored and passed as a parameter to this method.
   *
   * @param node The current node.
   * @param fromLevel The number of activations the message source had when sending the message.
   * @param toLevel The number of activations the message target now has due to the message; always 0 if not activated.
   * @param state The state computed during pre-order traversal.
   */
  protected abstract post (node: Activation, fromLevel: number, toLevel: number, state: S): void
}
