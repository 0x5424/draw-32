<script lang="ts">
  /* Values to draw a "pattern" */

  /* PROPS */
  /* IMPORTS */
  import Form from './Form.svelte'
  import Input from './Input.svelte'
  /* IMPORTS (stores) */
  import { patternOneLength, patternTwoLength, rawPattern } from '../stores'
  /* DECLARATIONS (local state) */
  const formId = 'form-pattern-draw'
  /* DECLARATIONS (local functions) */

  /* NOTE: Absolutely crazy WTF gotcha: Safari onSubmit is never firing, _only_ for this component. As workaround, using accesskey */

  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<Form id={formId} accesskey="p" flexForm>
  <Input {formId} flexGrow type="number" label="p1" key="pattern-one-length" bind:value={$patternOneLength} max={4} />
  <Input {formId} flexGrow type="number" label="p2" key="pattern-two-length" bind:value={$patternTwoLength} min={2} max={5} />
  <Input {formId} type="text" pattern="[0-1]*" label="seq:" key="raw-pattern" bind:value={$rawPattern} noPad/>
</Form>

<style></style>
