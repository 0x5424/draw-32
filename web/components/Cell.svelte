<script lang="ts">
  /* PROPS */
  export let bit: '0' | '1'
  export let cellX: number
  export let cellY: number
  /* IMPORTS */
  /* IMPORTS (stores) */
  import { cursor, visited, drawMode, patternCoordinates, insertCoordinates } from '../stores'
  /* DECLARATIONS (local state) */
  const currentCell = [cellX, cellY].join(':')
  /* DECLARATIONS (local functions) */
  /* STORES (subscriptions) */
  $: isVisited = $visited[currentCell];
  $: isCursor = $cursor.join(':') === currentCell
  $: isPatternOne = $drawMode === 'pattern' && $patternCoordinates[0].map(ary => ary.join(':')).includes(currentCell)
  $: isPatternTwo = $drawMode === 'pattern' && $patternCoordinates[1].map(ary => ary.join(':')).includes(currentCell)
  $: isInsertCell = $drawMode === 'insert' && $insertCoordinates[0].map(ary => ary.join(':')).includes(currentCell)
  /* LIFECYCLE */
</script>

<td
  class:cell-on={bit === '1'}
  class:cell-visited={isVisited}
  class:cell-cursor={isCursor}
  class:cell-pattern-one={isPatternOne}
  class:cell-pattern-two={isPatternTwo}
  class:cell-insert={isInsertCell}
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

  .cell-cursor {
    border: inset 1px #3d3;
    background: #4f4;
  }

  .cell-pattern-one { background: skyblue !important; }
  .cell-pattern-two { background: deepskyblue !important; }
  .cell-insert { background: deepskyblue !important; }
</style>
