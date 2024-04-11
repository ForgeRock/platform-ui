<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    v-slot="{ meta: { valid } }"
    as="span">
    <BFormGroup class="mb-3">
      <FrSelectInput
        ref="select"
        v-if="keyOptions.length"
        v-model="inputValue.key"
        :name="keyLabel"
        :label="keyLabel"
        :options="availableKeyOptions"
        @search-change="validateKey($event)"
        @tag="addNewKey($event)"
        :taggable="isTaggable"
        :tag-placeholder="tagPlaceholder"
        :validation="validationRules">
        <template #noResult>
          <div class="mx-auto text-danger">
            {{ $t('common.policyValidationMessages.UNIQUE') }}
          </div>
        </template>
      </FrSelectInput>
      <FrBasicInput
        v-else
        v-model="inputValue.key"
        type="string"
        :autofocus="autofocus"
        :name="keyLabel"
        :label="keyLabel"
        :validation="validationRules"
        :value="inputValue.value" />
    </BFormGroup>
    <BFormGroup class="mb-3">
      <FrTextArea
        v-model="inputValue.value"
        validation="required"
        :label="valueLabel"
        :name="valueLabel" />
    </BFormGroup>
    <div class="d-flex flex-row-reverse">
      <BButton
        @click.stop="saveKeyValue"
        :disabled="!valid"
        variant="outline-primary">
        {{ $t('common.done') }}
      </BButton>
      <BButton
        @click.stop="$emit('cancel')"
        variant="link">
        {{ $t('common.cancel') }}
      </BButton>
    </div>
  </VeeForm>
</template>

<script>
import {
  BButton,
  BFormGroup,
} from 'bootstrap-vue';
import {
  cloneDeep,
  xor,
  union,
} from 'lodash';
import { Form as VeeForm } from 'vee-validate';
import FrBasicInput from '@forgerock/platform-shared/src/components/Field/BasicInput';
import FrSelectInput from '@forgerock/platform-shared/src/components/Field/SelectInputDeprecated';
import FrTextArea from '@forgerock/platform-shared/src/components/Field/TextArea';

/**
 * New/Edit Key value pair component
 * Supports an array of possible keys using select input
 */
export default {
  name: 'KeyValuePanel',
  components: {
    BButton,
    BFormGroup,
    FrBasicInput,
    FrSelectInput,
    FrTextArea,
    VeeForm,
  },
  props: {
    /**
     * Autofocus field.
     */
    autofocus: {
      type: Boolean,
      default: true,
    },
    /**
     * Key options from other key/value objects in list
     */
    allKeyOptions: {
      type: Array,
      default: () => [],
    },
    /**
     * Text that shows when a new key can be added
     */
    tagPlaceholder: {
      type: String,
      default: '',
    },
    /**
     * Key options available in select input
     */
    keyOptions: {
      type: Array,
      default: () => [],
    },
    /**
     * Field validation rules
     */
    validationRules: {
      type: Object,
      default: () => {},
    },
    /**
     * Key value object. Contains key and value labels
     */
    value: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      inputValue: {},
      isTaggable: true,
      availableKeyOptions: this.getAvailableKeyOptions({}),
    };
  },
  computed: {
    keyLabel() {
      return this.inputValue.keyLabel || this.$t('common.key');
    },
    valueLabel() {
      return this.inputValue.valueLabel || this.$t('common.value');
    },
  },
  mounted() {
    // disable auto complete on the vue multiselect search input
    if (this.keyOptions.length) this.$refs.select.$refs.vms.$refs.search.setAttribute('autocomplete', 'off');
  },
  methods: {
    /**
     * Add a new key to the list of keys. Do not add a duplicate key
     *
     * @param {String} key key to add to options
     */
    addNewKey(key) {
      if (this.availableKeyOptions.indexOf(key) === -1) this.$emit('key-added', key);
    },
    /**
     * Get available key options for select input
     *
     * @returns {Array} key options
     */
    getAvailableKeyOptions(inputValue) {
      // current inputValue always needs to be an option
      return inputValue.key?.length
        ? union(this.keyOptions, [inputValue.key])
        : this.keyOptions;
    },
    /**
     * Validate a given key. Used for select input
     * If the key is a duplicate, disable tagging
     *
     * @param {String} key key to validate
     */
    validateKey(key) {
      if (xor(this.allKeyOptions, this.keyOptions).indexOf(key) !== -1) {
        this.isTaggable = false;
        this.availableKeyOptions = [];
      } else {
        this.isTaggable = true;
        this.availableKeyOptions = this.getAvailableKeyOptions(this.inputValue);
      }
    },
    /**
     * Emits an input change to notify v-model that the component has updated
     */
    saveKeyValue() {
      this.$emit('save-key-value', { key: this.inputValue.key, value: this.inputValue.value });
    },
  },
  watch: {
    keyOptions() {
      this.availableKeyOptions = this.getAvailableKeyOptions(this.inputValue);
    },
    value: {
      deep: true,
      handler(value) {
        this.inputValue = cloneDeep(value);
      },
      immediate: true,
    },
  },
};
</script>
