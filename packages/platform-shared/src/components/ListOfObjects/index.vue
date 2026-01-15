<!-- Copyright (c) 2020-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="pt-2">
    <div :class="{ 'border-bottom': isValidJSONString(listValues) && isValidField() && showBorders && showLastBorder && !showTable}">
      <div
        v-if="showTitle"
        class="d-flex justify-content-between align-items-center">
        <label>{{ fieldTitle }}</label>
      </div>
      <div :class="showTable ? 'border rounded' : ''">
        <div
          v-if="!listValues || !listValues.length"
          :class="{ 'border-top': showBorders && !showTable }"
          class="d-flex pt-3 pb-3 px-0 align-items-center">
          <div
            :class="{ 'pl-3': showTable }"
            class="text-muted text-left flex-grow-1">
            ({{ $t('common.none') }})
          </div>
          <BButton
            :class="buttonClass"
            class="btn mr-1 mb-2 mb-lg-0 text-dark"
            data-testid="list-objects-none-add"
            :disabled="disabled"
            :aria-label="$t('common.add')"
            @click.prevent="addObjectToList(-1)">
            <FrIcon name="add" />
          </BButton>
        </div>
        <template v-if="isValidJSONString(listValues) && isValidField()">
          <div
            v-for="(obj, index) in listValues"
            :key="obj.listUniqueIndex"
            :class="{ 'border-top': showBorders && !(showTable && index === 0), 'pt-3': !showTable }"
            class="d-flex pb-2 px-0">
            <div
              :class="{'pr-3': !showTable }"
              class="flex-grow-1 position-relative">
              <div class="form-row align-items-center">
                <BContainer
                  v-if="showTable && index === 0"
                  :key="key"
                  class="ml-1 p-0 responsive-header d-none d-lg-block border-bottom"
                  fluid>
                  <BRow class="m-0">
                    <BCol
                      v-for="(property, propertyKey) in objectProperties"
                      :key="propertyKey"
                      cols="3"
                      class="font-weight-bold text-dark pr-1 py-2">
                      {{ property.title || propertyKey }}
                    </BCol>
                  </BRow>
                </BContainer>
                <template v-for="(objValue, key) in obj">
                  <div
                    v-if="key !== 'listUniqueIndex' && objectProperties[key] && !objectProperties[key].hidden"
                    :key="key"
                    :class="[`col-lg-${columnWidth}`, showTable ? 'p-3' : 'pb-2']">
                    <div v-if="objectProperties[key].type === 'boolean'">
                      <BFormCheckbox
                        v-model="obj[key]"
                        :class="objectProperties[key].fieldClass || ''"
                        :disabled="disabled || objectProperties[key].disabled"
                        :name="`${key}_${index}_${_uid}`"
                        @change="emitInput(listValues)">
                        {{ !showTable || isSmallScreen ? objectProperties[key].title || key : '' }}
                      </BFormCheckbox>
                    </div>
                    <div v-else-if="objectProperties[key].type === 'number'">
                      <FrField
                        :value="obj[key]"
                        @input="obj[key] = $event; emitInput(listValues)"
                        :class="objectProperties[key].fieldClass || ''"
                        :disabled="disabled || objectProperties[key].disabled"
                        type="number"
                        validation="required|isNumber"
                        :label="!showTable || isSmallScreen ? objectProperties[key].title || key : ''"
                        :name="`${key}_${index}_${_uid}`"
                      />
                    </div>
                    <div v-else>
                      <FrField
                        :value="obj[key] || objectProperties[key].value"
                        @input="obj[key] = $event; emitInput(listValues)"
                        :class="objectProperties[key].fieldClass || ''"
                        :disabled="disabled || objectProperties[key].disabled"
                        :label="!showTable || isSmallScreen ? objectProperties[key].title || key : ''"
                        :name="`${key}_${index}_${_uid}`"
                        :options="objectProperties[key].options"
                        :type="objectProperties[key].type"
                        :validation="setFieldValidation(objectProperties[key])"
                      />
                    </div>
                    <small
                      v-if="objectProperties[key].description"
                      class="form-text text-muted pb-4"
                      v-html="objectProperties[key].description" />
                  </div>
                </template>
              </div>
            </div>
            <div v-if="multiValued || noListValuesOnMount">
              <div
                v-if="showTable && index === 0"
                class="py-2 responsive-header d-none d-lg-block border-bottom">
                  &nbsp;
              </div>
              <div class="position-relative d-inline-flex justify-content-end">
                <BButton
                  v-if="listValues.length > 0"
                  :data-testid="`list-objects-remove-${index}`"
                  :class="buttonClass"
                  class="btn mr-1 mb-2 mb-lg-0 text-dark"
                  :disabled="disabled"
                  :aria-label="$t('common.remove')"
                  @click.prevent="removeElementFromList(index)">
                  <FrIcon name="remove" />
                </BButton>
                <BButton
                  v-if="multiValued || listValues.length === 0"
                  :data-testid="`list-objects-add-${index}`"
                  :class="buttonClass"
                  class="btn mr-1 mb-2 mb-lg-0 text-dark"
                  :disabled="disabled"
                  :aria-label="$t('common.add')"
                  @click.prevent="addObjectToList(index)">
                  <FrIcon name="add" />
                </BButton>
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
import { BFormCheckbox, BButton } from 'bootstrap-vue';
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
    BButton,
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
      default: '',
    },
    columnWidth: {
      type: String,
      default: '4',
    },
    disabled: {
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
    showEmptyList: {
      type: Boolean,
      default: false,
    },
    showLastBorder: {
      type: Boolean,
      default: true,
    },
    /**
     * Whether to show the grid/table style layout
     */
    showTable: {
      type: Boolean,
      default: false,
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
      objectProperties: {},
      showEditor: false,
      isSmallScreen: false,
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
  watch: {
    properties: {
      handler(newVal) {
        this.objectProperties = cloneDeep(newVal);
      },
      deep: true,
    },
  },
  mounted() {
    let listValues = cloneDeep(this.value);
    const hasValue = this.value?.length || (this.value && Object.keys(this.value).length);
    this.objectProperties = cloneDeep(this.properties);
    this.noListValuesOnMount = !listValues?.length;

    if (hasValue) {
      if (!this.multiValued || !Array.isArray(listValues)) {
        listValues = [listValues];
      }
      listValues.forEach((val) => {
        val.listUniqueIndex = this.getUniqueIndex();
      });
      this.listValues = listValues;
      this.showEditor = !!listValues.length;
      this.validateField();
    } else if (this.showEmptyList) {
      this.addObjectToList(-1);
    }

    // Check screen size and add resize listener
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkScreenSize);
  },
  methods: {
    /**
     * populate list of objects with new member.  Set defaults for boolean and number properties
     */
    addObjectToList(valueIndex) {
      this.showEditor = true;
      const emptyObjectWithKeys = this.createObject(this.objectProperties);
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
      const values = Object.values(this.objectProperties) || [];
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
    setFieldValidation(field) {
      const rules = field.validation || {};
      if (this.required && this.required.length && this.required.includes(field.title)) {
        rules.required = true;
      }
      return rules;
    },
    checkScreenSize() {
      this.isSmallScreen = window.innerWidth < 992;
    },
  },
};
</script>
