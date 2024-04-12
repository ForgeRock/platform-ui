<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    :id="id"
    :tabindex="wrapperIsCombobox ? 0 : -1"
    ref="rootRef"
    :class="[{ 'multiselect--active': isOpen, 'multiselect--disabled': disabled, 'multiselect--above': isAbove, 'multiselect--has-options-group': hasOptionGroup}]"
    class="multiselect"
    @click="activate()"
    @blur="searchable ? null : deactivate()"
    @keydown.down.prevent="pointerForward()"
    @keydown.up.prevent="pointerBackward()"
    @keypress.enter.tab.stop.self="addPointerElement($event)"
    @keydown.esc.prevent.stop="deactivate()"
    @focus="onlyTagging && activate()"
    :data-testid="testid ? `multi-select-container-${testid}` : null "
    :autofocus="autofocus || null"
    :role="wrapperIsCombobox ? 'combobox' : null"
    :aria-autocomplete="wrapperIsCombobox ? 'list': null"
    :aria-activedescendant="wrapperIsCombobox && isOpen ? `${id}-${pointer}`: null"
    :aria-expanded="wrapperIsCombobox ? isOpen.toString() : null"
    :aria-controls="wrapperIsCombobox ? `listbox-${id}` : null"
    :aria-labelledby="wrapperIsCombobox ? comboboxLabelledby || `${id}-label` : null"
    :aria-required="wrapperIsCombobox ? isRequiredAria: null">
    <slot
      name="caret"
      :toggle="toggle">
      <div
        @mousedown.prevent.stop="toggle()"
        class="multiselect__select" />
    </slot>
    <slot
      name="clear"
      :search="search" />
    <div
      ref="tags"
      @keydown.left="navigateTags($event)"
      @keydown.right="navigateTags($event)"
      class="multiselect__tags">
      <slot
        name="selection"
        :search="search"
        :remove="removeElement"
        :values="visibleValues"
        :is-open="isOpen"
      >
        <div
          class="multiselect__tags-wrap"
          v-show="visibleValues.length > 0">
          <template
            v-for="(option, index) of visibleValues">
            <slot
              name="tag"
              :option="option"
              :search="search"
              :remove="removeElement">
              <span
                class="multiselect__tag"
                tabindex="-1"
                :data-testid="`multi-select-tag-contents-${testid}`"
                @keypress.enter.prevent="navigateTags($event, option)"
                @keydown.delete.prevent="navigateTags($event, option)"
                :key="index">
                <span v-text="getOptionLabel(option)" />
                <i
                  @mousedown.prevent="removeElement(option)"
                  :data-testid="`multi-select-tag-close-icon-${testid}`"
                  class="multiselect__tag-icon" />
              </span>
            </slot>
          </template>
        </div>
        <template v-if="internalValue && internalValue.length > limit">
          <slot name="limit">
            <strong
              class="multiselect__strong"
              v-text="limitText(internalValue.length - limit)" />
          </slot>
        </template>
      </slot>
      <transition name="multiselect__loading">
        <slot name="loading">
          <div
            v-show="loading"
            class="multiselect__spinner" />
        </slot>
      </transition>
      <input
        ref="searchRef"
        v-if="inputIsCombobox"
        :id="id"
        :class="[
          {
            'multiselect__input': isOpen || !hasSingleLabelSlot,
            'multiselect__single': !isOpen && !hasSingleLabelSlot,
            'sr-only': hasSingleLabelSlot,
          }]"
        :name="name"
        type="search"
        :autocomplete="isOpen && searchable ? 'on' : 'off'"
        :spellcheck="false"
        :placeholder="placeholder"
        :style="inputStyle"
        :value="isOpen ? search : getOptionLabel(singleValue)"
        :disabled="disabled"
        tabindex="0"
        :data-testid="testid ? `multi-select-input-${testid}` : null "
        @input="updateSearch($event.target.value)"
        @click="activate()"
        @blur.prevent="deactivate()"
        @keydown.esc.prevent.stop="deactivate()"
        @keypress.enter.prevent.stop.self="addPointerElement($event)"
        @keydown.delete.stop="removeLastElement()"
        :role="inputIsCombobox ? 'combobox' : null"
        :aria-autocomplete="inputIsCombobox ? 'list': null"
        :aria-activedescendant="inputIsCombobox && isOpen ? `${id}-${pointer}`: null"
        :aria-expanded="inputIsCombobox? isOpen.toString() : null"
        :aria-controls="inputIsCombobox ? `listbox-${id}` : null"
        :aria-labelledby="inputIsCombobox ? comboboxLabelledby || `${id}-label` : null"
        :aria-required="inputIsCombobox ? isRequiredAria: null">
      <span
        v-if="(isSingleLabelVisible && hasSingleLabelSlot && !isOpen) || wrapperIsCombobox"
        class="multiselect__single"
        @mousedown.prevent="toggle"
      >
        <slot
          name="singleLabel"
          :option="singleValue">
          {{ currentOptionLabel }}
        </slot>
      </span>
    </div>
    <transition name="multiselect">
      <div
        class="multiselect__content-wrapper"
        v-show="isOpen"
        @focus="activate"
        tabindex="-1"
        @mousedown.prevent
        :style="{ maxHeight: optimizedHeight + 'px' }"
        ref="listRef"
      >
        <ul
          class="multiselect__content"
          :style="contentStyle"
          role="listbox"
          :id="`listbox-${id}`"
          :aria-multiselectable="multiple ? 'true' : null">
          <slot name="beforeList" />
          <li v-if="multiple && max === internalValue.length">
            <span class="multiselect__option">
              <slot name="maxElements">{{ $t('multiselectBase.maxElements', { max }) }}</slot>
            </span>
          </li>
          <template v-if="!max || internalValue.length < max">
            <li
              class="multiselect__element"
              v-for="(option, index) of filteredOptions"
              :key="index"
              :id="`${id}-${index}`"
              :role="!(option && option.$isLabel) ? 'option' : null"
              :aria-disabled="!isSelected(option) && option?.$isDisabled"
              :aria-selected="isOpen ? pointer === index : null">
              <span
                v-if="!(option && option.$isLabel)"
                :class="optionHighlight(index, option)"
                @click.stop="select(option)"
                @mousemove.self="debouncePointerSet(index)"
                :data-select="option && option.isTag ? tagPlaceholder : selectLabelText"
                :data-selected="selectedLabelText"
                :data-deselect="deselectLabelText"
                class="multiselect__option">
                <slot
                  name="option"
                  :option="option"
                  :search="search"
                  :index="index">
                  <span>{{ getOptionLabel(option) }}</span>
                </slot>
              </span>
              <span
                v-if="option && option.$isLabel"
                :data-select="groupSelect && selectGroupLabelText"
                :data-deselect="groupSelect && deselectGroupLabelText"
                :class="groupHighlight(index, option)"
                @mousemove.self="groupSelect && debouncePointerSet(index)"
                @mousedown.prevent="selectGroup(option)"
                class="multiselect__option">
                <slot
                  name="option"
                  :option="option"
                  :search="search"
                  :index="index">
                  <span>{{ getOptionLabel(option) }}</span>
                </slot>
              </span>
            </li>
          </template>
          <template v-if="showNoResults && (!hasFilteredOptions && search && !loading)">
            <li>
              <span class="multiselect__option">
                <slot
                  name="noResult"
                  :search="search">{{ $t('multiselectBase.noResults') }}</slot>
              </span>
            </li>
          </template>
          <template v-if="showNoOptions && ((options.length === 0 || (hasOptionGroup === true && !hasFilteredOptions)) && !search && !loading)">
            <li>
              <span class="multiselect__option">
                <slot name="noOptions">{{ $t('multiselectBase.noOptions') }}</slot>
              </span>
            </li>
          </template>
          <slot name="afterList" />
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, useSlots } from 'vue';
import { debounce, isNull, isUndefined } from 'lodash';
import useMultiselect from './multiselectComposable';
import usePointer from './pointerComposable';
import i18n from '@/i18n';

