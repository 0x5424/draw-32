This doc is a high-level overview regarding the design decisions behind this repository.
For setup instructions, please refer to the adjacent README.

## Intro

This software is intended for use in environments where one or any of the following applies:
- malloc is expensive, or limited up to 32 bytes
- bus or variable size is important
- decoding of instructions can be deferred to clients

## TL;DR

Given a primitive of type `bytes32[]`, wherein each member is an instruction, clients can decode these elements sequentially to produce an arbitrary image.
When used for rendering pixel art, the resulting file size is many multiples smaller than similar bitmap image formats.

## Summary

(ongoing)

