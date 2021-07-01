import { Entity } from '../../sequence/entity'
import { Token } from '../../tokenizer/token'
import { Activation } from '../../sequence/activation'

/**
 * The script can specify a message "type", which is a subset of MessageStyle.
 * This does not include things such as found messages / lost messages, those are detected by other means and hence
 * not included in this enum.
 */
export enum MessageType {
  SYNC,
  ASYNC,
  CREATE,
  DESTROY
}

/**
 * A message description is a complete representation of a message (including a block, if one is present).
 * This does not differentiate between message species but simply states everything as it appears in the script.
 * Message descriptions contain "evidence" for each property (= the tokens causing that property to have its value).
 */
export interface MessageDescription {
  type: MessageType
  fromOutside: boolean
  target: Entity | undefined
  label: string
  block: MessageBlock | undefined

  evidence: {
    type: Token
    fromOutside: Token
    target: Token
    label: Token
    block: Token
  }
}

/**
 * A message block is the part of a message description that contains child messages.
 * As such, it stores a list of activations and potentially a return value.
 * Evidence will be included for the latter (to enable throwing an error if a return value was provided when none is
 * allowed, or if one was not provided where it is required).
 */
export interface MessageBlock {
  activations: Activation[]
  returnValue: string | undefined

  evidence: {
    returnValue: Token
  }
}