const emit = defineEmits(['open', 'search-change', 'close', 'select', 'update:modelValue', 'remove', 'tag']);
const props = defineProps({
  allowEmpty: {
    type: Boolean,
    default: true,
  },
  autofocus: {
    type: Boolean,
    default: false,
  },
  blockKeys: {
    type: Array,
    default: () => [],
  },
  class: {
    type: String,
    default: '',
  },
  clearOnSelect: {
    type: Boolean,
    default: true,
  },
  closeOnSelect: {
    type: Boolean,
    default: true,
  },
  comboboxLabelledby: {
    type: String,
    default: null,
  },
  customLabel: {
    type: Function,
    default(option, label) {
      if (isNull(option) || isUndefined(option)) return '';
      return label ? option[label] : option;
    },
  },
  /**
     * String to show when pointing to an already selected option
     * @default 'Press enter to remove'
     * @type {String}
     */
  deselectGroupLabel: {
    type: String,
    default: i18n.global.t('multiselectBase.deselectGroup'),
  },
  /**
     * String to show when pointing to an already selected option
     * @default 'Press enter to remove'
     * @type {String}
     */
  deselectLabel: {
    type: String,
    default: i18n.global.t('multiselectBase.deselectLabel'),
  },
  /**
     * Disables the multiselect if true.
     * @default false
     * @type {Boolean}
     */
  disabled: {
    type: Boolean,
    default: false,
  },
  groupLabel: {
    type: String,
    default: '',
  },
  groupSelect: {
    type: Boolean,
    default: false,
  },
  groupValues: {
    type: String,
    default: '',
  },
  hideSelected: {
    type: Boolean,
    default: false,
  },
  id: {
    type: [String, null],
    default: null,
  },
  internalSearch: {
    type: Boolean,
    default: true,
  },
  /**
   * Sets aria-required as the value provided
   */
  isRequiredAria: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: '',
  },
  /**
     * Limit the display of selected options. The rest will be hidden within the limitText string.
     * @default 99999
     * @type {Integer}
     */
  limit: {
    type: Number,
    default: 99999,
  },
  /**
     * Function that process the message shown when selected
     * elements pass the defined limit.
     * @default 'and * more'
     * @param {Int} count Number of elements more than limit
     * @type {Function}
     */
  limitText: {
    type: Function,
    default: (count) => i18n.global.t('multiselectBase.limitText', { count }),
  },
  /**
     * Set true to trigger the loading spinner.
     * @default False
     * @type {Boolean}
     */
  loading: {
    type: Boolean,
    default: false,
  },
  max: {
    type: [Number, Boolean],
    default: false,
  },
  /**
     * Sets maxHeight style value of the dropdown
     * @default 300
     * @type {Integer}
     */
  maxHeight: {
    type: Number,
    default: 300,
  },
  /**
     * Presets the selected options value.
     * @type {Object||Array||String||Integer}
     */
  modelValue: {
    type: [Object, Array, String, Number],
    default() {
      return [];
    },
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  /**
     * name attribute to match optional label element
     * @default ''
     * @type {String}
     */
  name: {
    type: String,
    default: '',
  },
  onlyTagging: {
    type: Boolean,
    default: false,
  },
  /**
     * Fixed opening direction
     * @default ''
     * @type {String}
     */
  openDirection: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    required: true,
  },
  optionHeight: {
    type: Number,
    default: 40,
  },
  optionsLimit: {
    type: Number,
    default: 1000,
  },
  placeholder: {
    type: String,
    default: i18n.global.t('multiselectBase.selectOption'),
  },
  preselectFirst: {
    type: Boolean,
    default: false,
  },
  preserveSearch: {
    type: Boolean,
    default: false,
  },
  resetAfter: {
    type: Boolean,
    default: false,
  },
  searchable: {
    type: Boolean,
    default: true,
  },
  /**
     * String to show when pointing to an option
     * @default 'Press enter to select'
     * @type {String}
     */
  selectLabel: {
    type: String,
    default: i18n.global.t('multiselectBase.selectLabel'),
  },
  /**
     * String to show when pointing to an option
     * @default 'Press enter to select'
     * @type {String}
     */
  selectGroupLabel: {
    type: String,
    default: i18n.global.t('multiselectBase.selectGroupLabel'),
  },
  /**
     * String to show next to selected option
     * @default 'Selected'
     * @type {String}
     */
  selectedLabel: {
    type: String,
    default: i18n.global.t('common.selected'),
  },
  /**
     * Decide whether to show pointer labels
     * @default true
     * @type {Boolean}
     */
  showLabels: {
    type: Boolean,
    default: true,
  },
  /**
       * Shows slot with message about empty options
       * @default true
       * @type {Boolean}
       */
  showNoOptions: {
    type: Boolean,
    default: true,
  },
  showNoResults: {
    type: Boolean,
    default: true,
  },
  /**
     * Enable/disable highlighting of the pointed value.
     * @type {Boolean}
     * @default true
     */
  showPointer: {
    type: Boolean,
    default: true,
  },
  tabindex: {
    type: Number,
    default: 0,
  },
  trackBy: {
    type: String,
    default: '',
  },
  taggable: {
    type: Boolean,
    default: false,
  },
  tagPlaceholder: {
    type: String,
    default: i18n.global.t('multiselectBase.tagPlaceholder'),
  },
  tagPosition: {
    type: String,
    default: 'top',
  },
  testid: {
    type: String,
    default: '',
  },
});

