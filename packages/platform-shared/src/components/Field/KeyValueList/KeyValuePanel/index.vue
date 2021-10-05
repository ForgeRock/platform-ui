<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <ValidationObserver v-slot="{ invalid }">
    <BFormGroup class="mb-3">
      <FrSelect
        ref="select"
        v-if="keyOptions.length"
        v-model="value.key"
        :name="value.keyLabel || $t('common.key')"
        :label="value.keyLabel || $t('common.key')"
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
      </FrSelect>
      <FrBasicInput
        v-else
        v-model="value.key"
        type="string"
        :autofocus="autofocus"
        :name="value.keyLabel || $t('common.key')"
        :label="value.keyLabel || $t('common.key')"
        :validation="validationRules" />
    </BFormGroup>
    <BFormGroup class="mb-3">
      <FrTextArea
        v-model="value.value"
        validation="required"
        :label="value.valueLabel || $t('common.value')"
        :name="value.valueLabel || $t('common.value')" />
    </BFormGroup>
    <div class="d-flex flex-row-reverse">
      <BButton
        @click.stop="saveKeyValue"
        :disabled="invalid"
        variant="outline-primary">
        {{ $t('common.done') }}
      </BButton>
      <BButton
        @click.stop="$emit('cancel')"
        variant="link">
        {{ $t('common.cancel') }}
      </BButton>
    </div>
  </ValidationObserver>
</template>

<script>
import {
  BButton,
  BFormGroup,
} from 'bootstrap-vue';
import {
  xor,
  union,
} from 'lodash';
import { ValidationObserver } from 'vee-validate';
import FrBasicInput from '@forgerock/platform-shared/src/components/Field/BasicInput';
import FrSelect from '@forgerock/platform-shared/src/components/Field/Select';
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
    FrSelect,
    FrTextArea,
    ValidationObserver,
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
  mounted() {
    // disable auto complete on the vue multiselect search input
    if (this.keyOptions.length) this.$refs.select.$refs.vms.$refs.search.setAttribute('autocomplete', 'off');
  },
  data() {
    return {
      isTaggable: true,
      availableKeyOptions: this.getAvailableKeyOptions(),
    };
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
    getAvailableKeyOptions() {
      // current value always needs to be an option
      return this.value.key.length
        ? union(this.keyOptions, [this.value.key])
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
        this.availableKeyOptions = this.getAvailableKeyOptions();
      }
    },
    /**
     * Emits an input change to notify v-model that the component has updated
     */
    saveKeyValue() {
      this.$emit('save-key-value', { key: this.value.key, value: this.value.value });
    },
  },
  watch: {
    keyOptions() {
      this.availableKeyOptions = this.getAvailableKeyOptions();
    },
  },
};
</script>
