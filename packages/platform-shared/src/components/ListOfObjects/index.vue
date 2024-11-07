<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="pt-2">
    <div :class="{ 'border-bottom': isValidJSONString(listValues) && isValidField() && showBorders}">
      <div
        v-if="showTitle"
        class="d-flex justify-content-between align-items-center">
        <label>{{ fieldTitle }}</label>
      </div>
      <div>
        <div
          v-if="!listValues || !listValues.length"
          :class="{ 'border-top': showBorders }"
          class="d-flex pt-3 pb-3 px-0 align-items-center">
          <div class="text-muted text-left flex-grow-1">
            ({{ $t('common.none') }})
          </div>
          <button
            :class="buttonClass"
            class="btn mr-1 mb-2 mb-lg-0"
            data-testid="list-objects-none-add"
            :disabled="disabled"
            @click.prevent="addObjectToList(-1)">
            <FrIcon name="add" />
          </button>
        </div>
        <template v-if="isValidJSONString(listValues) && isValidField()">
          <div
            v-for="(obj, index) in listValues"
            :key="obj.listUniqueIndex"
            :class="{ 'border-top': showBorders }"
            class="d-flex pt-3 pb-2 px-0">
            <div class="flex-grow-1 pr-3 position-relative">
              <div class="form-row align-items-center">
                <template v-for="(objValue, key) in obj">
                  <div
                    v-if="key !== 'listUniqueIndex' && properties[key] && !properties[key].hidden"
                    :key="key"
                    :class="fill ? 'col-lg-6' : 'col-lg-4'"
                    class="pb-2">
                    <div v-if="properties[key].type === 'boolean'">
                      <BFormCheckbox
                        v-model="obj[key]"
                        :disabled="disabled || properties[key].disabled"
                        :name="`${key}_${index}_${_uid}`"
                        @change="emitInput(listValues)">
                        {{ properties[key].title || key }}
                      </BFormCheckbox>
                    </div>
                    <div v-else-if="properties[key].type === 'number'">
                      <FrField
                        :value="obj[key]"
                        @input="obj[key] = $event; emitInput(listValues)"
                        :disabled="disabled || properties[key].disabled"
                        type="number"
                        validation="required|isNumber"
                        :label="properties[key].title || key"
                        :name="`${key}_${index}_${_uid}`"
                      />
                    </div>
                    <div v-else>
                      <FrField
                        :value="obj[key] || properties[key].value"
                        @input="obj[key] = $event; emitInput(listValues)"
                        :disabled="disabled || properties[key].disabled"
                        :label="properties[key].title || key"
                        :name="`${key}_${index}_${_uid}`"
                        :options="properties[key].options"
                        :type="properties[key].type"
                        :validation="required && required.length && required.includes(properties[key].title) ? 'required' : ''"
                      />
                    </div>
                  </div>
                </template>
              </div>
            </div>
            <div v-if="multiValued || noListValuesOnMount">
              <div
                class="position-relative d-inline-flex justify-content-end"
                style="width: 128px;">
                <button
                  v-if="listValues.length > 0"
                  :data-testid="`list-objects-remove-${index}`"
                  :class="buttonClass"
                  class="btn mr-1 mb-2 mb-lg-0"
                  :disabled="disabled"
                  @click.prevent="removeElementFromList(index)">
                  <FrIcon name="remove" />
                </button>
                <button
                  v-if="multiValued || listValues.length === 0"
                  :data-testid="`list-objects-add-${index}`"
                  :class="buttonClass"
                  class="btn mr-1 mb-2 mb-lg-0"
                  :disabled="disabled"
                  @click.prevent="addObjectToList(index)">
                  <FrIcon name="add" />
                </button>
              </div>
            </div>
          </div>
        </template>
        <div v-else>
          <FrInlineJsonEditor
            v-if="showEditor"
            v-on="$listeners"
            language="json"
            :line-count="lineCount"
            :read-only="false"
            :value="advancedValue"
            @update-field="emitInput($event)" />
        </div>
      </div>
    </div>

    <FrValidationError
      class="error-messages"
      :validator-errors="errors"
      :field-name="label" />
  </div>
</template>

<script>
import { cloneDeep } from 'lodash';
import { BFormCheckbox } from 'bootstrap-vue';
import { useField } from 'vee-validate';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrInlineJsonEditor from '@forgerock/platform-shared/src/components/InlineJsonEditor';
import FrValidationError from '@forgerock/platform-shared/src/components/ValidationErrorList';
import ListsMixin from '@forgerock/platform-shared/src/mixins/ListsMixin';
import { toRef } from 'vue';
import uuid from 'uuid/v4';

/**
 * @description Component that provides support for list of objects
 *
 * Attempts to render list of obects. If the object contains complex properties (i.e. nested arrays or objects)
 * or is the array is not valid JSON, displays array of objects in code editor
 */
