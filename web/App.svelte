<script lang="ts">
  /* PROPS */
  /* IMPORTS */
  import { fade } from 'svelte/transition'
  import { quadInOut as easing } from 'svelte/easing'
  import Cursor from './components/Cursor.svelte'
  import Rotation from './components/Rotation.svelte'
  import DrawMode from './components/DrawMode.svelte'
  import PatternDraw from './components/PatternDraw.svelte'
  import InsertDraw from './components/InsertDraw.svelte'
  import Canvas from './components/Canvas.svelte'
  import Instructions from './components/Instructions.svelte'
  import StrokeWidth from './components/StrokeWidth.svelte'
  import Color from './components/Color.svelte'

  import { EXAMPLE as BITMAP } from './bitmaps'
  import { parseBitmap } from './util/matrix'
  /* IMPORTS (stores) */
  import { drawMode } from './stores'
  /* DECLARATIONS (local state) */
  let initialized = false
  const matrix = parseBitmap(...BITMAP)
  /* DECLARATIONS (local functions) */
  const initializeControls = (): void => { initialized = true }
  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<main>
	<section>
    {#if !initialized}
      <h1 out:fade={{ easing }}>draw32</h1>
    {/if}

    <Cursor {initializeControls} />
    <div class="rotation-draw">
      <Rotation />
      <DrawMode />
    </div>

    <hr />
    {#if $drawMode === 'pattern'}
      <div in:fade={{ duration: 200 }}>
        <PatternDraw />
      </div>
    {:else if $drawMode === 'insert'}
      <div in:fade={{ duration: 200 }}>
        <InsertDraw />
      </div>
    {/if}

    <hr />
    <div class="stroke-color">
      <StrokeWidth />
      <Color />
    </div>
    <hr />
    <Instructions />
  </section>

  {#key matrix}
    <section in:fade={{ easing }} class="canvas-container">
      <Canvas {matrix} />
    </section>
  {/key}
</main>

<style>
	main {
    box-sizing: border-box;
    padding: 0.75em;
    height: 100%;
    text-align: center;
    max-width: 240px;
    margin: 0;
    box-shadow: inset 0 0 1.5px slategrey;

    /* Grid */
    display: grid;
    grid-template-columns: 240px 3fr;
    grid-template-rows: 1fr;
    column-gap: 2.25em;
    row-gap: normal;
  }

  h1 {
    color: slateblue;
    text-transform: uppercase;
    font-size: 3em;
    font-weight: 100;
    margin: 0;
  }

  hr { width: 80%; }

  .rotation-draw {
    display: grid;
    grid-template-columns: 2fr 3fr;
    column-gap: 2.25em;
  }

  .stroke-color {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    column-gap: 2.25em;
  }

  section.canvas-container { margin: 0 auto auto; }
  section {
    display: flex;
    flex-direction: column;
    row-gap: 1rem;
    padding: 0.75em;
  }

  @media (min-width: 240px) {
    main { max-width: none; }
  }

  @media (min-width: 370px) { /* small idevice */
    section { min-width: 185px; }
  }

  @media (max-width: 640px) { /* swap to col mode here */
    main {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 2fr;
      column-gap: normal;
      row-gap: 2.25em;
    }
  }
</style>
