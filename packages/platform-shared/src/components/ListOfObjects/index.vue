<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div class="pt-2">
    <div :class="{ 'border-bottom': isValidJSONString(field.value) && isValidField(field.items)}">
      <div class="d-flex justify-content-between align-items-center">
        <label>{{ description }}</label>
      </div>
      <div>
        <div
          v-if="!field.value || field.value === ''"
          class="d-flex pt-3 pb-3 px-0 border-top align-items-center">
          <div class="text-muted text-left flex-grow-1">
            ({{ $t('common.none') }})
          </div>
          <button
            class="btn btn-outline-secondary mr-1 mb-2 mb-lg-0"
            @click.prevent="$emit('add-object', 0)">
            <i class="material-icons-outlined">
              add
            </i>
          </button>
        </div>
        <div
          v-else-if="isValidJSONString(field.value) && isValidField(field.items)"
          v-for="(obj, ndx) in field.value"
          :key="ndx"
          class="d-flex pt-3 pb-2 px-0 border-top">
          <div class="flex-grow-1 pr-3 position-relative">
            <div class="form-row align-items-center">
              <div
                v-for="(value, key) in obj"
                :key="key"
                class="col-lg-4 pb-2">
                <div class="position-relative">
                  <div v-if="field.items.properties[key].type === 'boolean'">
                    <BFormCheckbox
                      v-model="obj[key]"
                      :name="key">
                      {{ key }}
                    </BFormCheckbox>
                  </div>
                  <div v-else-if="field.items.properties[key].type === 'number'">
                    <FrField
                      v-model.number="obj[key]"
                      :field="{
                        type: 'integer',
                        title: key,
                        value: value,
                        validation: 'required|numeric',
                      }"
                    />
                  </div>
                  <div v-else>
                    <FrField
                      v-model="obj[key]"
                      :field="{
                        type: field.items.properties[key].type,
                        title: key,
                        value: value,
                        validation: field.required && field.required.length && field.required.includes(field.items.properties[key].title) ? 'required' : ''
                      }"
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
                class="btn btn-outline-secondary mr-1 mb-2 mb-lg-0"
                @click.prevent="$emit('remove-element', ndx)">
                <i class="material-icons-outlined">
                  remove
                </i>
              </button>
              <button
                class="btn btn-outline-secondary mr-1 mb-2 mb-lg-0"
                @click.prevent="$emit('add-object', ndx)">
                <i class="material-icons-outlined">
                  add
                </i>
              </button>
            </div>
          </div>
        </div>
        <div v-else>
          <FrInlineJsonEditor
            language="json"
            :value="field.value"
            :read-only="false"
            :line-count="lineCount"
            @update-field="field.value = [$event]"
            v-on="$listeners" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  BFormCheckbox,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
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
    FrInlineJsonEditor,
  },
  mixins: [
    ListsMixin,
  ],
  props: {
    /**
     * field schema for constructing list of Obects component
     */
    field: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      hover: false,
      expanded: false,
      isValidJason: true,
    };
  },
  methods: {
    /**
     * determine whether any properties of an object in the array
     * are too complex to render (i.e. objects with sub object or array properties)
     */
    isValidField(items) {
      const values = Object.values(items.properties) || [];
      const results = [];

      values.forEach((val) => {
        if (val.type && (val.type === 'array' || val.type === 'object')) {
          results.push(false);
        }
        results.push(true);
      });

      return !results.includes(false);
    },
  },
};
</script>
