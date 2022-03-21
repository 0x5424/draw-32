<script lang="ts">
  /* IMPORTS */
  import { MatrixRow } from '../util/matrix'
  /* PROPS */
  export let matrix: MatrixRow[]
  /* IMPORTS (stores) */
  /* DECLARATIONS (local state) */
  /* DECLARATIONS (local functions) */
  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<table cellspacing="1">
  <tbody>
    {#each matrix as row, rowNum}
      <tr>
        {#each row as {bit, x, y}}
          <td>
            {bit}
          </td>
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

  td {
    width: 9px;
    height: 9px;
    padding: 0;
  }
</style>
