<script lang="ts">
  /* Insert N consecutive pixels */

  /* PROPS */
  /* IMPORTS */
  import Form from './Form.svelte'
  import Input from './Input.svelte'

  import {
    commitRotate, commitInsertDraw, commitJump, commitStrokeSize, performDraw,
    PerformDrawArguments
  } from '../util/instruction'

  /* IMPORTS (stores) */
  import {
    cw, insertLength, direction, directionText, prevDirection,
    cursor, cursorX, cursorY, prevCursor, visited, currentSequenceInitialized, strokeSize,
    currentSequence, insertCoordinates
  } from '../stores'
  /* DECLARATIONS (local state) */
  const formId = 'form-insert-draw'
  /* DECLARATIONS (local functions) */
  const onFormSubmit = () => {
    if (!$insertLength) return
    const drawArgs: PerformDrawArguments = {
      drawInstruction: commitInsertDraw({ cw: $cw, length: $insertLength })
    }

    if (!$currentSequenceInitialized) $currentSequence = [commitStrokeSize($strokeSize as 1 | 3)]

    if ($direction !== $prevDirection) drawArgs.rotateInstruction = commitRotate($directionText)
    if ($cursor.join() !== $prevCursor.join()) drawArgs.rotateInstruction = commitJump(...$cursor as [number, number])

    $currentSequence = [...$currentSequence, performDraw(drawArgs)]

    // Lastly, set new coords, set pixels & reset form values
    const [newX, newY] = $insertCoordinates[1]
    const newlyTraversed = {}
    $insertCoordinates[0].map(([x, y]) => newlyTraversed[`${x}:${y}`] = true)

    $cursorX = newX
    $cursorY = newY
    $prevDirection = $direction
    $prevCursor = [newX, newY]
    $visited = {...$visited, ...newlyTraversed}
    $insertLength = 1
  }
  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<Form id={formId} flexForm {onFormSubmit} >
  <Input {formId} flexGrow type="number" label="insert" key="length-insert" bind:value={$insertLength} max={64} />
</Form>

<style></style>
