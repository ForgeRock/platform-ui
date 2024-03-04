/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export default function useVueMultiSelectOverrides(ref) {
  /**
   * This was necessary to override so we could manually execute opening the menu with enter, up, and down keys.
   */
  function addPointerElementOverride(event) {
    if (!ref.isOpen) {
      ref.pointerReset();
      ref.activate();
    } else if (event.key === 'Enter') {
      if (ref.filteredOptions.length > 0) {
        ref.select(ref.filteredOptions[ref.pointer], event.key);
      }
    }
  }

  /**
   * This was necessary in order to override the VueMultiSelect's blur
   * event that made the select field go out of focus after selection:
   * https://github.com/shentao/vue-multiselect/blob/master/src/multiselectMixin.js#L693;
   */
  function deactivateOverride() {
    if (!ref.isOpen) {
      return;
    }

    ref.isOpen = false;
    if (!ref.preserveSearch) {
      ref.search = '';
    }

    ref.$emit('close', ref.getValue(), ref.id);
  }

  /**
  * Added this VueMultiSelect customization because the option pointer focus selector was persisting when
  * the select menu options were browsed but no value actually selected.  In this scenario we want
  * to reset the pointer to 0 on the next menu option reveal so the first option is focused,
  * otherwise, set the pointer to the index of the currently selected option.
  */
  function pointerResetOverride() {
    if (!ref.closeOnSelect) return;
    if (!ref?.value) {
      ref.pointer = 0;
      if (ref.$refs.list) {
        ref.$refs.list.scrollTop = 0;
      }
    } else {
      ref.pointer = ref.options.findIndex((option) => option.value === ref.value.value);
    }
  }

  return {
    addPointerElementOverride,
    deactivateOverride,
    pointerResetOverride,
  };
}
