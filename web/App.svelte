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
  /* IMPORTS (stores) */
  import { drawMode } from './stores'
  /* DECLARATIONS (local state) */
  let initialized = false
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
        <InsertDraw />
    {/if}
  </section>

  <section class="canvas-container">
    <table>
      <caption>Canvas</caption>
    </table>
  </section>
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

  caption {
    font-weight: 100;
    margin-top: 0px;
  }

  .rotation-draw {
    display: grid;
    grid-template-columns: 2fr 3fr;
    column-gap: 2.25em;
  }

  table {
    box-shadow: inset 0 0 1.5px slategrey;
    /* TODO: Remove once table ready */
    width: 100px;
    height: 100px;
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
