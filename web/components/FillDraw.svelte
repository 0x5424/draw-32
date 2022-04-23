<script lang="ts">
  /* Angle the cursor will drift as it draws */

  /* PROPS */
  /* IMPORTS */
  import Form from './Form.svelte'
  /* IMPORTS (stores) */
  import {
    commitFill, commitJump, commitStrokeMode, performDraw,
    PerformDrawArguments
  } from '../util/instruction'
  import {
    currentInstructionBuffer, cursor, prevCursor, currentSequenceInitialized, strokeMode,
    visited, toVisit
  } from '../stores'
  /* DECLARATIONS (local state) */
  const formId = 'form-fill-draw'
  /* DECLARATIONS (local functions) */
  const onFormSubmit = () => {
    const drawArgs: PerformDrawArguments = {drawInstruction: commitFill()}

    if (!$currentSequenceInitialized) $currentInstructionBuffer = [commitStrokeMode($strokeMode)]
    if ($cursor.join() !== $prevCursor.join()) $currentInstructionBuffer = drawArgs.jumpInstruction = commitJump(...$cursor)

    $currentInstructionBuffer = [...$currentInstructionBuffer, performDraw(drawArgs)]

    $visited = {...$visited, ...$toVisit}
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
