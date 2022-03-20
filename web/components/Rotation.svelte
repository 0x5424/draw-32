<script lang="ts">
  /* Angle the cursor will drift as it draws */

  /* PROPS */
  /* IMPORTS */
  import Form from './Form.svelte'
  import Input from './Input.svelte'
  /* IMPORTS (stores) */
  import { cw, rotation } from '../stores'
  /* DECLARATIONS (local state) */
  const formId = 'form-rotation'
  /* DECLARATIONS (local functions) */
  const onKeydown = ({ key }) => {
    if (!/(Left|Down|Right|Up)$/.test(key)) return

    $cw = !$cw
  }

  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<Form id={formId}>
  <Input readonly {formId} label="r"  type="text" key="rotation" value={$rotation} {onKeydown} noPad oneChar/>
</Form>

<style></style>
