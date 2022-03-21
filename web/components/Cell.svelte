<script lang="ts">
  /* PROPS */
  export let bit: '0' | '1'
  export let cellX: number
  export let cellY: number
  /* IMPORTS */
  /* IMPORTS (stores) */
  import { visited } from '../stores'
  /* DECLARATIONS (local state) */
  const currentCell = [cellX, cellY].join(':')
  /* DECLARATIONS (local functions) */
  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<td
  class:cell-on={bit === '1'}
  class:cell-visited={!!$visited[currentCell]}
>
  {bit}
</td>

<style type="css">
  td {
    width: 9px;
    height: 9px;
    padding: 0;
    border: solid 1px rgba(0,0,0, 0);
  }

  .cell-on {
    border: outset 1px slategrey;
    background: #bbb;
  }

  .cell-visited {
    background: #444;
    color: #eee;
  }
</style>
