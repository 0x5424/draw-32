<script lang="ts">
  /* PROPS */
  export let bit: '0' | '1'
  export let cellX: number
  export let cellY: number
  /* IMPORTS */
  import { fade } from 'svelte/transition'
  import { quadInOut as easing } from 'svelte/easing'
  /* IMPORTS (stores) */
  import { cursor, cursorX, cursorY, visited, drawMode, patternCoordinates, insertCoordinates } from '../stores'
  /* DECLARATIONS (local state) */
  const currentCell = [cellX, cellY].join(':')
  /* DECLARATIONS (local functions) */
  const formatCell = (ary: [number, number]) => ary.join(':')
  const onClick = () => {
    $cursorX = cellX
    $cursorY = cellY
  }

  /* STORES (subscriptions) */
  $: isVisited = $visited[currentCell]
  $: isCursor = $cursor.join(':') === currentCell
  $: isPatternOne = $drawMode === 'pattern' && $patternCoordinates[0].map(formatCell).includes(currentCell)
  $: isPatternTwo = $drawMode === 'pattern' && $patternCoordinates[1].map(formatCell).includes(currentCell)
  $: isInsertCell = $drawMode === 'insert' && $insertCoordinates[0].map(formatCell).includes(currentCell)
  $: nextCursor = ($drawMode === 'insert' && $insertCoordinates[1]) || ($drawMode === 'pattern' && $patternCoordinates[2])
  /* LIFECYCLE */
</script>

{#key isPatternOne || isPatternTwo || isInsertCell}
  <td
    in:fade={{ easing, duration: 80 }}
    class:cell-on={bit === '1'}
    class:cell-visited={isVisited}
    class:cell-cursor={isCursor}
    class:cell-pattern-one={isPatternOne}
    class:cell-pattern-two={isPatternTwo}
    class:cell-insert={isInsertCell}
    class:cell-next-cursor={nextCursor?.join(':') === currentCell}
    on:click={onClick}
  >
    {bit}
  </td>
{/key}

<style type="css">
  td {
    width: 9px;
    height: 9px;
    padding: 0;
    border: solid 1px rgba(0,0,0, 0);
  }

  td:hover {
    border: inset 1px slategrey;
    cursor: pointer;
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
  .cell-insert { background: lightsteelblue !important; }

  .cell-next-cursor {
    border: inset 1px #faa;
    background: #fab !important;
  }
</style>
