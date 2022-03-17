<script lang="ts">
  /* Display the coordinates of the cursor */

  /* PROPS */
  export let initializeControls: Function;
  /* IMPORTS */
  import Input from './Input.svelte';
  /* STORE IMPORTS */
  /* DECLARATIONS (local state) */
  let direction = '→'
  /* STORES */
  /* LIFECYCLE */

  // todo:
  // 1. Import/create stores (x+y)
  // 2. Bind to store values
  // 3. (HOC) Add rulers when updating cursors
  // 4. Add commitJump when unfocusing

  const onFormSubmit = ({ target }): void => {
    const data = new FormData(target);

    console.log(...data.entries()); // <- Formdata does not parse integers
  }

  /**
   * Hack to set direction text as an arrow.
   * If tab pressed assume select next form element, else we do nothing (preventDefault)
   */
  const onKeydown = (event): void => {
    const { key } = event;
    if (!/(Tab|Left|Down|Right|Up)$/.test(key)) return;

    if (key === 'ArrowLeft') return direction = '←';
    if (key === 'ArrowDown') return direction = '↓';
    if (key === 'ArrowRight') return direction = '→';
    if (key === 'ArrowUp') return direction = '↑';
    if (key === 'Tab') { // <- Can remove once more form element added
      event.preventDefault();
      document.activeElement.blur();
    }
  }
</script>

<form on:change|once={initializeControls} on:submit|preventDefault={onFormSubmit}>
  <Input label="X" key="cursor-x"/>
  <Input label="Y" key="cursor-y"/>
  <!-- <Input key="cursor-dir" type="text"> -->
  <div>
    <label for="cursor-dir">
      <span>
        <input
          readonly
          id="cursor-dir"
          name="cursor-dir"
          type="text"
          on:keydown={onKeydown}
          bind:value={direction}
        >
      </span>
    </label>
  </div>

  <input type="submit">
</form>

<style>
  form {
    display: flex;
    align-items: center;
    box-shadow: inset 0 0 1.5px slategrey;
    background-color: #f4f4f4;
  }

  form:focus-within { outline: 0.8px solid black; }

  /* TODO: fix value bindings for child/slotted inputs */
  label {
    display: flex;
    justify-content: center;
    align-items: baseline;
    font-family: monospace;
    color: slategray;
  }

  span:focus-within {
    background-color: #fff;
    outline: 0.8px solid black;
    box-shadow: inset 0 0 1.5px slategrey;
    color: black;
  }

  input {
    border: none;
    box-sizing: content-box;
    width: 15px;
    background-color: rgba(0,0,0, 0);
    outline: none;
    color: slategray;
  }

  input:focus { color: black; }
  /* end todo */

  input[type="submit"] { display: none; }
</style>
