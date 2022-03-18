<script lang="ts">
  /* Angle the cursor will drift as it draws */

  /* PROPS */
  /* IMPORTS */
  import Input from './Input.svelte';
  /* IMPORTS (stores) */
  import { cw, rotation, directionText } from '../stores';
  /* DECLARATIONS (local state) */
  /* DECLARATIONS (local functions) */
  const onFormSubmit = ({ target }): void => {
    const data = new FormData(target);

    console.log(...data.entries()); // <- Formdata does not parse integers
  }

  /* TODO: Move draw logic to separate form when generic Form.svelte ready */
  let drawMode = 'pattern'

  const onDrawMode = ({ key }) => {
    if (!/(Left|Down|Right|Up)$/.test(key)) return;

    drawMode = drawMode === 'pattern' ? 'insert' : 'pattern'
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
  <form on:submit|preventDefault={onFormSubmit}>
    <Input readonly label="r" type="text" key="rotation" value={$rotation} {onKeydown} noPad />

    <input type="submit">
  </form>

  <form on:submit|preventDefault={onFormSubmit}>
    <Input readonly type="text" key="draw-mode" value={drawMode} onKeydown={onDrawMode} noPad />

    <input type="submit">
  </form>
</div>

<style>
  div {
    display: grid;
    grid-template-columns: 2fr 3fr;
    column-gap: 2.25em;
  }

  form {
    box-shadow: inset 0 0 1.5px slategrey;
    background-color: #f4f4f4;
  }
  form:focus-within { outline: 0.8px solid black; }

  input[type="submit"] { display: none; }
</style>