export default {
  name: 'ListOfObjects',
  components: {
    BFormCheckbox,
    FrField,
    FrIcon,
    FrInlineJsonEditor,
    FrValidationError,
  },
  mixins: [
    ListsMixin,
  ],
  props: {
    buttonClass: {
      type: String,
      default: 'btn-outline-secondary',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    fill: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
    multiValued: {
      type: Boolean,
      default: true,
    },
    preventLabelCapitalization: {
      type: Boolean,
      default: false,
    },
    preventOptionalLabelAppend: {
      type: Boolean,
      default: false,
    },
    properties: {
      type: Object,
      default: () => ({}),
    },
    required: {
      type: Array,
      default: () => [],
    },
    showBorders: {
      type: Boolean,
      default: true,
    },
    showTitle: {
      type: Boolean,
      default: true,
    },
    value: {
      type: [Array, Object],
      default: () => [],
    },
    /**
     * Whether error validation should happen when this component renders.
     */
    validationImmediate: {
      type: Boolean,
      default: false,
    },
    /**
     * Vee-validate validation types to check against.
     */
    validation: {
      type: [String, Object],
      default: '',
    },
  },
  setup(props) {
    const name = props.label || uuid();
    const {
      value: listValues, errors, setErrors,
    } = useField(() => `${name}-id-${uuid()}`, toRef(props, 'validation'), { validateOnMount: props.validationImmediate, initialValue: [], bails: false });

    return { listValues, errors, setErrors };
  },
  data() {
    return {
      noListValuesOnMount: true,
      listUniqueIndex: 0,
      showEditor: false,
    };
  },
  computed: {
    advancedValue() {
      return this.listValues.map((val) => {
        delete val.listUniqueIndex;
        return val;
      });
    },
    requiredAndEmpty() {
      const filteredListValues = this.checkEmptyValues(this.listValues);
      return (this.validation?.required || this.validation?.includes('required')) && !filteredListValues.length;
    },
    fieldTitle() {
      const label = this.preventLabelCapitalization ? this.label : this.capitalizedDescription;
      if (this.validation?.required || this.validation?.includes('required')) {
        return label;
      }
      return this.preventOptionalLabelAppend ? label : this.$t('common.optionalFieldTitle', { fieldTitle: label });
    },
  },
  mounted() {
    if (this.value) {
      let listValues = cloneDeep(this.value);
      if (!this.multiValued || !Array.isArray(listValues)) {
        listValues = [listValues];
      }
      listValues.forEach((val) => {
        val.listUniqueIndex = this.getUniqueIndex();
      });
      this.listValues = listValues;
      this.showEditor = !!listValues.length;
      this.noListValuesOnMount = !listValues.length;
      this.validateField();
    }
  },
  methods: {
    /**
     * populate list of objects with new member.  Set defaults for boolean and number properties
     */
    addObjectToList(valueIndex) {
      this.showEditor = true;
      const emptyObjectWithKeys = this.createObject(this.properties);
      this.listValues.splice(valueIndex + 1, 0, { ...emptyObjectWithKeys });
      this.updateListKey();
      this.$emit('list-updated', 'add', valueIndex + 1);
      this.emitInput(this.listValues);
    },
    emitInput(value) {
      this.$nextTick(() => {
        const emitValue = this.checkEmptyValues(value);
        this.validateField();

        if (emitValue.length === 0) {
          this.$emit('input', this.multiValued ? [] : {});
        } else {
          this.$emit('input', this.multiValued ? emitValue : emitValue[0]);
        }
      });
    },
    updateListKey() {
      return this.listValues.forEach((val) => {
        val.listUniqueIndex = this.getUniqueIndex();
      });
    },
    /**
     * Check if all the values in our object are empty or null
     * If nothing is left, delete the obj. This helps ensure required fields
     * actually have values present.
     */
    checkEmptyValues(value) {
      const filteredArray = cloneDeep(value);
      filteredArray.forEach((obj, index) => {
        delete obj.listUniqueIndex;
        const filteredVals = Object.values(obj).filter((x) => x !== null && x !== '');
        if (!filteredVals.length) {
          filteredArray.splice(index, 1);
        }
      });
      return filteredArray;
    },
    /**
     * Ensures our keys in v-if iteration have unique values
     *
     * @returns {number} New unique index
     */
    getUniqueIndex() {
      this.listUniqueIndex += 1;
      return this.listUniqueIndex;
    },
    /**
     * determine whether any properties of an object in the array
     * are too complex to render (i.e. objects with sub object or array properties)
     */
    isValidField() {
      const values = Object.values(this.properties) || [];
      const results = [];

      values.forEach((val) => {
        if (val.type && (val.type === 'array' || val.type === 'object')) {
          results.push(false);
        }
        results.push(true);
      });

      return !results.includes(false);
    },
    /**
     * remove element from list component at index
     */
    removeElementFromList(index) {
      this.listValues.splice(index, 1);
      this.updateListKey();
      this.$emit('list-updated', 'remove', index);
      this.emitInput(this.listValues);
    },
    validateField() {
      this.setErrors(this.requiredAndEmpty ? [this.$t('common.policyValidationMessages.REQUIRED')] : []);
    },
  },
};
</script>
