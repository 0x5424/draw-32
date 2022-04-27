<script lang="ts">
  /* Angle the cursor will drift as it draws */

  /* PROPS */
  /* IMPORTS */
  import { formatInstruction, InstructionObject } from '../util/instruction'
  /* IMPORTS (stores) */
  import {
    executableStores,
    pastSequences, allSequences, currentSequence,
    currentInstructionBuffer, performReset
  } from '../stores'
  /* DECLARATIONS (local state) */
  let inEditMode = false
  let toLoad = ''

  /* DECLARATIONS (local functions) */
  const formatSequence = (ary: InstructionObject[]) => {
    if (!ary) return ''
    /** @todo Should use a dedicated store for allSequencesAsBinStringArray */
    const binString = ary.map(formatInstruction).join('')
    if (binString === '') return ''

    const hex = BigInt(`0b${binString}`).toString(16)

    return `0x${hex}`
  }

  const saveSequence = () => {
    $pastSequences = [...$pastSequences, $currentSequence]
    $currentInstructionBuffer = []
  }

  /** Pop last instruction from `currentSequence` */
  const undoLastInstruction = () => {
    const lastInstructionRemoved = $currentInstructionBuffer.slice(0, $currentInstructionBuffer.length - 1).join('')
    const newState = [...$pastSequences.map(ary => ary.map(formatInstruction).join('')), lastInstructionRemoved]

    performReset(executableStores, newState)
  }
  const handleLoadOrReset = (newState: string[] | false = false): void => {
    performReset(executableStores, newState)
    inEditMode = false
  }

  const resetSequences = () => handleLoadOrReset()
  const loadSequences = () => handleLoadOrReset(formattedToLoad)

  const toggleLoad = () => inEditMode = !inEditMode

  const logState = () => {
    console.log('INSTRUCTIONS:', $allSequences)
    console.log('INSTRUCTIONS (raw):', $allSequences.map(ary => ary.map(formatInstruction)))
  }

  /* STORES (subscriptions) */
  $: value = `[\n${$allSequences.map(formatSequence).join(',\n')}\n]`
  allSequences.subscribe((obj: InstructionObject[][]) => {
    /**
     * @note We update the local var, `toLoad` as otherwise we have no means to bind a value to the textarea
     * @note This is also the reason for a conditional textarea component when in edit mode
     */
    toLoad = obj.map(formatSequence).join('\n')
  })
  $: formattedToLoad = toLoad.split(/[\s,]+/).filter(v => v !== '')
  /* LIFECYCLE */

  // Hack, as eslint does not recognize `value` being used in component
  value
</script>

<div>
  {#if inEditMode}
    <textarea
      bind:value={toLoad}
      rows={formattedToLoad.length}
      cols=24
    />
  {:else}
    <textarea
      {value}
      readonly
      rows={$allSequences.length + 2}
      cols=24
    />
  {/if}
</div>

<div>
  {#if inEditMode}
    <button on:click={loadSequences}>Confirm</button>
    <button on:click={toggleLoad}>Cancel</button>
  {:else}
    <button on:click={saveSequence}>Save</button>
    <button on:click={undoLastInstruction}>Undo</button>
    <button on:click={resetSequences}>Reset</button>
    <button on:click={toggleLoad}>Load</button>
    <button on:click={logState}>Log</button>
  {/if}
</div>

<style>
  div {
    font-family: monospace;
  }

  textarea {
    box-shadow: inset 0 0 1.5px slategrey;
    background-color: #f4f4f4;
    text-align: left;
    resize: none;
    outline: none;
    border:  none;
    /* Allow textarea width to grow  */
    word-wrap: normal;
    word-break: keep-all;
  }

  button {
    border: 2px outset #f4f4f4;
  }

  button:not(:disabled):active {
    border: 2px inset #f4f4f4;
  }
</style>
