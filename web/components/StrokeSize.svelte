<script lang="ts">
  /* IMPORTS */
  import Form from './Form.svelte'
  import Input from './Input.svelte'
  /* PROPS */
  /* IMPORTS (stores) */
  import { strokeSize, currentSequenceInitialized } from '../stores'
  /* DECLARATIONS (local state) */
  const formId = 'form-stroke-size'
  /* DECLARATIONS (local functions) */
  const onKeydown = ({ key }) => {
    if (/(Left|Down|l|d)$/.test(key)) return $strokeSize = 1
    if (/(Right|Up|r|u| )$/.test(key)) return $strokeSize = 3
  }
  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<Form id={formId}>
  <Input {formId} readonly disabled={$currentSequenceInitialized} label="s" type="number" key="stroke-size" value={$strokeSize} {onKeydown} oneChar noPad/>
</Form>

<style type="css"></style>
