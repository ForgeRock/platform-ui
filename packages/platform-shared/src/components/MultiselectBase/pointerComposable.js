/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref, computed, watch } from 'vue';

export default function usePointer(props, filteredOptions, isSelected, wholeGroupDisabled, wholeGroupSelected, isOpen, select, listRef, searchRef, activate, rootRef, search, removeElement) {
  const pointer = ref(0);
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

  function pointerReset() {
    if (!props.closeOnSelect) return;
    // Check if is array since the default value for the modelValue prop is and empty array
    const hasModelValue = Array.isArray(props.modelValue) ? props.modelValue.length !== 0 : !!props.modelValue;
    if (!hasModelValue) {
      pointer.value = 0;
      if (listRef.value) {
        listRef.value.scrollTop = 0;
      }
    } else {
      pointer.value = props.options.findIndex((option) => option.value === props.modelValue.value);
    }
  }

  function addPointerElement({ key }) {
    if (!isOpen.value) {
      pointerReset();
      activate();
    } else if (key === 'Enter') {
      if (filteredOptions.value.length > 0) {
        select(filteredOptions.value[pointer.value], key);
      }
    }
  }
  function pointerForward() {
    if (!isOpen.value) {
      // NOTE: added to open on down arrow, else statement only happens after open
      activate();
    } else if (pointer.value < filteredOptions.value.length - 1 && currentEl?.value) {
      pointer.value += 1;
      listRef.value.scrollTop = currentEl.value.offsetTop - (listRef.value.offsetHeight / 2);
      if (filteredOptions.value[pointer.value]
          && filteredOptions.value[pointer.value].$isLabel
          && !props.groupSelect) {
        pointerForward();
      }
    }
  }
  function pointerBackward() {
    if (pointer.value > 0 && currentEl?.value) {
      pointer.value -= 1;
      listRef.value.scrollTop = currentEl.value.offsetTop - (listRef.value.offsetHeight / 2);
      if (filteredOptions.value[pointer.value]
          && filteredOptions.value[pointer.value].$isLabel
          && !props.groupSelect
      ) {
        pointerBackward();
      }
    } else if (filteredOptions.value[pointer.value]
          && filteredOptions.value[0].$isLabel
          && !props.groupSelect
    ) {
      pointerForward();
    }
  }
  function pointerAdjust() {
    if (pointer.value >= filteredOptions.value.length - 1) {
      pointer.value = filteredOptions.value.length
        ? filteredOptions.value.length - 1
        : 0;
    }

    if (filteredOptions.value.length > 0
        && filteredOptions.value[pointer.value]?.$isLabel
        && !props.groupSelect
    ) {
      pointerForward();
    }
  }
  function pointerSet(index) {
    pointer.value = index;
  }

  function navigateTags(e, option) {
    let tagList;
    let activeIndex;

    if (['ArrowLeft', 'ArrowRight', 'Enter', 'Delete', 'Backspace'].indexOf(e.key) !== -1) {
      tagList = [...(rootRef.value.querySelectorAll('.multiselect__tag'))];
      // .filter(e => e !== tags.value)
      activeIndex = tagList.findIndex((el) => el === document.activeElement);
    }

    // eslint-disable-next-line default-case
    switch (e.key) {
      case 'ArrowLeft':
        if (search.value !== '' || !props.multiple) {
          return;
        }

        e.preventDefault();
        if (activeIndex === -1 && tagList.length > 0) {
          tagList[tagList.length - 1].focus();
        } else if (activeIndex > 0) {
          tagList[activeIndex - 1].focus();
        }
        break;

      case 'ArrowRight':
        if (search.value !== '' || !props.multiple) {
          return;
        }

        e.preventDefault();

        if (tagList.length > activeIndex + 1) {
          tagList[activeIndex + 1].focus();
        }

        break;
      case 'Enter':
      case 'Delete':
      case 'Backspace':
        if (search.value !== '' || !props.multiple) {
          return;
        }

        e.preventDefault();

        removeElement(option);

        if (activeIndex === tagList.length - 1 && tagList.length !== 1) {
          tagList[tagList.length - 2].focus();
        } else if (tagList.length === 1) {
          searchRef.value.focus();
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
    pointerSet,
    navigateTags,
  };
}
