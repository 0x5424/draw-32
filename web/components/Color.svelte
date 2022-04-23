<script lang="ts">
  /* IMPORTS */
  import Form from './Form.svelte'
  import Input from './Input.svelte'
  import { appendSequences, ColorIndex } from '../util/instruction'
  import { PALETTE } from '../util/palette'
  import type { InstructionObject } from '../util/parse'
  /* PROPS */
  /* IMPORTS (stores) */
  import { color, currentSequenceInitialized, strokeMode, executableStores } from '../stores'
  /* DECLARATIONS (local state) */
  const formId = 'form-color'

  /** @todo Dynamic palette */
  /* DECLARATIONS (local functions) */
  const onFormSubmit = () => {
    console.log($color)
    const newColorIndex = PALETTE.indexOf($color)
    if (newColorIndex < 0 || newColorIndex >= 16) return

    const newColor: InstructionObject = { name: 'commitColor', arg: newColorIndex as ColorIndex }
    let instructions: InstructionObject[] = [newColor]

    if (!$currentSequenceInitialized) instructions.unshift({ name: 'commitStrokeMode', arg: $strokeMode })

    appendSequences(executableStores, instructions)
  }
  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<Form id={formId} {onFormSubmit}>
  <Input {formId} type="text" label="#" key="color" bind:value={$color} noPad />
</Form>

<style type="css"></style>
