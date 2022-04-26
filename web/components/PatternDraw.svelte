<script lang="ts">
  /* Values to draw a "pattern" */

  /* PROPS */
  /* IMPORTS */
  import Form from './Form.svelte'
  import Input from './Input.svelte'

  import type { InstructionObject, PatternInstruction } from '../util/instruction'
  /* IMPORTS (stores) */
  import {
    cw, patternOneLength, patternTwoOffset, patternTwoLength, rawPattern, direction, directionText, prevDirection,
    cursor, prevCursor, currentSequenceInitialized, strokeMode,
    executableStores, appendSequences
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
    const draw: InstructionObject = {
      name: 'commitPatternDraw',
      arg: <PatternInstruction>{
        cw: $cw,
        p1Length: $patternOneLength,
        p2Offset: $patternTwoOffset,
        pattern: $rawPattern,
      }
    }
    let instructions: InstructionObject[] = [draw]

    if ($direction !== $prevDirection) instructions.unshift({ name: 'commitRotate', arg: $directionText })
    if ($cursor.join() !== $prevCursor.join()) instructions.unshift({ name: 'commitJump', arg: $cursor })
    if (!$currentSequenceInitialized) instructions.unshift({ name: 'commitStrokeMode', arg: $strokeMode })

    appendSequences(executableStores, instructions)
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
