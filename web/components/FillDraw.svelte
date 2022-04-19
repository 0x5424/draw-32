<script lang="ts">
  /* Angle the cursor will drift as it draws */

  /* PROPS */
  /* IMPORTS */
  import Form from './Form.svelte'
  /* IMPORTS (stores) */
  import {
    commitFill, commitJump, commitStrokeSize, performDraw,
    PerformDrawArguments
  } from '../util/instruction'
  import {
    currentSequence, cursor, prevCursor, currentSequenceInitialized, strokeSize,
    visited, fillCells
  } from '../stores'
  /* DECLARATIONS (local state) */
  const formId = 'form-fill-draw'
  /* DECLARATIONS (local functions) */
  const onFormSubmit = () => {
    const drawArgs: PerformDrawArguments = {drawInstruction: commitFill()}

    if (!$currentSequenceInitialized) $currentSequence = [commitStrokeSize($strokeSize)]
    if ($cursor.join() !== $prevCursor.join()) drawArgs.rotateInstruction = commitJump(...$cursor as [number, number])

    $currentSequence = [...$currentSequence, performDraw(drawArgs)]

    $visited = {...$visited, ...$fillCells}
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
