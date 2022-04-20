<script lang="ts">
  /* Angle the cursor will drift as it draws */

  /* PROPS */
  /* IMPORTS */
  /* IMPORTS (stores) */
  import { pastSequences, currentSequence, allSequences, canvas } from '../stores'
  /* DECLARATIONS (local state) */

  /* DECLARATIONS (local functions) */
  const formatSequence = (binString: string) => {
    if (binString === '') return ''

    const hex = BigInt(`0b${binString}`).toString(16)

    return `0x${hex}`
  }

  const saveSequence = () => {
    $pastSequences = [...$pastSequences, $currentSequence]
    $currentSequence = []
  }
  // const undoSequence = () => {}

  const logState = () => {
    console.log('INSTRUCTIONS:', $allSequences)

    console.log('CANVAS:', $canvas)
  }
  /* STORES (subscriptions) */
  $: value = `[\n${$allSequences.map(formatSequence).join(',\n')}\n]`
  /* LIFECYCLE */

  // Hack, as eslint does not recognize `value` being used in component
  value
</script>

<div>
  <textarea
    {value}
    readonly
    rows={$allSequences.length + 2}
    cols=24
  />
</div>

<div>
  <button on:click={saveSequence}>Save</button>
  <!-- <button on:click={undoSequence}>Undo</button> -->
  <button on:click={logState}>Log</button>
</div>

<style>
  div {
    font-family: monospace;
  }

  textarea {
    box-shadow: inset 0 0 1.5px slategrey;
    background-color: #f4f4f4;
    text-align: left;
    resize: none;
    outline: none;
    border:  none;
    /* Allow textarea width to grow  */
    word-wrap: normal;
    word-break: keep-all;
  }

  button {
    border: 2px outset #f4f4f4;
  }

  button:not(:disabled):active {
    border: 2px inset #f4f4f4;
  }
</style>
