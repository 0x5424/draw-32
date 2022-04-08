This doc is a high-level overview regarding the design decisions for this software.
For setup instructions, please refer to the adjacent [`README`](./README.md).

## Intro

This software is intended for use in environments where any of the following applies:
- data storage is expensive, but auxilliary space is trivial
- bus or variable size is important
- image decoding can be deferred to clients
- at most 16 colors are used in the resulting image

It is designed to be an _intermediary format_, preparing an indexed bitmap to be processed by other image processing software.

> There are no plans to convert this specification into a standalone file format, but this _may_ be considered in a future revision.

## TL;DR

Given a primitive of type `bytes32[]` wherein each member represents an instruction, clients can decode these elements sequentially to produce an arbitrary image.
When used for pixel art with low detail, the resulting storable file size is many multiples smaller than similar bitmap image formats.
The image will support any `16` out of the `16,777,216` colors in "truecolor" (24-bit depth w/ 8 bits for transparency).

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
<!-- Somewhat contrived, as our raster image won't be able to benefit from the vector specification... unless? 👀 -->