const rootRef = ref(null);
const searchRef = ref(null);
const listRef = ref(null);
const slots = useSlots();

const {
  activate,
  // eslint-disable-next-line no-unused-vars
  adjustPosition,
  currentOptionLabel,
  deactivate,
  filteredOptions,
  getOptionLabel,
  internalValue,
  // eslint-disable-next-line no-unused-vars
  isExistingOption,
  isOpen,
  isSelected,
  optimizedHeight,
  // eslint-disable-next-line no-unused-vars
  optionKeys,
  preferredOpenDirection,
  removeElement,
  removeLastElement,
  search,
  select,
  selectGroup,
  toggle,
  updateSearch,
  // eslint-disable-next-line no-unused-vars
  valueKeys,
  wholeGroupDisabled,
  wholeGroupSelected,
} = useMultiselect(props, emit, rootRef, searchRef);

const {
  addPointerElement,
  groupHighlight,
  navigateTags,
  optionHighlight,
  pointer,
  // eslint-disable-next-line no-unused-vars
  pointerAdjust,
  pointerBackward,
  pointerForward,
  // eslint-disable-next-line no-unused-vars
  pointerReset,
  pointerSet,
} = usePointer(props, filteredOptions, isSelected, wholeGroupDisabled, wholeGroupSelected, isOpen, select, listRef, searchRef, activate, rootRef, search, removeElement);

