<script lang="ts">
  /* Display the direction the */

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

  const onKeydown = ({ key }) => { $cw = !$cw }
  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<div>
  <form on:submit|preventDefault={onFormSubmit}>
    <Input readonly type="text" key="rotation" value={$rotation} {onKeydown} centered={false}/>

    <input type="submit">
  </form>
</div>

<style>
  div {
    display: grid;
    grid-template-columns: 50px 1fr;
  }

  form {
    box-shadow: inset 0 0 1.5px slategrey;
    background-color: #f4f4f4;
  }
  form:focus-within { outline: 0.8px solid black; }

  input[type="submit"] { display: none; }
</style>
