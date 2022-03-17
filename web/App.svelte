<script lang="ts">
  /* PROPS */
  /* IMPORTS */
  import { fade } from 'svelte/transition';
  import { quadInOut as easing } from 'svelte/easing';
	import Cursor from "./components/Cursor.svelte";
  /* STORE IMPORTS */
  /* DECLARATIONS (local state) */
  let initialized = false;
  /* DECLARATIONS (local functions) */
  const initializeControls = (): void => { initialized = true };
  /* STORES */
  /* LIFECYCLE */
</script>

<main>
	<section id="controls">
    {#if !initialized}
      <h1 out:fade={{ easing }}>draw32</h1>
    {/if}

    <Cursor {initializeControls} />
  </section>

  <div>
    <table>
      <caption>Canvas</caption>
    </table>
  </div>
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
    margin-top: 0px;
    margin-bottom: 1rem;
  }

  caption {
    font-weight: 100;
    margin-top: 0px;
  }

  div { margin: 0 auto auto; }

  table {
    box-shadow: inset 0 0 1.5px slategrey;
    /* only while content is empty */
    width: 100px;
    height: 100px;
  }

  section { padding: 0.75em; }

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
