<script lang="ts">
  /* IMPORTS */
  import Form from './Form.svelte'
  import Input from './Input.svelte'
  /* PROPS */
  /* IMPORTS (stores) */
  import { color } from '../stores'
  /* DECLARATIONS (local state) */
  const formId = 'form-stroke-width'
  /* DECLARATIONS (local functions) */
  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<Form id={formId}>
  <Input {formId} type="text" key="color" bind:value={$color} noPad />
</Form>

<style type="css"></style>
