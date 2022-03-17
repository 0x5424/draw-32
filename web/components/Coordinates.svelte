<script lang="ts">
  /* Display the coordinates of the cursor */

  /* PROPS */
  /* IMPORTS */
  import Input from './Input.svelte';
  /* STORE IMPORTS */
  /* DECLARATIONS (local state) */
  /* STORES */
  /* LIFECYCLE */

  // todo:
  // 1. Import/create stores (x+y)
  // 2. Bind to store values
  // 3. (HOC) Add rulers when updating cursors
  // 4. Add commitJump when unfocusing

  function onFormSubmit({ target }): void {
    const data = new FormData(target);

    console.log(...data.entries());
  }
</script>

<form on:submit|preventDefault={onFormSubmit}>
  <Input label="X" key="cursor-x"/>
  <Input label="Y" key="cursor-y"/>

  <input type="submit">
</form>

<style>
  form {
    font-family: monospace;
    display: grid;
    grid-template-columns: 1fr 1fr;
    box-shadow: inset 0 0 1.5px slategrey;
    background-color: #f4f4f4;
  }

  form:focus-within {
    outline: 1px solid black;
  }

  input[type="submit"] { display: none; }
</style>
