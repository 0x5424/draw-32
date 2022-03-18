<script lang="ts">
  export let key: string
  export let value: string | number
  export let label: string | null = null

  /* TODO: R&D to see if this is best way to handle conditional styling in svelte/vue */
  export let flexGrow = false // Expand this input to remaining free space (last-child on parent element not working)
  export let noPad = false // Remove left padding on main div (forms with 1 child will use this)

  /* HTML values */
  export let type: 'number' | 'text' = 'number'
  export let readonly = false

  /* Handlers */
  export let onKeydown = () => {/* Custom logic for manual inputs */}
</script>

<div class:flex-grow={flexGrow} class:no-pad-left={noPad}>
  <label for={key}>
    <span class:pad-left={!!label}>
      {#if label}
        {label}
      {/if}<slot>
        {#if type === 'number'}
          <input
            bind:value
            on:keydown={onKeydown}
            type="number"
            id={key}
            name={key}
            min=1
            max=999
            pattern="\d*"
            {readonly}
          >
        {:else if type === 'text'}
          <input
            bind:value
            on:keydown={onKeydown}
            class:one-char={`${value}`.length <= 1}
            class:draw-input={value === 'pattern' || value === 'insert'}
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

  .flex-grow { flex-grow: 1; }
  .pad-left { padding-left: 0.5rem; } /* Provides space for label text */
  .no-pad-left { padding-left: 0; }
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

  /* TODO: Something more elegant... Styling inputs is a nightmare */
  .draw-input { width: 65px; }

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
