<script lang="ts">
  /* Angle the cursor will drift as it draws */

  /* PROPS */
  /* IMPORTS */
  import Form from './Form.svelte'
  import Input from './Input.svelte'
  /* IMPORTS (stores) */
  /* DECLARATIONS (local state) */
  let [lengthPattern1, lengthPattern2] = [1, 2]
  let rawPattern = ''
  const formId = 'form-pattern-draw'
  /* DECLARATIONS (local functions) */
  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<Form id={formId} flexForm>
  <Input {formId} flexGrow type="number" label="P1" key="length-pattern-1" value={lengthPattern1} max={4} />
  <Input {formId} flexGrow type="number" label="P2" key="length-pattern-2" value={lengthPattern2} min={2} max={5} />
  <Input {formId} type="text" label="value" key="raw-pattern" value={rawPattern} noPad/>
</Form>

<style></style>
