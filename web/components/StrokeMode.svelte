<script lang="ts">
  /* IMPORTS */
  import Form from './Form.svelte'
  import Input from './Input.svelte'
  /* PROPS */
  /* IMPORTS (stores) */
  import { strokeMode, currentSequenceInitialized } from '../stores'
  /* DECLARATIONS (local state) */
  const formId = 'form-stroke-mode'
  /* DECLARATIONS (local functions) */
  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<Form id={formId}>
  <Input
    {formId}
    disabled={$currentSequenceInitialized}
    label="mode"
    type="number"
    key="stroke-mode"
    bind:value={$strokeMode}
    min={0}
    max={1}
    oneChar
    noPad
  />
</Form>

<style type="css"></style>
