<script lang="ts">
  /* Display the coordinates of the cursor */

  /* PROPS */
  export let initializeControls: Function;
  /* IMPORTS */
  import Input from './Input.svelte';
  /* IMPORTS (stores) */
  import { direction, cursorX, cursorY } from '../stores';
  /* DECLARATIONS (local state) */
  /* DECLARATIONS (local functions) */
  const onFormSubmit = ({ target }): void => {
    const data = new FormData(target);

    console.log(...data.entries()); // <- Formdata does not parse integers
  }
  /**
   * Hack to set direction text as an arrow.
   * If tab pressed assume select next form element, else we do nothing (preventDefault)
   */
  const onKeydown = ({ key }): void => {
    if (!/(Left|Down|Right|Up)$/.test(key)) return;

    if (key === 'ArrowLeft') return $direction = '←';
    if (key === 'ArrowDown') return $direction = '↓';
    if (key === 'ArrowRight') return $direction = '→';
    if (key === 'ArrowUp') return $direction = '↑';
  }
  /* STORES (subscriptions) */
  /* LIFECYCLE */

  // todo:
  // 3. (HOC) Add rulers when updating cursors
  // 4. Add commitJump when unfocusing

</script>

<form on:change|once={initializeControls} on:submit|preventDefault={onFormSubmit}>
  <Input label="X" key="cursor-x" bind:value={$cursorX}/>
  <Input label="Y" key="cursor-y" bind:value={$cursorY}/>
  <Input key="cursor-dir" type="text" bind:value={$direction} {onKeydown} lastElement readonly/>

  <input type="submit">
</form>

<style>
  form {
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 0 1.5px slategrey;
    background-color: #f4f4f4;
  }
  form:focus-within { outline: 0.8px solid black; }

  input[type="submit"] { display: none; }
</style>
