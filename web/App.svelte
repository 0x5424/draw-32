<script lang="ts">
	/* hey, wanna hire me? */
</script>

<main>
	<section>
	   <h1>draw32</h1>
   </section>

  <section>
    <h2>Canvas</h2>
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
    border: 1px solid black;

    /* Grid */
    display: grid;
    grid-template-columns: 1fr 3fr;
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

  h2 {
    font-weight: 100;
    margin-top: 0px;
  }

  section {
    background-color: #eee; /* confirm layout */
    height: inherit;
    max-height: 100vh;
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
