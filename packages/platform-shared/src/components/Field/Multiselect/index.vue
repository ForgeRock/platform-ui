<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    @keydown.meta.67="copyOptions"
    @keydown.ctrl.67="copyOptions">
    <FrInputLayout
      :description="description"
      :id="id"
      :errors="errors"
      :is-html="isHtml"
      :label="label"
      :name="name"
      :validation="validation"
      :validation-immediate="validationImmediate">
      <VueMultiSelect
        :id="id"
        v-bind="$attrs"
        v-if="selectOptions"
        v-model="inputValue"
        label="text"
        ref="vms"
        track-by="multiselectId"
        :class="[{'polyfill-placeholder': floatLabels }, 'white-label-background form-control p-0', {'no-multiselect-label': !label }, {'h-100': floatLabels || !label }]"
        :close-on-select="false"
        :disabled="disabled"
        :hide-selected="true"
        :multiple="true"
        :name="name"
        :options="selectOptions"
        :placeholder="defaultPlaceholder"
        :searchable="defaultSearchable"
        :show-labels="false"
        :tag-placeholder="$t('common.placeholders.addOption')"
        :taggable="taggable"
        @close="close"
        @input="$emit('input', map(inputValue, 'value'))"
        @open="openHandler"
        @search-change="searchChange"
        @tag="addTag">
        <slot name="noResult">
          {{ $t('common.noResult') }}
        </slot>
        <template #tag="{option, remove}">
          <span :class="['multiselect__tag', {'multiselect__tag-selected': option.copySelect}, valueClass]">
            <span
              class="multiselect__tag-contents"
              @mousedown="setSelectedForCopy(option)">
              {{ option && option.text }}
            </span>
            <i
              @click.prevent="remove(option)"
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
import FrInputLayout from '../Wrapper/InputLayout';
import InputMixin from '../Wrapper/InputMixin';

/**
 *  Multi select input. Allows selection of multiple elements in a dropdown
 *
 *  @Mixes InputMixin - default props and methods for inputs
 *  @param {Array} value default []
 */
export default {
  name: 'MultiSelect',
  mixins: [InputMixin, NotificationMixin],
  components: {
    FrInputLayout,
    VueMultiSelect,
  },
  props: {
    placeholder: {
      type: String,
      default: '',
    },
    /**
     * Options for select input.
     */
    options: {
      type: [Array, Object],
      default: () => [],
    },
    searchable: {
      type: Boolean,
      default: true,
    },
    taggable: {
      type: Boolean,
      default: false,
    },
    valueClass: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      searchValue: '',
      nextIdTag: 0,
      tagOptions: [],
    };
  },
  mounted() {
    if (this.autofocus) {
      this.openHandler();
    }
  },
  computed: {
    selectOptions() {
      let mapOptions = [];
      if (this.options.length) {
        if (has(this.options[0], 'value')) {
          mapOptions = map(this.options, (option) => ({
            text: option.text,
            value: option.value,
            multiselectId: option.multiselectId !== undefined ? option.multiselectId : this.generateTagId(),
            copySelect: false,
            ...option,
          }));
        } else {
          mapOptions = map(this.options, (option) => ({
            text: option,
            value: option,
            multiselectId: this.generateTagId(),
            copySelect: false,
          }));
        }
      }
      return [...mapOptions, ...this.tagOptions];
    },
    defaultSearchable() {
      return this.searchable || this.selectOptions.length > 9;
    },
    defaultPlaceholder() {
      return this.placeholder || this.$t('common.typeToSearch');
    },
  },
  methods: {
    addTag() {
      if (this.taggable && this.searchValue.length > 0) {
        this.searchValue.split(',').forEach((untrimmedVal) => {
          const newVal = untrimmedVal.trim();
          const existsInCurrentValues = find(this.inputValue, { value: newVal });
          if (!existsInCurrentValues) {
            this.tagOptions.push({
              multiselectId: this.generateTagId(), text: newVal, value: newVal, copySelect: false,
            });
            this.inputValue.push({
              multiselectId: this.generateTagId(), text: newVal, value: newVal, copySelect: false,
            });
            this.$emit('input', map(this.inputValue, 'value'));
          }
        });
      }
    },
    close() {
      const selected = this.options.map((option) => option.copySelect);
      this.addTag();
      this.selectOptions.forEach((option, index) => {
        if (selected[index]) {
          option.copySelect = true;
        }
      });
      this.inputValueHandler(this.inputValue);
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
    inputValueHandler(inputValue) {
      this.floatLabels = (inputValue.length || document.activeElement === this.$refs.vms.$el.querySelector('input')) > 0 && this.label;
    },
    generateTagId() {
      const { nextIdTag } = this;
      this.nextIdTag += 1;
      return nextIdTag;
    },
    map,
    /**
     * @description focus the Vue Multi Select component (vms) and floats the label
     */
    openHandler() {
      this.$refs.vms.$el.querySelector('input').focus();
      this.floatLabels = true;
    },
    searchChange(value) {
      this.searchValue = value;
      this.$emit('search-change', value);
    },
    setInputValue(newVal) {
      let newInputValue = newVal;
      if (!has(newInputValue[0], 'value')) {
        newInputValue = map(newVal, (val) => find(this.selectOptions, { value: val }));
      }
      if (!isEqual(this.inputValue, newInputValue)) {
        this.inputValue = newInputValue;
      }
    },
    setSelectedForCopy(option) {
      option.copySelect = !option.copySelect;
      option.multiselectId = option.multiselectId !== undefined ? option.multiselectId : this.generateTagId();
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@forgerock/platform-shared/src/components/Field/assets/vue-multiselect.scss';

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
