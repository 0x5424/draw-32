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

    const hex = parseInt(binString, 2).toString(16)

    return `0x${hex}`
  }
  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<div>
  <span>
    [
      {$allSequences.map(formatSequence).join(',')}
    ]
  </span>
</div>

<style>
  div {
    box-shadow: inset 0 0 1.5px slategrey;
    background-color: #f4f4f4;
    text-align: left;
  }
  span {
    font-family: monospace;
  }
</style>
