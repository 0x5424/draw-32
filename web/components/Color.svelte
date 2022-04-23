<script lang="ts">
  /* IMPORTS */
  import Form from './Form.svelte'
  import Input from './Input.svelte'
  import {
    commitColor, commitStrokeMode,
    ColorIndex
  } from '../util/instruction'
  import { PALETTE } from '../util/palette'
  /* PROPS */
  /* IMPORTS (stores) */
  import { color, currentInstructionBuffer, currentSequenceInitialized, strokeMode } from '../stores'
  /* DECLARATIONS (local state) */
  const formId = 'form-color'

  /** @todo Dynamic palette */
  /* DECLARATIONS (local functions) */
  const onFormSubmit = () => {
    const newColorIndex = PALETTE.indexOf($color)
    if (newColorIndex < 0 || newColorIndex >= 16) return

    if (!$currentSequenceInitialized) $currentInstructionBuffer = [commitStrokeMode($strokeMode)]
    $currentInstructionBuffer = [...$currentInstructionBuffer, commitColor(newColorIndex as ColorIndex)]
  }
  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<Form id={formId} {onFormSubmit}>
  <Input {formId} type="text" label="#" key="color" bind:value={$color} noPad />
</Form>

<style type="css"></style>
