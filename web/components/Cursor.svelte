<script lang="ts">
  /* Display the coordinates of the cursor */

  /* PROPS */
  export let initializeControls: () => void
  /* IMPORTS */
  import Form from './Form.svelte'
  import Input from './Input.svelte'
  /* IMPORTS (stores) */
  import { direction, cursorX, cursorY } from '../stores'
  /* DECLARATIONS (local state) */
  /* DECLARATIONS (local functions) */
  /**
   * Hack to set direction text as an arrow.
   * If tab pressed assume select next form element, else we do nothing (preventDefault)
   */
  const onKeydown = ({ key }) => {
    if (!/(Left|Down|Right|Up)$/.test(key)) return

    if (key === 'ArrowLeft') return $direction = '←'
    if (key === 'ArrowDown') return $direction = '↓'
    if (key === 'ArrowRight') return $direction = '→'
    if (key === 'ArrowUp') return $direction = '↑'
  }
  /* STORES (subscriptions) */
  /* LIFECYCLE */

  // todo:
  // 3. (HOC) Add rulers when updating cursors
  // 4. Add commitJump when unfocusing
</script>

<Form flexForm on:change|once={initializeControls}>
  <Input label="X" key="cursor-x" bind:value={$cursorX} />
  <Input label="Y" key="cursor-y" bind:value={$cursorY} />
  <Input key="cursor-dir" type="text" bind:value={$direction} {onKeydown} flexGrow readonly/>
</Form>

<style></style>
