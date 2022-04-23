<script lang="ts">
  /* Values to draw a "pattern" */

  /* PROPS */
  /* IMPORTS */
  import Form from './Form.svelte'
  import Input from './Input.svelte'

  import {
    commitRotate, commitPatternDraw, commitJump, commitStrokeMode, performDraw,
    PerformDrawArguments, PatternOffset
  } from '../util/instruction'
  /* IMPORTS (stores) */
  import {
    cw, patternOneLength, patternTwoOffset, patternTwoLength, rawPattern, direction, directionText, prevDirection,
    currentInstructionBuffer, cursor, cursorX, cursorY, prevCursor, visited, currentSequenceInitialized, strokeMode,
    patternCoordinates, toVisit
  } from '../stores'
  /* DECLARATIONS (local state) */
  const formId = 'form-pattern-draw'
  /* DECLARATIONS (local functions) */
  const onKeydown = ({ key }) => {
    if (/(Left|Down|l|d)$/.test(key)) {
      if ($patternTwoOffset - 1 <= 0) return

      return $patternTwoOffset -= 1 as 1 | 2 | 3
    }

    if (/(Right|Up|r|u| )$/.test(key)) {
      if ($patternTwoOffset + 1 >= 5) return

      return $patternTwoOffset += 1 as 2 | 3 | 4
    }
  }

  const onFormSubmit = () => {
    const drawArgs: PerformDrawArguments = {
      drawInstruction: commitPatternDraw({
        cw: $cw,
        p1Length: $patternOneLength as PatternOffset,
        p2Offset: $patternTwoOffset as PatternOffset,
        pattern: $rawPattern,
      })
    }


    if (!$currentSequenceInitialized) $currentInstructionBuffer = [commitStrokeMode($strokeMode)]

    if ($direction !== $prevDirection) drawArgs.rotateInstruction = commitRotate($directionText)
    if ($cursor.join() !== $prevCursor.join()) drawArgs.rotateInstruction = commitJump(...$cursor)

    $currentInstructionBuffer = [...$currentInstructionBuffer, performDraw(drawArgs)]

    // Lastly, set new coords, set pixels & reset form values
    const [newX, newY] = $patternCoordinates[2]

    $visited = {...$visited, ...$toVisit}
    $prevDirection = $direction
    $prevCursor = [newX, newY]
    $cursorX = newX
    $cursorY = newY
    $rawPattern = ''
  }

  /* NOTE: Absolutely crazy WTF gotcha: Safari onSubmit is never firing, _only_ for this component. As workaround, using accesskey */

  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<Form id={formId} accesskey="p" flexForm {onFormSubmit} >
  <Input {formId} flexGrow type="number" label="p1" key="pattern-one-length" bind:value={$patternOneLength} max={4} />
  <Input {formId} readonly flexGrow type="number" label="p2" key="pattern-two-length" {onKeydown} value={$patternTwoLength} min={2} max={8} />
  <Input {formId} type="text" pattern="[0-1]*" label="seq:" key="raw-pattern" bind:value={$rawPattern} noPad/>
</Form>

<style></style>
