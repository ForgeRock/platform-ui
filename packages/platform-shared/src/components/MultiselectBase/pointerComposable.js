/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref, computed, watch } from 'vue';

export default function usePointer(props, filteredOptions, isSelected, internalValue, wholeGroupDisabled, wholeGroupSelected, isOpen, select, listRef, searchRef, activate, rootRef, search, removeElement, visibleValues) {
  // -1 = no option pointed; the list opens without a highlight.
  const pointer = ref(-1);
  const currentEl = computed(() => listRef?.value?.querySelector(`#${props.id}-${pointer.value}`));

  function optionHighlight(index, option) {
    const selected = isSelected(option);
    return {
      'multiselect__option--highlight': index === pointer.value && props.showPointer,
      'multiselect__option--disabled': !selected && option?.$isDisabled,
      'multiselect__option--selected': selected,
    };
  }
  function groupHighlight(index, selectedGroup) {
    if (!props.groupSelect) {
      return [
        'multiselect__option--disabled',
        { 'multiselect__option--group': selectedGroup.$isLabel },
      ];
    }

    const group = props.options.find((option) => option[props.groupLabel] === selectedGroup.$groupLabel);

    return group && wholeGroupDisabled(group) ? [
      'multiselect__option--group',
      { 'multiselect__option--highlight': index === pointer.value && props.showPointer },
      { 'multiselect__option--group-selected': wholeGroupSelected(group) },
    ] : 'multiselect__option--disabled';
  }

  /**
   * Points at the selected option in the rendered list (or -1 when there is no
   * selection, in multiple mode, or the selection is not currently visible).
   * Uses isSelected so trackBy and primitive options are matched correctly.
   */
  function pointerToSelection() {
    if (props.multiple || internalValue.value.length === 0) {
      pointer.value = -1;
      return;
    }
    pointer.value = filteredOptions.value.findIndex((option) => option && !option.$isLabel && isSelected(option));
  }

  function pointerReset() {
    if (!props.closeOnSelect) return;
    pointerToSelection();
    if (pointer.value === -1 && listRef.value) {
      listRef.value.scrollTop = 0;
    }
  }

  function addPointerElement({ key }) {
    if (!isOpen.value) {
      pointerReset();
      activate();
    } else if (key === 'Enter') {
      if (filteredOptions.value.length > 0) {
        // Nothing pointed: Enter accepts the first filtered option (type + Enter flow).
        // Group labels stay in filteredOptions; skip a leading one (select() ignores labels).
        let index = Math.max(pointer.value, 0);
        if (filteredOptions.value[index]?.$isLabel && !props.groupSelect) {
          index = filteredOptions.value.findIndex((option) => option && !option.$isLabel);
        }
        select(filteredOptions.value[index], key);
      }
    }
  }
  function pointerForward() {
    if (!isOpen.value) {
      // NOTE: added to open on down arrow, else statement only happens after open
      activate();
      pointerToSelection();
    } else if (pointer.value < filteredOptions.value.length - 1) {
      // pointer -1 means nothing is pointed; += 1 moves onto option 0 (a leading
      // group label lands here first and the recursion below skips past it).
      pointer.value += 1;
      if (currentEl?.value && listRef.value) {
        listRef.value.scrollTop = currentEl.value.offsetTop - (listRef.value.offsetHeight / 2);
      }
      if (filteredOptions.value[pointer.value]
          && filteredOptions.value[pointer.value].$isLabel
          && !props.groupSelect) {
        pointerForward();
      }
    }
  }
  function pointerBackward() {
    if (pointer.value > 0) {
      pointer.value -= 1;
      if (currentEl?.value && listRef.value) {
        listRef.value.scrollTop = currentEl.value.offsetTop - (listRef.value.offsetHeight / 2);
      }
      if (filteredOptions.value[pointer.value]
          && filteredOptions.value[pointer.value].$isLabel
          && !props.groupSelect
      ) {
        pointerBackward();
      }
    } else if (pointer.value <= 0) {
      if (!isOpen.value) {
        activate();
        pointerToSelection();
      } else if (filteredOptions.value.length > 0
          && filteredOptions.value[0].$isLabel
          && !props.groupSelect
      ) {
        // Unpointed (or on option 0) with a leading group label: forward steps
        // onto option 0 and the label-skip inside pointerForward recurses past it.
        pointerForward();
      }
    }
  }
  function pointerAdjust() {
    if (pointer.value >= filteredOptions.value.length - 1) {
      pointer.value = filteredOptions.value.length
        ? filteredOptions.value.length - 1
        : -1;
    }

    if (filteredOptions.value.length > 0
        && pointer.value >= 0
        && filteredOptions.value[pointer.value]?.$isLabel
        && !props.groupSelect
    ) {
      pointerForward();
    }
  }
  function pointerSet(index) {
    pointer.value = index;
  }
  function pointerClear() {
    pointer.value = -1;
  }

  /**
   * Handles keyboard navigation within the multiselect tag list.(Bound to the multiselect__tags container)
   * ArrowLeft/Right: move focus between close icons (roving tabindex pattern).
   *   ArrowLeft from the search input focuses the last tag's close icon.
   *   ArrowRight past the last tag returns focus to the search input.
   * Enter/Delete/Backspace: remove the currently focused tag and move focus to the adjacent tag's close icon, or back to the search input if the list is now empty.
   * No-ops when: search input has text, the field is not multiple, or
   *   Enter/Delete/Backspace is fired with no tag focused (activeIndex === -1).
   *
   * @param {KeyboardEvent} e
   */
  function navigateTags(e) {
    if (['ArrowLeft', 'ArrowRight', 'Enter', 'Delete', 'Backspace'].indexOf(e.key) === -1) {
      return;
    }

    const tagList = [...(rootRef.value.querySelectorAll('.multiselect__tag'))];
    const activeIndex = tagList.findIndex((el) => el.contains(document.activeElement));

    // eslint-disable-next-line default-case
    switch (e.key) {
      case 'ArrowLeft':
        if (search.value !== '' || !props.multiple) {
          return;
        }

        e.preventDefault();
        if (activeIndex === -1 && tagList.length > 0) {
          const icon = tagList[tagList.length - 1].querySelector('.multiselect__tag-icon');
          if (icon) icon.focus();
        } else if (activeIndex > 0) {
          const icon = tagList[activeIndex - 1].querySelector('.multiselect__tag-icon');
          if (icon) icon.focus();
        }
        break;

      case 'ArrowRight':
        if (search.value !== '' || !props.multiple) {
          return;
        }

        e.preventDefault();

        if (tagList.length > activeIndex + 1) {
          const icon = tagList[activeIndex + 1].querySelector('.multiselect__tag-icon');
          if (icon) icon.focus();
        } else if (activeIndex === tagList.length - 1) {
          searchRef.value.focus();
        }

        break;
      case 'Enter':
      case 'Delete':
      case 'Backspace':
        if (search.value !== '' || !props.multiple || activeIndex === -1) {
          return;
        }

        e.preventDefault();

        removeElement(visibleValues.value[activeIndex]);

        if (tagList.length === 1) {
          searchRef.value.focus();
        } else if (activeIndex === tagList.length - 1) {
          const icon = tagList[tagList.length - 2].querySelector('.multiselect__tag-icon');
          if (icon) icon.focus();
        } else {
          const icon = tagList[activeIndex].querySelector('.multiselect__tag-icon');
          if (icon) icon.focus();
        }
        break;
    }
  }

  watch(() => filteredOptions.value, () => {
    pointerAdjust();
  }, { deep: true });

  return {
    pointer,
    optionHighlight,
    groupHighlight,
    addPointerElement,
    pointerForward,
    pointerBackward,
    pointerReset,
    pointerAdjust,
    pointerClear,
    pointerSet,
    navigateTags,
  };
}
