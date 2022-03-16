<script lang="ts">
	import Coordinates from "./components/Coordinates.svelte";
</script>

<main>
	<section>
    <h1>draw32</h1>
    <Coordinates />
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
    border: 1px solid black;

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

  section {
    /*background-color: #eee;*/
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
