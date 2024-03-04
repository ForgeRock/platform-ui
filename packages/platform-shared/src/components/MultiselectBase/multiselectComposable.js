/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  ref,
  computed,
  watch,
  onMounted,
  nextTick,
} from 'vue';

function isEmpty(opt) {
  if (opt === 0) return false;
  if (Array.isArray(opt) && opt.length === 0) return true;
  return !opt;
}

function not(fun) {
  return (...params) => !fun(...params);
}

function includes(str, query) {
  let localStr = str;
  if (str === undefined) localStr = 'undefined';
  if (str === null) localStr = 'null';
  if (str === false) localStr = 'false';
  const text = localStr.toString().toLowerCase();
  return text.indexOf(query.trim()) !== -1;
}

function filterOptions(options, search, label, customLabel) {
  return search ? options
    .filter((option) => includes(customLabel(option, label), search))
    .sort((a, b) => customLabel(a, label).length - customLabel(b, label).length) : options;
}

function stripGroups(options) {
  return options.filter((option) => !option.$isLabel);
}

function flattenOptions(values, label) {
  return (options) => options.reduce((prev, curr) => {
    if (curr[values] && curr[values].length) {
      prev.push({
        $groupLabel: curr[label],
        $isLabel: true,
      });
      return prev.concat(curr[values]);
    }
    return prev;
  }, []);
}

function filterGroups(search, label, values, groupLabel, customLabel) {
  return (groups) => groups.map((group) => {
    const groupOptions = filterOptions(group[values], search, label, customLabel);
    return groupOptions.length
      ? {
        [groupLabel]: group[groupLabel],
        [values]: groupOptions,
      }
      : [];
  });
}

const flow = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

