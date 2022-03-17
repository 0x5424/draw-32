<script lang="ts">
  /* NOTE: Only number support atm */

  export let key: string;
  export let label: string;
  export let type: "number" | "text" = "number";
  export let defaultValue: number = 1; // TODO: Use store

  let value = defaultValue;
</script>

<div>
  <label for={key}>
    <span>
      {label}<slot>
        {#if type === "number"}
          <input
            bind:value
            type="number"
            id={key}
            name={key}
            min=1
            max=999
          >
        {:else if type === "text"}
          <input bind:value type="text" id={key} name={key}>
        {/if}
      </slot>
    </span>
  </label>
</div>

<style>
  div { padding: 0.75rem; }

  label {
    display: flex;
    justify-content: center;
    align-items: baseline;
    font-family: monospace;
    color: slategray;
  }

  span { padding-left: 0.5rem; }
  span:focus-within {
    background-color: #fff;
    outline: 0.8px solid black;
    box-shadow: inset 0 0 1.5px slategrey;
    color: black;
  }

  /* Note: styling only applies when no `slot` used */
  input {
    border: none;
    min-width: 2.75rem; /* Fits 4 digits */
    width: 2.75rem; /* TODO: Dynamic width; Maybe only possible with JS */
    background-color: rgba(0,0,0, 0);
    outline: none;
    color: slategray;
  }

  input:focus { color: black; }

  /* Hide U/D arrows on safari--also works on chromium */
  input::-webkit-inner-spin-button { display: none; }
</style>
