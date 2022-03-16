<script lang="ts">
  /* NOTE: Only number support atm */

  export let key: string = 'foo';
  export let label: string = 'gimme a label mannn';
  export let defaultValue: number = 1; // TODO: Use store

  let value = defaultValue;
</script>

<div>
  <label for={key}>
    <span>
      {label}:<input id={key} name={key} min=1 max=999 type="number" bind:value={value}>
    </span>
  </label>
</div>

<style>
  div {
    padding: 0.75rem;
  }

  label {
    display: flex;
    justify-content: center;
    align-items: baseline;
  }

  span { padding-left: 0.5rem }
  span:focus-within {
    background-color: #fff;
    outline: 1px solid black;
  }

  /* TODO:  Make input here generic; Maybe slots */
  input {
    border: none;
    /*min-width: 4.5em; If using 4 digit max on inputs */
    min-width: 4em;
    background-color: rgba(0,0,0, 0);
    outline: none;
  }
</style>