export default function useMultiselect(
  props,
  emit,
  rootRef,
  searchRef,
) {
  const search = ref('');
  const isOpen = ref(false);
  const preferredOpenDirection = ref('below');
  const optimizedHeight = ref(props.maxHeight);

  // eslint-disable-next-line no-nested-ternary
  const internalValue = computed(() => (props.modelValue || props.modelValue === 0
    ? Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]
    : []));

  /**
   * Returns the internalValue in a way it can be emitted to the parent
   * @returns {Object||Array||String||Integer}
   */
  function getValue() {
    // eslint-disable-next-line no-nested-ternary
    return props.multiple
      ? internalValue.value
      : internalValue.value.length === 0
        ? null
        : internalValue.value[0];
  }

  /**
   * Filters and then flattens the options list
   * @param  {Array}
   * @return {Array} returns a filtered and flat options list
   */
  function filterAndFlat(options, searchText, label) {
    return flow(
      filterGroups(searchText, label, props.groupValues, props.groupLabel, props.customLabel),
      flattenOptions(props.groupValues, props.groupLabel),
    )(options);
  }

  /**
   * Flattens and then strips the group labels from the options list
   * @param  {Array}
   * @return {Array} returns a flat options list without group labels
   */
  function flatAndStrip(options) {
    return flow(
      flattenOptions(props.groupValues, props.groupLabel),
      stripGroups,
    )(options);
  }

  /**
   * Returns empty string when options is null/undefined
   * Returns tag query if option is tag.
   * Returns the customLabel() results and casts it to string.
   *
   * @param  {Object||String||Integer} Passed option
   * @returns {Object||String}
   */
  function getOptionLabel(option) {
    if (isEmpty(option)) return '';
    if (option.isTag) return option.label;
    if (option.$isLabel) return option.$groupLabel;

    const label = props.customLabel(option, props.label);
    if (isEmpty(label)) return '';

    return label;
  }

  const valueKeys = computed(() => {
    if (props.trackBy) {
      return internalValue.value.map((element) => element[props.trackBy]);
    }
    return internalValue.value;
  });

  /**
   * Finds out if the given element is already present
   * in the result value
   * @param  {Object||String||Integer} option passed element to check
   * @returns {Boolean} returns true if element is selected
   */
  function isSelected(option) {
    const opt = props.trackBy
      ? option[props.trackBy]
      : option;
    return valueKeys.value.indexOf(opt) > -1;
  }

  const optionKeys = computed(() => {
    const options = props.groupValues ? flatAndStrip(props.options, props.groupValues, props.groupLabel) : props.options;
    return options.map((element) => props.customLabel(element, props.label).toString().toLowerCase());
  });

  /**
   * Finds out if the given query is already present
   * in the available options
   * @param  {String}
   * @return {Boolean} returns true if element is available
   */
  function isExistingOption(query) {
    return !props.options
      ? false
      : optionKeys.value.indexOf(query) > -1;
  }

  /**
   * Updates the hasEnoughSpace variable used for
   * detecting where to expand the dropdown
   */
  function adjustPosition() {
    if (typeof window === 'undefined') return;
    const spaceAbove = rootRef.value.getBoundingClientRect().top;
    const spaceBelow = window.innerHeight - rootRef.value.getBoundingClientRect().bottom;
    const hasEnoughSpaceBelow = spaceBelow > optimizedHeight.value;
    if (hasEnoughSpaceBelow || spaceBelow > spaceAbove || props.openDirection === 'below' || props.openDirection === 'bottom') {
      preferredOpenDirection.value = 'below';
      optimizedHeight.value = Math.min(spaceBelow - 40, props.maxHeight);
    } else {
      preferredOpenDirection.value = 'above';
      optimizedHeight.value = Math.min(spaceAbove - 40, props.maxHeight);
    }
  }

  const filteredOptions = computed(() => {
    const searchValue = search.value || '';
    const normalizedSearch = searchValue.toLowerCase().trim();

    let options = props.options.concat();

    if (props.internalSearch) {
      options = props.groupValues
        ? filterAndFlat(options, normalizedSearch, props.label)
        : filterOptions(options, normalizedSearch, props.label, props.customLabel);
    } else {
      options = props.groupValues ? flattenOptions(props.groupValues, props.groupLabel)(options) : options;
    }

    options = props.hideSelected
      ? options.filter(not(isSelected))
      : options;

    if (props.taggable && normalizedSearch.length && !isExistingOption(normalizedSearch)) {
      if (props.tagPosition === 'bottom') {
        options.push({ isTag: true, label: searchValue });
      } else {
        options.unshift({ isTag: true, label: searchValue });
      }
    }
    return options.slice(0, props.optionsLimit);
  });

  function activate() {
    if (isOpen.value || props.disabled) return;
    adjustPosition();
    isOpen.value = true;
    if (props.searchable) {
      if (!props.preserveSearch) search.value = '';
      nextTick(() => searchRef.value && searchRef.value.focus());
    } else if (typeof rootRef.value !== 'undefined') rootRef.value.focus();
    emit('open', props.id);
  }

  const currentOptionLabel = computed(() => {
    if (props.multiple) {
      if (props.searchable) {
        return '';
      }
      return props.placeholder;
    } if (internalValue.value.length) {
      return getOptionLabel(internalValue.value[0]);
    } if (props.searchable) {
      return '';
    }
    return props.placeholder;
  });

  const deactivate = () => {
    if (!isOpen.value) return;
    isOpen.value = false;
    if (searchRef.value !== null && typeof searchRef.value !== 'undefined') {
      searchRef.value.focus();
    }
    if (!props.preserveSearch) search.value = '';
    emit('close', getValue(), props.id);
  };
  const toggle = () => {
    isOpen.value ? deactivate() : activate();
  };
  const removeElement = (option, shouldClose = true) => {
    if (props.disabled) return;
    if (!isSelected(option) && option.$isDisabled) return;
    if (!props.allowEmpty && internalValue.value.length <= 1) {
      deactivate();
      return;
    }
    const index = typeof option === 'object' ? valueKeys.value.indexOf(option[props.trackBy]) : valueKeys.value.indexOf(option);
    if (props.multiple) {
      const newValue = internalValue.value.slice(0, index).concat(internalValue.value.slice(index + 1));
      emit('update:modelValue', newValue, props.id);
    } else {
      emit('update:modelValue', null, props.id);
    }
    emit('remove', option, props.id);
    if (props.closeOnSelect && shouldClose) deactivate();
  };
  const removeLastElement = () => {
    if (props.blockKeys.indexOf('Delete') !== -1) return;
    if (search.value.length === 0 && Array.isArray(internalValue.value) && internalValue.value.length) {
      removeElement(internalValue.value[internalValue.value.length - 1], false);
    }
  };

  /**
     * Finds out if the given option is disabled
     * @param  {Object||String||Integer} option passed element to check
     * @returns {Boolean} returns true if element is disabled
     */
  function isOptionDisabled(option) {
    return !!option.$isDisabled;
  }
  /**
   * Helper to identify if all values in a group are selected
   *
   * @param {Object} group to validated selected values against
   */
  function wholeGroupSelected(group) {
    return group[props.groupValues].every((option) => isSelected(option) || isOptionDisabled(option));
  }

  /**
   * Helper to identify if all values in a group are disabled
   *
   * @param {Object} group to check for disabled values
   */
  function wholeGroupDisabled(group) {
    return group[props.groupValues].every(isOptionDisabled);
  }

  /**
   * Add the given group options to the list of selected options
   * If all group options are already selected -> remove it from the results.
   *
   * @param  {Object||String||Integer} group to select/deselect
   */
  function selectGroup(selectedGroup) {
    const group = props.options.find((option) => option[props.groupLabel] === selectedGroup.$groupLabel);
    if (!group) return;
    if (wholeGroupSelected(group, props.trackBy, internalValue.value)) {
      emit('remove', group[props.groupValues], props.id);
      const newValue = internalValue.value.filter((option) => group[props.groupValues].indexOf(option) === -1);
      emit('update:modelValue', newValue);
    } else {
      const optionsToAdd = group[props.groupValues].filter(
        (option) => !(isOptionDisabled(option, props.trackBy) || isSelected(option, props.trackBy, internalValue.value)),
      );
      if (props.max) {
        optionsToAdd.splice(props.max - internalValue.value.length);
      }
      emit('select', optionsToAdd, props.id);
      emit('update:modelValue', internalValue.value.concat(optionsToAdd));
    }
    if (props.closeOnSelect) deactivate();
  }

  function select(option, key) {
    if (option.$isLabel && props.groupSelect) {
      selectGroup(option);
      return;
    }
    const isItemsSelected = isSelected(option);
    if (props.blockKeys.indexOf(key) !== -1 || props.disabled || option.$isLabel || (!isItemsSelected && option.$isDisabled)) return;
    if (props.max && props.multiple && internalValue.value.length === props.max) return;
    if (option.isTag) {
      emit('tag', option.label, props.id);
      search.value = '';
      if (props.closeOnSelect && !props.multiple) deactivate();
    } else {
      if (isItemsSelected) {
        if (key !== 'Tab') removeElement(option);
        return;
      }
      if (props.multiple) {
        emit('update:modelValue', internalValue.value.concat([option]), props.id);
      } else {
        emit('update:modelValue', option, props.id);
      }
      emit('select', option, props.id);
      if (props.clearOnSelect) search.value = '';
    }
    if (props.closeOnSelect) deactivate();
  }

  /**
   * Updates the search value
   * @param  {String}
   */
  function updateSearch(query) {
    search.value = query;
  }

  onMounted(() => {
    if (props.preselectFirst && !internalValue.value.length && props.options.length) {
      select(filteredOptions.value[0]);
    }
  });
  watch(() => internalValue.value, () => {
    if (props.resetAfter && internalValue.value.length) {
      search.value = '';
      emit('update:modelValue', props.multiple ? [] : null);
    }
  }, { deep: true });
  watch(() => search.value, () => {
    emit('search-change', search.value, props.id);
  });

  return {
    search,
    isOpen,
    preferredOpenDirection,
    optimizedHeight,
    getOptionLabel,
    adjustPosition,
    filteredOptions,
    activate,
    internalValue,
    valueKeys,
    optionKeys,
    currentOptionLabel,
    deactivate,
    toggle,
    removeElement,
    removeLastElement,
    select,
    selectGroup,
    isSelected,
    wholeGroupDisabled,
    wholeGroupSelected,
    updateSearch,
    isExistingOption,
  };
}
