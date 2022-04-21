<script lang="ts">
  /* PROPS */
  export let bit: '0' | '1'
  export let cellX: number
  export let cellY: number
  /* IMPORTS */
  import { fade } from 'svelte/transition'
  import { quadInOut as easing } from 'svelte/easing'
  /* IMPORTS (stores) */
  import { cursor, cursorX, cursorY, visited, drawMode, patternCoordinates, insertCoordinates, toVisit } from '../stores'
  /* DECLARATIONS (local state) */
  const currentCell = [cellX, cellY].join(':')
  /* DECLARATIONS (local functions) */
  const formatCell = (ary: [number, number]) => ary.join(':')
  const onClick = () => {
    $cursorX = cellX
    $cursorY = cellY
  }
  const transformColor = (str: string, outline = false) => {
    if (str === 'alpha') return false
    if (!/^[0-9a-f]{6}$/.test(str)) throw new Error('invalid color format')

    const rgb = str.match(/[0-9a-f]{2}/g)
    if (!outline) return `#${rgb.join('')}`

    return `rgba(${rgb.map(color => parseInt(color, 16)).join()}, 0.5)`
  }

  /* STORES (subscriptions) */
  $: visitedColor = $visited[currentCell]
  $: isCursor = $cursor.join(':') === currentCell
  $: isPatternOne = $drawMode === 'pattern' && $patternCoordinates[0].map(formatCell).includes(currentCell)
  $: isPatternTwo = $drawMode === 'pattern' && $patternCoordinates[1].map(formatCell).includes(currentCell)
  $: isInsertCell = $drawMode === 'insert' && $insertCoordinates[0].map(formatCell).includes(currentCell)
  $: nextCursor = ($drawMode === 'insert' && $insertCoordinates[1]) || ($drawMode === 'pattern' && $patternCoordinates[2]) || []
  $: isToVisitCell = $toVisit[currentCell]
  $: style = visitedColor && transformColor(visitedColor) && `background-color: ${transformColor(visitedColor)}; outline: solid 1px ${transformColor(visitedColor, true)}`
  /* LIFECYCLE */
</script>

{#key isPatternOne || isPatternTwo || isInsertCell}
  <td
    in:fade={{ easing, duration: 80 }}
    {style}
    class:cell-on={bit === '1'}
    class:cell-visited={!!visitedColor}
    class:cell-cursor={isCursor}
    class:cell-pattern-one={isPatternOne}
    class:cell-pattern-two={isPatternTwo}
    class:cell-insert={isInsertCell}
    class:cell-next-cursor={nextCursor?.join(':') === currentCell}
    class:cell-to-visit={isToVisitCell}
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
    outline: inset 1px slategrey;
    cursor: pointer;
  }

  .cell-on:not(.cell-visited) {
    border: outset 1px slategrey;
    background: #bbb;
  }

  .cell-on:not(.cell-visited):hover {
    border: inset 1px slategrey;
    background: #f4f4f4;
  }

  .cell-visited { color: rgba(0,0,0, 0) }

  .cell-cursor {
    border: inset 1px #3d3;
    background: #4f4 !important;
  }

  .cell-pattern-one { background: skyblue !important; }
  .cell-pattern-two { background: deepskyblue !important; }
  .cell-insert { background: lightsteelblue !important; }

  .cell-to-visit {
    background: #bfb;
    outline: solid 1px #bfb;
  }

  .cell-fill.cell-on {
    border: outset 1px #4f4;
    outline: solid 1px rgba(0,0,0, 0);
  }

  .cell-next-cursor {
    border: inset 1px #faa;
    background: #fab !important;
  }
</style>
