<script lang="ts">
  /* Insert N consecutive pixels */

  /* PROPS */
  /* IMPORTS */
  import Form from './Form.svelte'
  import Input from './Input.svelte'
  /* IMPORTS (stores) */
  /* DECLARATIONS (local state) */
  let lengthInsert: number = 1
  const formId = 'form-insert-draw'
  /* DECLARATIONS (local functions) */
  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<Form id={formId} flexForm>
  <Input {formId} flexGrow type="number" label="insert" key="length-insert" value={lengthInsert} max={64} />
</Form>

<style></style>
