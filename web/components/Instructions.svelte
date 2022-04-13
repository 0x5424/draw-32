<script lang="ts">
  /* Angle the cursor will drift as it draws */

  /* PROPS */
  /* IMPORTS */
  /* IMPORTS (stores) */
  import { allSequences } from '../stores'
  /* DECLARATIONS (local state) */

  /* DECLARATIONS (local functions) */
  const formatSequence = (binString: string) => {
    if (binString === '') return '';

    const hex = BigInt(`0b${binString}`).toString(16)

    return `0x${hex}`
  }

  const saveSequence = () => {}
  // const undoSequence = () => {}

  const logInstructions = () => console.log($allSequences)
  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<div class="instructions">
  <span>
    [
      {$allSequences.map(formatSequence).join(',')}
    ]
  </span>
</div>

<div>
  <button on:click={saveSequence}>Save</button>
  <!-- <button on:click={undoSequence}>Undo</button> -->
  <button on:click={logInstructions}>Log</button>
</div>

<style>
  div {
    font-family: monospace;
  }

  .instructions {
    box-shadow: inset 0 0 1.5px slategrey;
    background-color: #f4f4f4;
    text-align: left;
  }

  button {
    border: 2px outset #f4f4f4;
  }

  button:not(:disabled):active {
    border: 2px inset #f4f4f4;
  }
</style>
