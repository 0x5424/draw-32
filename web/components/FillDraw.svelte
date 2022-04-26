<script lang="ts">
  /* Angle the cursor will drift as it draws */

  /* PROPS */
  /* IMPORTS */
  import Form from './Form.svelte'
  import type { InstructionObject } from '../util/instruction'
  /* IMPORTS (stores) */
  import {
    cursor, prevCursor, currentSequenceInitialized, strokeMode,
    executableStores, appendSequences
  } from '../stores'
  /* DECLARATIONS (local state) */
  const formId = 'form-fill-draw'
  /* DECLARATIONS (local functions) */
  const onFormSubmit = () => {
    const draw: InstructionObject = { name: 'commitFill', arg: null }
    let instructions: InstructionObject[] = [draw]


    if ($cursor.join() !== $prevCursor.join()) instructions.unshift({ name: 'commitJump', arg: $cursor })
    if (!$currentSequenceInitialized) instructions.unshift({ name: 'commitStrokeMode', arg: $strokeMode })

    appendSequences(executableStores, instructions)
  }
  /* STORES (subscriptions) */
  $: fillText = `Fill at ${$cursor.join()}`
  /* LIFECYCLE */
</script>

<Form
  id={formId}
  {onFormSubmit}
  showSubmit
  submitText={fillText}
/>

<style></style>
