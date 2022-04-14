<script lang="ts">
  /* IMPORTS */
  import Form from './Form.svelte'
  import Input from './Input.svelte'
  /* PROPS */
  /* IMPORTS (stores) */
  import { strokeWidth } from '../stores'
  /* DECLARATIONS (local state) */
  const formId = 'form-stroke-width'
  /* DECLARATIONS (local functions) */
  const onKeydown = ({ key }) => {
    if (/(Left|Down|l|d)$/.test(key)) return $strokeWidth = 1
    if (/(Right|Up|r|u| )$/.test(key)) return $strokeWidth = 3
  }
  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<Form id={formId}>
  <Input {formId} readonly label="w" type="number" key="stroke-width" value={$strokeWidth} {onKeydown} oneChar noPad/>
</Form>

<style type="css"></style>
