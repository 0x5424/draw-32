<script lang="ts">
  /* Insert N consecutive pixels */

  /* PROPS */
  /* IMPORTS */
  import Form from './Form.svelte'
  import Input from './Input.svelte'

  import { commitRotate, commitInsertDraw } from '../util/instruction'

  /* IMPORTS (stores) */
  import { cw, insertLength, direction, directionText, prevDirection, currentSequence } from '../stores'
  /* DECLARATIONS (local state) */
  const formId = 'form-insert-draw'
  /* DECLARATIONS (local functions) */
  const onFormSubmit = () => {
    if ($direction !== $prevDirection) {
      const rotateInstruction = commitRotate($directionText)

      $currentSequence = [...$currentSequence, rotateInstruction]
    }

    const insertDrawInstruction = commitInsertDraw({
      cw: $cw,
      length: $insertLength
    })

    $currentSequence = [...$currentSequence, insertDrawInstruction]
  }
  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<Form id={formId} flexForm {onFormSubmit} >
  <Input {formId} flexGrow type="number" label="insert" key="length-insert" bind:value={$insertLength} max={64} />
</Form>

<style></style>
