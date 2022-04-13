<script lang="ts">
  /* Values to draw a "pattern" */

  /* PROPS */
  /* IMPORTS */
  import Form from './Form.svelte'
  import Input from './Input.svelte'

  import {
    commitRotate, commitPatternDraw, commitJump, performDraw,
    PerformDrawArguments, Direction
  } from '../util/instruction'
  /* IMPORTS (stores) */
  import {
    cw, patternOneLength, patternTwoLength, rawPattern, direction, directionText, prevDirection,
    currentSequence, cursor, cursorX, cursorY, prevCursor, visited,
    patternCoordinates
  } from '../stores'
  /* DECLARATIONS (local state) */
  const formId = 'form-pattern-draw'
  /* DECLARATIONS (local functions) */
  const onFormSubmit = () => {
    const drawArgs: PerformDrawArguments = {
      drawInstruction: commitPatternDraw({
        cw: $cw,
        p1Length: $patternOneLength,
        p2Length: $patternTwoLength,
        pattern: $rawPattern,
      })
    }

    if ($direction !== $prevDirection) drawArgs.rotateInstruction = commitRotate($directionText as Direction)
    if ($cursor.join() !== $prevCursor.join()) drawArgs.rotateInstruction = commitJump(...$cursor as [number, number])

    $currentSequence = [...$currentSequence, performDraw(drawArgs)]

    // Lastly, set new coords, set pixels & reset form values
    const [newX, newY] = $patternCoordinates[2]
    const newlyTraversed = {}
    $patternCoordinates[0].map(([x, y]) => newlyTraversed[`${x}:${y}`] = true)
    $patternCoordinates[1].map(([x, y]) => newlyTraversed[`${x}:${y}`] = true)

    $cursorX = newX
    $cursorY = newY
    $prevDirection = $direction
    $prevCursor = [newX, newY]
    $visited = {...$visited, ...newlyTraversed}
    $patternOneLength = 1
    $patternTwoLength = 2
    $rawPattern = ''
  }

  /* NOTE: Absolutely crazy WTF gotcha: Safari onSubmit is never firing, _only_ for this component. As workaround, using accesskey */

  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<Form id={formId} accesskey="p" flexForm {onFormSubmit} >
  <Input {formId} flexGrow type="number" label="p1" key="pattern-one-length" bind:value={$patternOneLength} max={4} />
  <Input {formId} flexGrow type="number" label="p2" key="pattern-two-length" bind:value={$patternTwoLength} min={2} max={5} />
  <Input {formId} type="text" pattern="[0-1]*" label="seq:" key="raw-pattern" bind:value={$rawPattern} noPad/>
</Form>

<style></style>
