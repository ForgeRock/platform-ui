<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    @keydown.meta.67="copyOptions"
    @keydown.ctrl.67="copyOptions">
    <FrInputLayout
      :id="id"
      :field-name="fieldName"
      :help-text="helpText"
      :errors="errors"
      :is-html="isHtml"
      :label="label">
      <VueMultiSelect
        :id="id"
        v-if="options"
        ref="vms"
        v-model="inputValue"
        v-bind="$attrs"
        label="text"
        track-by="multiselectId"
        :taggable="taggable"
        :name="fieldName"
        :tag-placeholder="$t('common.placeholders.addOption')"
        :disabled="disabled"
        :options="options"
        :show-labels="false"
        :hide-selected="true"
        :multiple="true"
        :close-on-select="false"
        :searchable="defaultSearchable"
        :class="[{'polyfill-placeholder': floatLabels }, 'white-label-background form-control p-0', {'no-multiselect-label': !label }, {'h-100': floatLabels || !label }]"
        :placeholder="defaultPlaceholder"
        @search-change="searchChange"
        @open="openHandler"
        @close="close"
        @tag="addTag"
        v-on="$listeners">
        <slot name="noResult">
          {{ $t('common.noResult') }}
        </slot>
        <template #tag="{option, remove}">
          <span
            :class="['multiselect__tag', {'multiselect__tag-selected': option && option.copySelect}]"
            @click="setSelectedForCopy(option)">
            <span>
              {{ option && option.text }}
            </span>
            <i
              @click="remove(option)"
              aria-hidden="true"
              tabindex="1"
              class="multiselect__tag-icon" />
          </span>
        </template>
        <template
          v-for="(key, slotName) in $scopedSlots"
          v-slot:[slotName]="slotData">
          <!-- @slot pass-through slot -->
          <slot
            :name="slotName"
            v-bind="slotData" />
        </template>
      </VueMultiSelect>
      <template
        v-for="(key, slotName) in $scopedSlots"
        v-slot:[slotName]="slotData">
        <!-- @slot pass-through slot -->
        <slot
          :name="slotName"
          v-bind="slotData" />
      </template>
    </FrInputLayout>
  </div>
</template>

<script>
import {
  find,
  has,
  isEqual,
  map,
} from 'lodash';
import VueMultiSelect from 'vue-multiselect';
import * as clipboard from 'clipboard-polyfill/text';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';
import InputLayout from '../Wrapper/InputLayout';
import InputMixin from '../Wrapper/InputMixin';

/**
 *  Multi select input. Allows selection of multiple element in a dropdown
 *
 *  @Mixes InputMixin - default props and methods for inputs
 *  @prop {boolean} disabled default false
 *  @prop {string} fieldName default ''
 *  @prop {string} helpText default ''
 *  @prop {string} label default ''
 *  @prop {array|object} failedPolicies default {}
 *  @prop {function} validator default noop
 *  @prop {Array|Object|Number|String} value default ''
 */
export default {
  name: 'MultiSelect',
  mixins: [InputMixin, NotificationMixin],
  components: {
    FrInputLayout: InputLayout,
    VueMultiSelect,
  },
  props: {
    /**
     * List of errors related to input value
     */
    errors: {
      type: Array,
      default: () => [],
    },
    /**
     * Options for select input.
     */
    selectOptions: {
      type: [Array, Object],
      default: () => [],
    },
    searchable: {
      type: Boolean,
      default: true,
      required: false,
    },
    taggable: {
      type: Boolean,
      default: false,
      required: false,
    },
    placeholder: {
      type: String,
      default: '',
      required: false,
    },
    /**
     * @description Enable autofocus
     */
    autofocus: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      searchValue: '',
      nextIdTag: 0,
      isOpen: false,
      customOptions: [],
    };
  },
  mounted() {
    if (this.autofocus) {
      this.openHandler();
    }
  },
  computed: {
    options: {
      get() {
        if (this.selectOptions.length && has(this.selectOptions[0], 'value')) {
          return map(this.selectOptions, (option) => ({
            text: option.text,
            value: option.value,
            multiselectId: this.tagId(),
            copySelect: false,
            ...option,
          }));
        }
        if (this.selectOptions.length) {
          return map(this.selectOptions, (option) => ({
            text: option,
            value: option,
            multiselectId: this.tagId(),
            copySelect: false,
          }));
        }
        return this.customOptions;
      },
      set(newValue) {
        this.customOptions = newValue;
      },
    },
    defaultSearchable() {
      return this.searchable || this.options.length > 9;
    },
    defaultPlaceholder() {
      return this.placeholder || this.$t('common.typeToSearch');
    },
  },
  methods: {
    tagId() {
      const { nextIdTag } = this;
      this.nextIdTag += 1;
      return nextIdTag;
    },
    setSelectedForCopy(option) {
      option.copySelect = !option.copySelect;
      option.multiselectId = this.tagId();
    },
    copyOptions() {
      const selectedOptions = this.inputValue
        .filter((option) => option.copySelect)
        .map((option) => option.value)
        .join(', ');
      if (selectedOptions.length) {
        clipboard.writeText(selectedOptions).then(() => {
          this.displayNotification('IDMMessages', 'success', this.$t('common.copySuccess'));
        }, (error) => {
          this.showErrorMessage(error, this.$t('common.copyFail'));
        });
      }
    },
    close() {
      this.addTag();
      this.isOpen = false;
      setTimeout(() => {
        if (!this.isOpen) {
          this.options.forEach((option) => {
            option.copySelect = false;
          });
        }
      }, 50);
    },
    addTag() {
      if (this.taggable && this.searchValue.length > 0) {
        this.searchValue.split(',').forEach((untrimmedVal) => {
          const newVal = untrimmedVal.trim();
          const existsInCurrentValues = find(this.inputValue, { value: newVal });
          if (!existsInCurrentValues) {
            this.options = [...this.inputValue];
            this.options.push({
              multiselectId: this.tagId(), text: newVal, value: newVal, copySelect: false,
            });
            this.inputValue.push({
              multiselectId: this.tagId(), text: newVal, value: newVal, copySelect: false,
            });
          }
        });
      }
      this.floatLabels = this.inputValue && this.inputValue.length;
    },
    searchChange(value) {
      this.searchValue = value;
      this.$emit('search-change', value);
    },
    setInputValue(newVal) {
      const newInputValue = map(newVal, (val) => find(this.options, { value: val }));
      if (!isEqual(this.inputValue, newInputValue)) {
        this.inputValue = newInputValue;
      }
    },
    inputValueHandler(newVal) {
      this.floatLabels = (newVal.length || document.activeElement === this.$refs.vms.$el.querySelector('input')) > 0 && this.label;
      this.$emit('input', map(newVal, 'value'));
    },
    /**
     * @description focus the Vue Multi Select component (vms) and floats the label
     */
    openHandler() {
      this.$refs.vms.$el.querySelector('input').focus();
      this.isOpen = true;
      this.floatLabels = true;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@forgerock/platform-shared/src/components/Field/assets/vue-multiselect.scss';

::v-deep .multiselect:focus-within {
  border-color: $blue;
  box-shadow: 0 0 0 0.0625rem $blue;
}

.multiselect .multiselect__tag-selected {
  color: white;
  background-color: $primary;
  border-color: $primary;

  .multiselect__tag-icon::after {
    color: white;
  }

  .multiselect__tag-icon:hover {
    background-color: $primary;
  }
}
</style>
