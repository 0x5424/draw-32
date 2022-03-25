<script lang="ts">
  /* IMPORTS */
  import type { MatrixRow } from '../util/matrix'
  import Cell from './Cell.svelte'
  /* PROPS */
  export let matrix: MatrixRow[][]
  /* IMPORTS (stores) */
  /* DECLARATIONS (local state) */
  /* DECLARATIONS (local functions) */
  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<table cellspacing="1">
  <tbody>
    {#each matrix as row}
      <tr>
        {#each row as {bit, x, y}}
          <Cell {bit} cellX={x} cellY={y} />
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<style type="css">
  table {
    font-size: 8px;
    table-layout: fixed;
    border: solid 1px black;
    background: #f4f4f4;
    font-family: monospace;
  }
</style>
