<script lang="ts">
  /* Angle the cursor will drift as it draws */

  /* PROPS */
  /* IMPORTS */
  import Form from './Form.svelte';
  import Input from './Input.svelte';
  /* IMPORTS (stores) */
  import { cw, rotation, drawMode } from '../stores';
  /* DECLARATIONS (local state) */
  /* DECLARATIONS (local functions) */
  const onDrawMode = ({ key }) => {
    if (!/(Left|Down|Right|Up)$/.test(key)) return;

    $drawMode = $drawMode === 'pattern' ? 'insert' : 'pattern'
  }

  /* Keep tab behavior--select next form element */
  const onKeydown = ({ key }) => {
    if (!/(Left|Down|Right|Up)$/.test(key)) return;

    $cw = !$cw
  }

  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<div>
  <Form>
    <Input readonly label="r"  type="text" key="rotation" value={$rotation} {onKeydown} noPad />
  </Form>

  <Form>
    <Input readonly type="text" key="draw-mode" value={$drawMode} onKeydown={onDrawMode} noPad />
  </Form>
</div>

<style>
  div {
    display: grid;
    grid-template-columns: 2fr 3fr;
    column-gap: 2.25em;
  }
</style>
