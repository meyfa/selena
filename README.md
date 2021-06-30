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
