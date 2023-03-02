<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="pt-2">
    <div :class="{ 'border-bottom': isValidJSONString(listValues) && isValidField()}">
      <div class="d-flex justify-content-between align-items-center">
        <label>{{ capitalizedDescription }}</label>
      </div>
      <div>
        <div
          v-if="!listValues || !listValues.length"
          class="d-flex pt-3 pb-3 px-0 border-top align-items-center">
          <div class="text-muted text-left flex-grow-1">
            ({{ $t('common.none') }})
          </div>
          <button
            class="btn btn-outline-secondary mr-1 mb-2 mb-lg-0"
            @click.prevent="addObjectToList(-1)">
            <FrIcon
              name="add"
            />
          </button>
        </div>
        <template v-if="isValidJSONString(listValues) && isValidField()">
          <div
            v-for="(obj, index) in listValues"
            :key="obj.listUniqueIndex"
            class="d-flex pt-3 pb-2 px-0 border-top">
            <div class="flex-grow-1 pr-3 position-relative">
              <div class="form-row align-items-center">
                <div
                  v-for="(objValue, key) in obj"
                  :key="key"
                  class="col-lg-4 pb-2">
                  <div
                    v-if="key !== 'listUniqueIndex'"
                    class="position-relative">
                    <div v-if="properties[key].type === 'boolean'">
                      <BFormCheckbox
                        v-model="obj[key]"
                        :name="key+'_'+index">
                        {{ key }}
                      </BFormCheckbox>
                    </div>
                    <div v-else-if="properties[key].type === 'number'">
                      <FrField
                        v-model.number="obj[key]"
                        type="number"
                        validation="required|numeric"
                        :label="key"
                        :name="key+'_'+index"
                        @input="emitInput(listValues)"
                      />
                    </div>
                    <div v-else>
                      <FrField
                        v-model="obj[key]"
                        :label="key"
                        :name="key+'_'+index"
                        :type="properties[key].type"
                        :validation="required && required.length && required.includes(properties[key].title) ? 'required' : ''"
                        @input="emitInput(listValues)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div
                class="position-relative d-inline-flex justify-content-end"
                style="width: 128px;">
                <button
                  :data-testid="`list-objects-remove-${index}`"
                  class="btn btn-outline-secondary mr-1 mb-2 mb-lg-0"
                  @click.prevent="removeElementFromList(index)">
                  <FrIcon
                    name="remove"
                  />
                </button>
                <button
                  :data-testid="`list-objects-add-${index}`"
                  class="btn btn-outline-secondary mr-1 mb-2 mb-lg-0"
                  @click.prevent="addObjectToList(index)">
                  <FrIcon
                    name="add"
                  />
                </button>
              </div>
            </div>
          </div>
        </template>
        <div v-else>
          <FrInlineJsonEditor
            v-on="$listeners"
            language="json"
            :line-count="lineCount"
            :read-only="false"
            :value="advancedValue"
            @update-field="$emit('input', $event)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  cloneDeep,
} from 'lodash';
import {
  BFormCheckbox,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrInlineJsonEditor from '@forgerock/platform-shared/src/components/InlineJsonEditor';
import ListsMixin from '@forgerock/platform-shared/src/mixins/ListsMixin';

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
  },
  mixins: [
    ListsMixin,
  ],
  props: {
    description: {
      type: String,
      default: '',
    },
    properties: {
      type: Object,
      default: () => {},
    },
    label: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      default: '',
    },
    required: {
      type: Array,
      default: () => [],
    },
    value: {
      type: [Array, String],
      default: () => [],
    },
  },
  data() {
    return {
      expanded: false,
      hover: false,
      isValidJason: true,
      listValues: [],
      // eslint-disable-next-line vue/no-reserved-keys
      listUniqueIndex: 0,
    };
  },
  computed: {
    advancedValue() {
      return this.listValues.map((val) => {
        delete val.listUniqueIndex;
        return val;
      });
    },
  },
  mounted() {
    if (this.value && this.value !== '' && this.value !== null) {
      const listValues = cloneDeep(this.value);
      listValues.forEach((val) => {
        val.listUniqueIndex = this.getUniqueIndex();
      });
      this.listValues = listValues;
    }
  },
  methods: {
    /**
     * populate list of objects with new member.  Set defaults for boolean and number properties
     */
    addObjectToList(valueIndex) {
      const emptyObjectWithKeys = this.createObject(this.properties);
      this.listValues.splice(valueIndex + 1, 0, { ...emptyObjectWithKeys, listUniqueIndex: this.getUniqueIndex() });
      this.emitInput(this.listValues);
    },
    emitInput(value) {
      const emitValue = cloneDeep(value);
      emitValue.map((val) => {
        delete val.listUniqueIndex;
        return val;
      });
      if (emitValue.length === 0) {
        this.$emit('input', '');
      } else {
        this.$emit('input', emitValue);
      }
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
      this.emitInput(this.listValues);
    },
  },
};
</script>
