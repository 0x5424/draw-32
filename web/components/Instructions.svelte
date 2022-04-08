<script lang="ts">
  /* Angle the cursor will drift as it draws */

  /* PROPS */
  /* IMPORTS */
  /* IMPORTS (stores) */
  import { allSequences } from '../stores'
  /* DECLARATIONS (local state) */

  /* DECLARATIONS (local functions) */
  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<div>
  <span>
    [
      {$allSequences.join(',')}
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
