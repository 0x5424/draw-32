<script lang="ts">
  /* Insert N consecutive pixels */

  /* PROPS */
  /* IMPORTS */
  import Form from './Form.svelte'
  import Input from './Input.svelte'

  import { appendSequences, InsertInstruction } from '../util/instruction'
  import type { InstructionObject } from '../util/parse'

  /* IMPORTS (stores) */
  import {
    cw, insertLength, direction, directionText, prevDirection,
    cursor, prevCursor, currentSequenceInitialized, strokeMode,
    executableStores
  } from '../stores'
  /* DECLARATIONS (local state) */
  const formId = 'form-insert-draw'
  /* DECLARATIONS (local functions) */
  const onFormSubmit = () => {
    if (!$insertLength) return

    const draw: InstructionObject = {
      name: 'commitInsertDraw',
      arg: <InsertInstruction>{ cw: $cw, length: $insertLength }
    }
    let instructions: InstructionObject[] = [draw]

    if ($direction !== $prevDirection) instructions.unshift({ name: 'commitRotate', arg: $directionText })
    if ($cursor.join() !== $prevCursor.join()) instructions.unshift({ name: 'commitJump', arg: $cursor })
    if (!$currentSequenceInitialized) instructions.unshift({ name: 'commitStrokeMode', arg: $strokeMode })

    appendSequences(executableStores, instructions)
  }
  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<Form id={formId} flexForm {onFormSubmit} >
  <Input {formId} flexGrow type="number" label="insert" key="length-insert" bind:value={$insertLength} max={64} />
</Form>

<style></style>
