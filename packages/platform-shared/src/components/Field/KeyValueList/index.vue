<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BListGroup
      v-if="!isEmpty(keyValues) || currentKey === ''"
      class="border-top border-bottom"
      flush>
      <BListGroupItem
        v-for="(value, key) in keyValues"
        @click="editItem(key)"
        :key="`${id}_keyvalue-${key}`"
        :active="currentKey === key"
        :style="{ cursor: currentKey ? 'default' : 'pointer' }">
        <FrKeyValuePanel
          v-if="currentKey === key"
          v-model="keyValueObject"
          :key-options="availableKeyOptions"
          :tag-placeholder="tagLabel"
          :validation-rules="validationRules"
          @cancel="currentKey = null"
          @save-key-value="saveKeyValue"
          @key-added="addCustomKey($event)" />
        <div
          v-else
          class="d-flex justify-content-between align-items-center">
          <BRow class="w-100">
            <BCol class="font-weight-bold col-md-2 text-truncate">
              {{ key }}
            </BCol>
            <BCol class="font-italic col-md-8 text-truncate">
              {{ value }}
            </BCol>
            <BCol md="2">
              <BButtonGroup>
                <BButton
                  :style="{ cursor: currentKey ? 'default' : 'pointer' }"
                  variant="none"
                  class="py-0"
                  @click.stop="deleteItem(key)">
                  <FrIcon name="delete" />
                </BButton>
                <BButton
                  :style="{ cursor: currentKey ? 'default' : 'pointer' }"
                  variant="none"
                  class="py-0"
                  @click.stop="editItem(key)">
                  <FrIcon name="edit" />
                </BButton>
              </BButtonGroup>
            </BCol>
          </BRow>
        </div>
      </BListGroupItem>
      <BListGroupItem
        v-if="currentKey === ''"
        active>
        <FrKeyValuePanel
          v-model="keyValueObject"
          :all-key-options="[...keyOptions, ...addedKeys]"
          :key-options="availableKeyOptions"
          :tag-placeholder="tagLabel"
          :validation-rules="validationRules"
          @cancel="currentKey = null"
          @save-key-value="saveKeyValue"
          @key-added="addCustomKey($event)" />
      </BListGroupItem>
    </BListGroup>
    <div
      v-if="currentKey === null"
      class="mt-3">
      <BButton
        variant="link"
        class="p-0 text-decoration-none"
        :disabled="disabled"
        @click="showAdd()">
        <FrIcon
          class="mr-2"
          name="add" />
        {{ addLabel || $t('common.add') }}
      </BButton>
    </div>
  </div>
</template>

<script>
import {
  BButton,
  BButtonGroup,
  BCol,
  BListGroup,
  BListGroupItem,
  BRow,
} from 'bootstrap-vue';
import {
  isEmpty,
  cloneDeep,
  xor,
} from 'lodash';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrKeyValuePanel from './KeyValuePanel';
import InputMixin from '../Wrapper/InputMixin';

/**
 * Key value pair component
 */
export default {
  name: 'KeyValueList',
  mixins: [
    InputMixin,
  ],
  components: {
    BButton,
    BButtonGroup,
    BCol,
    BListGroup,
    BListGroupItem,
    BRow,
    FrIcon,
    FrKeyValuePanel,
  },
  props: {
    /**
     * Custom text to display to add another key/value
     */
    addLabel: {
      type: String,
      default: '',
    },
    /**
     * Label for key input
     */
    keyLabel: {
      type: String,
      default: '',
    },
    /**
     * Label for tagging a new key
     */
    tagLabel: {
      type: String,
      default: '',
    },
    /**
     * Label for value input
     */
    valueLabel: {
      type: String,
      default: '',
    },
    /**
     * Show panel to add new key/value on mount
     */
    showInitialAdd: {
      type: Boolean,
      default: false,
    },
    /**
     * Optional array of keys to select from
     */
    keyOptions: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    availableKeyOptions() {
      return this.keyOptions.length
        ? xor([...this.addedKeys, ...this.keyOptions], Object.keys(this.keyValues))
        : [];
    },
  },
  data() {
    let keyValues;

    if (this.value === null || this.value === '') {
      keyValues = {};
    } else {
      keyValues = cloneDeep(this.value);
    }

    return {
      id: null,
      addedKeys: [],
      currentKey: null,
      keyValues,
      validationRules: {},
      keyValueObject: {
        key: '',
        keyLabel: this.keyLabel,
        value: '',
        valueLabel: this.valueLabel,
      },
    };
  },
  mounted() {
    // eslint-disable-next-line no-underscore-dangle
    this.id = this._uid;
    if (this.showInitialAdd) {
      this.showAdd();
    }
  },
  methods: {
    /**
     * Adds a custom key to the list of available key options.
     * Used when KeyValuePanel uses a select input for key.
     *
     * @param {String} key new key to add
     */
    addCustomKey(key) {
      this.addedKeys.push(key);
      this.keyValueObject.key = key;
    },
    /**
      * Removes an item from the key value list
      *
      * @param {String} key key for the object property to be deleted
      */
    deleteItem(key) {
      // do not allow delete if already editing an item
      if (this.currentKey !== null) return;

      const index = this.addedKeys.indexOf(key);
      if (index > -1) this.addedKeys.splice(index, 1);
      this.$delete(this.keyValues, key);
      this.setValidationRules(this.keyValues);
      this.$emit('input', this.keyValues);
    },
    /**
     * Shows edit fields for key and value
     *
     * @param {String} key key for the object property to be edited
     */
    editItem(key) {
      // do not allow edit if already editing an item
      if (this.currentKey !== null) return;

      const paredDownKeyValues = cloneDeep(this.keyValues);
      this.$delete(paredDownKeyValues, key);
      this.setValidationRules(paredDownKeyValues);
      this.keyValueObject.value = this.keyValues[key];
      this.keyValueObject.key = key;
      this.currentKey = key;
    },
    /**
      * Check if an object is empty
      *
      * @param {Object} objectToCheck
      */
    isEmpty,
    /**
      * Emits an input change to notify v-model that the component has updated
      *
      * @param {Object} keyValueObject the key and value values to be added/edited in the save
      */
    saveKeyValue(keyValueObject) {
      if (keyValueObject.key !== this.currentKey && this.currentKey !== '') {
        this.$delete(this.keyValues, this.currentKey);
        const index = this.addedKeys.indexOf(this.currentKey);
        if (index > -1) this.addedKeys.splice(index, 1);
      }

      if (this.keyOptions.indexOf(keyValueObject.key) === -1 && this.addedKeys.indexOf(keyValueObject.key) === -1) {
        this.addedKeys.push(keyValueObject.key);
      }

      this.$set(this.keyValues, keyValueObject.key, keyValueObject.value);
      this.$emit('input', this.keyValues);
      this.currentKey = null;
    },
    /**
     * Sets which values should be considered in unique check
     */
    setValidationRules(keyValues) {
      const rulesObject = this.availableKeyOptions.length
        ? { uniqueValue: Object.keys(keyValues) }
        : { unique: Object.keys(keyValues) };
      this.validationRules = { ...rulesObject, required: true };
    },
    /**
     * Displays blank key and value fields to add a new key-value object
     */
    showAdd() {
      this.keyValueObject.value = '';
      this.keyValueObject.key = '';
      this.currentKey = '';
      this.setValidationRules(this.keyValues);
    },
  },
};
</script>
