<script lang="ts">
  export let key: string
  export let value: string | number
  export let label: string | null = null
  export let formId: string

  /* HTML values */
  export let min = 1
  export let max = 999
  export let pattern: string | null = null
  export let type: 'number' | 'text' | 'textarea' = 'number'
  export let readonly = false
  export let disabled = false

  /* TODO: R&D to see if this is best way to handle conditional styling in svelte/vue */
  export let flexGrow = false // Expand this input to remaining free space (last-child on parent element not working)
  export let noPad = false // Remove left padding on main div (forms with 1 child will use this)
  export let oneChar = false // Shorten input width if input should only be 1 char long (arrows use this)
  export let centerLabel = type === 'textarea' // Place label vertically above input (wider text inputs)

  /* Handlers */
  export let onKeydown: (args: unknown) => void = () => {/* Custom logic for manual inputs */}

  /* inputValue is either handled by a svelte store (number | string) or from a DOM event (string) */
  const getTextareaRows = (inputValue: string | number) => {
    const width = 20 // <- Default value for textarea
    const magicWidth = width + 2 // <- Seems we get 2 extra chars if we don't show the scrollbar 🤷‍♀️
    const currentLength = `${inputValue}`.length
    const ratio = currentLength / magicWidth
    const newLines = 1 + (`${inputValue}`.match(/\n/g)?.length || 0)

    if ((currentLength % magicWidth) === 0) return ratio + newLines

    return Math.floor(ratio) + newLines
  }
</script>

<div class:flex-grow={flexGrow} class:no-pad-left={noPad}>
  <label for={key}>
    <span class:pad-left={!!label && !centerLabel}>
      {#if label}
        {label}
        {#if centerLabel}
          <br />
        {/if}
      {/if}<slot>
        {#if type === 'number'}
          <input
            bind:value
            on:keydown={onKeydown}
            type="number"
            id={key}
            name={key}
            pattern="\d*"
            {min}
            {max}
            {readonly}
            {disabled}
          >
        {:else if type === 'text'}
          <input
            bind:value
            on:keydown={onKeydown}
            class:one-char={oneChar}
            class:draw-input={value === 'pattern' || value === 'insert'}
            class:color-input={key === 'color'}
            type="text"
            id={key}
            name={key}
            {readonly}
            {pattern}
            {disabled}
            autocorrect='off'
            autocomplete='off'
          >
        {:else if type === 'textarea'}
          <textarea
            bind:value
            on:keydown={onKeydown}
            rows={getTextareaRows(value)}
            form={formId}
            name={key}
            id={key}
          ></textarea>
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
  .color-input { width: 80px; }

  /* Note: styling only applies when no `slot` used */
  textarea, input {
    border: none;
    background-color: rgba(0,0,0, 0);
    outline: none;
    color: slategray;
  }
  input[type="number"] {
    min-width: 2.3rem; /* Fits 3 digits */
    width: 2.3rem; /* TODO: Dynamic width; Maybe only possible with JS */
  }
  input[type="text"] {
    max-width: 8rem;
  }

  textarea {
    resize: none;
  }

  input:focus { color: black; }
  textarea:focus { color: black; }

  /* Hide U/D arrows on safari--also works on chromium */
  input::-webkit-inner-spin-button { display: none; }
</style>
