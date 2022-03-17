<script lang="ts">
  export let key: string;
  export let value;
  export let label: string? = null;

  /* TODO: Move to last-child selector, not working from Cursor; Unsure if svelte to blame */
  export let lastElement: Boolean = false;
  export let centered: Boolean = true;

  export let type: "number" | "text" = "number";
  export let readonly: Boolean = false;
  export let onKeydown: Function = () => {};
</script>

<div class:flex-grow={lastElement}>
  <label for={key} class:justify-left={!centered}>
    <span class:pad-left={type === "number"}>
      {#if label}
        {label}
      {/if}<slot>
        {#if type === "number"}
          <input
            bind:value
            on:keydown={onKeydown}
            type="number"
            id={key}
            name={key}
            min=1
            max=999
            {readonly}
          >
        {:else if type === "text"}
          <input
            bind:value
            on:keydown={onKeydown}
            class:one-char={`${value}`.length <= 1}
            type="text"
            id={key}
            name={key}
            {readonly}
          >
        {/if}
      </slot>
    </span>
  </label>
</div>

<style>
  div { padding: 0.75rem 0 0.75rem 0.75rem; }

  label {
    display: flex;
    justify-content: center;
    align-items: baseline;
    font-family: monospace;
    color: slategray;
  }

  .justify-left { justify-content: left; }
  .flex-grow { flex-grow: 1; }
  .pad-left { padding-left: 0.5rem; } /* Provides space for label text */
  .one-char {
    box-sizing: content-box;
    width: 15px;
  }
  span:focus-within {
    background-color: #fff;
    outline: 0.8px solid black;
    box-shadow: inset 0 0 1.5px slategrey;
    color: black;
  }

  /* Note: styling only applies when no `slot` used */
  input {
    border: none;
    background-color: rgba(0,0,0, 0);
    outline: none;
    color: slategray;
  }
  input[type="number"] {
    min-width: 2.3rem; /* Fits 3 digits */
    width: 2.3rem; /* TODO: Dynamic width; Maybe only possible with JS */
  }

  input:focus { color: black; }

  /* Hide U/D arrows on safari--also works on chromium */
  input::-webkit-inner-spin-button { display: none; }
</style>
