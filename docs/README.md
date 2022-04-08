# `draw32`

This markdown file will contain instructions for setting up the `draw32` instruction builder SPA.
For design philosophy & a further technical breakdown, see the adjacent [`ABSTRACT.md`](./ABSTRACT.md).

The remaining documentation here will largely pertain to the SPA, with a few sections briefly touching upon concepts referenced in the abstract.

The SPA itself uses the [Svelte](https://svelte.dev/docs) framework. Please refer to their documentation for more info on the project structure.

## Dependencies
The project is written in TypeScript. It is installed via the `npm` package manager, which is reliant on `node` being available on the host machine.

## Setup
After installing the appropriate node.js version, the remaining dependencies will be made available after running `npm install` from the project root.

The app can then run locally with `npm run dev`[^1].

[^1]: MacOS users may need to [specify a different port](https://github.com/lukeed/sirv/issues/124) when running the app.

<!-- ## API -->

<!-- ## Usage -->

## Browser Support
Currently, the app is targeting browsers in environments with full keyboard access. Namely, it currently depends on the *arrow keys* to modify some form values.

Depending on the complexity of the desired image and canvas size, browsers/tablets will naturally be a better fit for using the software.
Long-term, the SPA aims to support a touch/stylus "artist mode", intended to abstract away the internals surrounding cursor, rotation, etc[^1]--providing more creative freedom to artists.

[^1]: Artist mode specifications are not yet defined. Discussion contributions welcome

- Unfortunately, the `PatternDraw` component is failing to register onSubmit events with 100% reproducability on Safari. Additional debugging is necessary to create a full bug report to upstream maintainers.
  - The cause is confirmed to only happen when the `Form` submit input (only for that component) has `display: none`. Does not happen on Chromium
  - Current workaround is by using the [`accesskey`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-accesskey) directive for that form.

## Testing
Unit tests are placed adjacent to their respective files in dedicated `__specs` folders. At present, only unit tests for instruction parsing/encoding is included.

Tests for webapp components are considered a tertiary priority, as the overall design is still subject to changes.

## Contributing
Feel free to address any of the issues listed in the github issue tracker. Discussion around each issue is also welcome.

Then, for code contributions:
1. Fork this repository
2. Branch off `source`
3. Ensure CI is successful after the inclusion of your changes
4. Create a pull request
