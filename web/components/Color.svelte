<script lang="ts">
  /* IMPORTS */
  import Form from './Form.svelte'
  import Input from './Input.svelte'
  import {
    commitColor, commitStrokeMode,
    ColorIndex
  } from '../util/instruction'
  /* PROPS */
  /* IMPORTS (stores) */
  import { color, currentSequence, currentSequenceInitialized, strokeMode } from '../stores'
  /* DECLARATIONS (local state) */
  const formId = 'form-color'

  /** @todo Make global */
  type Tuple<T, N extends number, R extends T[] = []> = N extends R['length'] ? R : Tuple<T, N, [...R, T]>

  /** @todo Dynamic palette */
  const COLOR_INDEX = [
    'ffffff', // 0; 'White'
    '000000', // 1; 'Black'
    'fd7aa0', // 2; 'Pink'
    ...(new Array(12)) as Tuple<unknown, 12>,
    'alpha', // 15; 'Transparent/BG'
  ] as Tuple<string, 16> // NOTE: Even with a Tuple, Typescript is unable to resolve `indexOf` returning between 0-15 (and -1)
  /* DECLARATIONS (local functions) */
  const onFormSubmit = () => {
    const newColorIndex = COLOR_INDEX.indexOf($color)
    if (newColorIndex < 0 || newColorIndex >= 16) return

    if (!$currentSequenceInitialized) $currentSequence = [commitStrokeMode($strokeMode)]
    $currentSequence = [...$currentSequence, commitColor(newColorIndex as ColorIndex)]
  }
  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<Form id={formId} {onFormSubmit}>
  <Input {formId} type="text" label="#" key="color" bind:value={$color} noPad />
</Form>

<style type="css"></style>
