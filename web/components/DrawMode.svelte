<script lang="ts">
  /* Angle the cursor will drift as it draws */

  /* PROPS */
  /* IMPORTS */
  import Form from './Form.svelte'
  import Input from './Input.svelte'
  /* IMPORTS (stores) */
  import { drawMode } from '../stores'
  /* DECLARATIONS (local state) */
  const formId = 'form-draw-mode'
  /* DECLARATIONS (local functions) */
  const onKeydown = ({ key }) => {
    if (!/(Left|Down|Right|Up| )$/.test(key)) return

    switch ($drawMode) {
    case 'pattern':
      $drawMode = 'insert'
      break
    case 'insert':
      $drawMode = 'fill'
      break
    case 'fill':
      $drawMode = 'pattern'
      break
    }
  }
  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<Form id={formId}>
  <Input {formId} readonly type="text" key="draw-mode" value={$drawMode} {onKeydown} noPad />
</Form>

<style></style>
