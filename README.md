# lifeline

[![CI](https://github.com/meyfa/lifeline/actions/workflows/main.yml/badge.svg)](https://github.com/meyfa/lifeline/actions/workflows/main.yml)
[![Test Coverage](https://api.codeclimate.com/v1/badges/38ab87695968c1832c45/test_coverage)](https://codeclimate.com/github/meyfa/lifeline/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/38ab87695968c1832c45/maintainability)](https://codeclimate.com/github/meyfa/lifeline/maintainability)

**Lifeline** is a textual language that compiles to UML sequence diagrams.


## Syntax

Every Lifeline script consists of an Object Definition Section followed by a
Message Section.
There can be many object definitions and many messages.
The language includes support for comments (pieces of text not to be included
in the diagram).

### Object Definitions

Objects can be defined as follows:

```
object foo = "Foo"
object(actor) bar = "Bar"
```

This will create one _component object_ with id `foo` and label `Foo`,
as well as one _actor object_ with id `bar` and label `Bar`.

The object types differ in the way they are presented:
Components are drawn as boxes, while actors are drawn as stick figures.

### Messages

Messages (or activations) are written as arrows. Most types of messages can
have other messages as children, i.e., functions calling other functions.
For an object to send a message, it has to be _active_.
An object is active for the duration it takes to handle a message.
Initially, no object is active.
A _found message_ (message from the outside) can activate an object initially.
Afterwards, more messages can follow.
For example:

```
object foo = "Foo"
object bar = "Bar"

*->foo "a found message targeting foo" {
  ->bar "a message from foo to bar"
  ->foo "a message from foo to itself"
  ->bar {
    ->foo
  }
}

*->bar
*->bar {}
```

The above script defines two objects `foo` and `bar`.
Then there is a found message activating `foo` and a few nested messages on
multiple levels.
Note that labels are entirely optional, as are the braces (`{`, `}`) in case
there are no nested messages.

**Message types**

There are _found messages_ from the outside to an object, regular messages
between two objects, and _lost messages_ from an object to the outside.
Lost messages are specified as in the following example:

```
object foo = "Foo"
object bar = "Bar"

*->foo "foo is activated" {
  ->* "this message is leaving foo"
}
```

Again, the label is optional.
Lost messages cannot have a block (as there is no execution context).

Regular messages have different types as well.
By default, they are synchronous.
By specifying `async`, `create` or `destroy` the type of message can be
changed:

```
object foo = "Foo"
object bar = "Bar"

*->foo {
  ->(create) bar "this message creates bar"
  ->(async) bar "this is an asynchronous message" {
    ->foo "it can contain other messages"
    ->(async) foo "they can be of any type"
  }
  ->(destroy) bar "this message destroys bar"
}
```

Asynchronous messages, like synchronous messages, can have children.
`create` and `destroy` messages cannot.
If you want to be explicit about a message's synchronicity, you can specify
its type as `sync`, e.g., `->(sync) bar`, though this is not required.

Note that `create` and `destroy` will have a special effect on object
positioning inside the diagram and on the length of its lifeline.

**Return values**

By default, reply messages are automatically created for synchronous messages.
To specify the reply message label, use a `return` statement:

```
object foo = "Foo"
object bar = "Bar"

*->foo {
  ->bar "message" {
    return "reply"
  }
}
```

The above will set the reply message label to read `reply`.

Asynchronous messages do not include a reply by default.
Mostly, it makes no sense to include one, either.
Instead, an explicit second asynchronous message can serve as callback.
To specify a reply regardless, the same syntax can be used:

```
object foo = "Foo"
object bar = "Bar"

*->foo {
  ->(async) bar "async message" {
    return "with a reply"
  }
}
```

No other type of message (lost, found, `create`, `destroy`) may have a
`return` statement.

### Comments

Comments can be used to include notes in the Lifeline script that should not
appear in the diagram.
They can be positioned anywhere (except inside of strings) and begin with the
hash symbol `#`.
They extend to the end of the line.
For example:

```
# this is a comment
object foo = "Foo"  # this is another comment
```
