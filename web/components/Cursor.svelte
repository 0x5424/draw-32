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
  const formId = 'form-cursor'
  /* DECLARATIONS (local functions) */
  /**
   * Hack to set direction text as an arrow.
   * If tab pressed assume select next form element, else we do nothing (preventDefault)
   */
  const onKeydown = ({ key }) => {
    if (/(ArrowLeft|l)$/.test(key)) return $direction = '←'
    if (/(ArrowDown|d)$/.test(key)) return $direction = '↓'
    if (/(ArrowRight|r)$/.test(key)) return $direction = '→'
    if (/(ArrowUp|u)$/.test(key)) return $direction = '↑'
  }
  /* STORES (subscriptions) */
  /* LIFECYCLE */

  // todo:
  // 3. (HOC) Add rulers when updating cursors
  // 4. Add commitJump when unfocusing
</script>

<Form id={formId} flexForm on:change|once={initializeControls}>
  <Input {formId} label="X" key="cursor-x" bind:value={$cursorX} />
  <Input {formId} label="Y" key="cursor-y" bind:value={$cursorY} />
  <Input readonly {formId} key="cursor-dir" type="text" bind:value={$direction} {onKeydown} flexGrow oneChar/>
</Form>

<style></style>
