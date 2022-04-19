<script lang="ts">
  /* Used to wrap Input elements in dedicated form */

  /* PROPS */
  export let id: string
  export let flexForm = false
  export let accesskey: string | null = null
  export let showSubmit = false
  export let submitText = 'Submit'
  export let onFormSubmit = ({ target }): void => {
    const data = new FormData(target)
    console.warn('NOTE: No form handler supplied.')

    console.log(...data.entries())
  }
  /* IMPORTS */
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  /* TODO: Revisit why this only works for 1 component (w/ 2 Forms, second one doesn't trigger change) */
  const dispatchChange = () => {
    dispatch('change')
  }
  /* IMPORTS (stores) */
  /* DECLARATIONS (local state) */
  /* DECLARATIONS (local functions) */
  /* STORES (subscriptions) */
  /* LIFECYCLE */
</script>

<form {id} class:flex-form={flexForm} on:submit|preventDefault={onFormSubmit} on:change={dispatchChange}>
  <!-- All children will be placed in slot; Also accepts multiple components without a "React.Fragment"-like wrapper -->
  <slot></slot>

  <!-- svelte-ignore a11y-accesskey -->
  <input class:hidden={!showSubmit} type="submit" value={submitText} {accesskey}>
</form>

<style>
  form {
    box-shadow: inset 0 0 1.5px slategrey;
    background-color: #f4f4f4;
  }
  .flex-form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
  }
  form:focus-within { outline: 0.8px solid black; }

  .hidden { display: none; }
  input:not(.hidden)[type="submit"] {
    font-family: monospace;
    border: none;
    margin: 0.2em;
    padding: 1em;
    background-color: #f4f4f4;
    outline: none;
  }
</style>