const hasSingleLabelSlot = !!slots?.singleLabel;
const hasOptionGroup = computed(() => props.groupValues && props.groupLabel && props.groupSelect);
const visibleValues = computed(() => (props.multiple ? internalValue.value.slice(0, props.limit) : []));
const singleValue = computed(() => internalValue.value[0]);
const isSingleLabelVisible = computed(() => (
  (singleValue.value || singleValue.value === 0)
      && (!isOpen.value || !props.searchable)
      && !visibleValues.value.length
));
const deselectLabelText = computed(() => (props.showLabels ? props.deselectLabel : ''));
const deselectGroupLabelText = computed(() => (props.showLabels ? props.deselectGroupLabel : ''));
const selectLabelText = computed(() => (props.showLabels ? props.selectLabel : ''));
const selectGroupLabelText = computed(() => (props.showLabels ? props.selectGroupLabel : ''));
const selectedLabelText = computed(() => (props.showLabels ? props.selectedLabel : ''));
const inputStyle = computed(() => {
  if (props.multiple && props.modelValue && props.modelValue.length) {
    // Hide input by setting the width to 0 allowing it to receive focus
    return isOpen.value
      ? { width: '100%' }
      : {
        width: '0', position: 'absolute', padding: '0',
      };
  }
  return '';
});
const contentStyle = computed(() => (props.options.length ? { display: 'inline-block' } : { display: 'block' }));
const isAbove = computed(() => {
  if (props.openDirection === 'above' || props.openDirection === 'top') {
    return true;
  } if (props.openDirection === 'below' || props.openDirection === 'bottom') {
    return false;
  }
  return preferredOpenDirection.value === 'above';
});
const inputIsCombobox = computed(() => props.searchable
        || props.multiple
        || props.taggable);
const wrapperIsCombobox = computed(() => !inputIsCombobox.value);
const hasFilteredOptions = computed(() => !(filteredOptions.length === 0));
const debouncePointerSet = debounce(pointerSet, 15);
</script>

<style lang="scss" scoped src="./multiselectBase.scss"></style>
