This doc is a high-level overview regarding the design decisions for this software.
For setup instructions, please refer to the adjacent [`README`](./README.md).

## Intro

This software is intended for use in environments where any of the following applies:
- malloc is expensive, or limited up to 32 bytes
- bus or variable size is important
- file decoding can be deferred to clients

## TL;DR

Given a primitive of type `bytes32[]` wherein each member represents an instruction, clients can decode these elements sequentially to produce an arbitrary image.
When used for rendering pixel art, the resulting file size is many multiples smaller than similar bitmap image formats.

## Summary

To prepare an image, the following structures are necessary:
- Canvas
- Paint cursor (herafter: Cursor)
- Instruction parser (herafter: Parser)

Lastly, to output a file which can be recognized by browsers/etc.
- Converter (ie. to svg)

Coincidentally, the above functions are a strict hierarchy--the layer above can only interact with the layer directly below:
```
Parser
  | modifies state of
  v
  Cursor
    | sets pixels within
    v
    Canvas
      | creates bitmap for
      v
      Converter
```

The next sections outline the functionality of each aforementioned structure, and a suggested API for each.

### Canvas (ongoing)

A canvas is the raw bitmap of pixels for an output image.
<!--
It **MUST** accept inputs in the form of coordinates, stroke size, and stroke direction.
It **MUST** also accept inputs for performing a breadth-first fill.
-->

### Cursor (ongoing)

A cursor follows a pair of coordinates as it moves across a canvas. Invoking the cursor to "draw" will simultaneously update it's position based on the cursor's rotation and direction.

### Parser (ongoing)

A parser's responsiblity is sequentially reading commands to alter the state of the cursor.

### Converter

A converter will take a raw canvas bitmap and produce a valid file/binary to be read by other programs.

> In a future revision, this abstract will contain a basic implementation for converting to `svg` format.
