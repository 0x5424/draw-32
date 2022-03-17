<script lang="ts">
  /* NOTE: Only number support atm */

  export let key: string;
  export let label: string? = null;
  export let type: "number" | "text" = "number";
  export let min: number = 1;
  export let max: number = 999;
  export let defaultValue: number = 1; // TODO: Use store

  let value = defaultValue;
</script>

<div>
  <label for={key}>
    <span class:pad-left={type === "number"}>
      {#if label}
        {label}
      {/if}<slot>
        {#if type === "number"}
          <input
            bind:value
            type="number"
            id={key}
            name={key}
            {min}
            {max}
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

  .pad-left { padding-left: 0.5rem; }
  span:focus-within {
    background-color: #fff;
    outline: 0.8px solid black;
    box-shadow: inset 0 0 1.5px slategrey;
    color: black;
  }

  /* Note: styling only applies when no `slot` used */
  input {
    border: none;
    min-width: 2.3rem; /* Fits 3 digits */
    width: 2.3rem; /* TODO: Dynamic width; Maybe only possible with JS */
    background-color: rgba(0,0,0, 0);
    outline: none;
    color: slategray;
  }

  input:focus { color: black; }

  /* Hide U/D arrows on safari--also works on chromium */
  input::-webkit-inner-spin-button { display: none; }
</style>
