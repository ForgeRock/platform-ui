<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div class="pt-2">
    <BCardBody>
      <div :class="{ 'border-bottom': isValidJSONString(field.value) && isValidField(field.items)}">
        <div class="d-flex justify-content-between align-items-center">
          <label>{{ description }}</label>
        </div>
        <div>
          <div
            v-if="field.value.length == 0"
            class="d-flex pt-3 pb-3 px-0 border-top align-items-center">
            <div class="text-muted text-left flex-grow-1">
              ({{ $t('common.none') }})
            </div>
            <button
              class="btn btn-outline-secondary mr-1 mb-2 mb-lg-0"
              @click.prevent="$emit('add-list', 0)">
              <i class="material-icons-outlined">
                add
              </i>
            </button>
          </div>
          <div
            v-else-if="isValidJSONString(field.value) && isValidField(field.items)"
            v-for="(list, index) in field.value"
            :key="index"
            class="d-flex pt-3 pb-2 px-0 border-top">
            <div class="flex-grow-1 pr-3 position-relative">
              <div class="form-row align-items-center">
                <div class="col-lg-12 pb-2">
                  <div>
                    <div class="position-relative">
                      <FrField
                        v-model="field.value[index]"
                        :field="{
                          type: 'tag',
                          value: list
                        }"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div class="list-button-container position-relative d-inline-flex justify-content-end">
                <button
                  type="button"
                  class="btn btn-outline-secondary mr-1 mb-2 mb-lg-0"
                  @click.prevent="$emit('remove-element', index)">
                  <i class="material-icons-outlined">
                    remove
                  </i>
                </button>
                <button
                  type="button"
                  class="btn btn-outline-secondary mr-1 mb-2 mb-lg-0"
                  @click.prevent="$emit('add-list', index)">
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
              @update-field="field.value = $event"
              v-on="$listeners" />
          </div>
        </div>
      </div>
    </BCardBody>
  </div>
</template>

<script>
import {
  forEach,
} from 'lodash';
import {
  BCardBody,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrInlineJsonEditor from '@forgerock/platform-shared/src/components/InlineJsonEditor';
import ListsMixin from '@forgerock/platform-shared/src/mixins/ListsMixin';

/**
 * @description Component that provides support for list of lists
 *
 * Attempts to render list of lists. If the depth of the array exceeds two levels
 * or is the array is not valid JSON, displays array in code editor
 */
export default {
  name: 'ListOfLists',
  components: {
    BCardBody,
    FrField,
    FrInlineJsonEditor,
  },
  mixins: [
    ListsMixin,
  ],
  props: {
    /**
     * field schema for constructing list of lists component
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
    };
  },
  methods: {
    /**
     * determine whether the array is too complex to render
     */
    isValidField(schema) {
      const results = [];

      forEach(schema.items, (val, key) => {
        if (key === 'type' && (val === 'array' || val === 'object')) {
          results.push(false);
        }
        results.push(true);
      });

      return !results.includes(false);
    },
    /**
     * determine how many levels deep an array nests
     */
    getArrayDepth(arr) {
      let complexity = 0;
      let depth = 0;

      if (Array.isArray(arr)) {
        depth = 1 + Math.max(...arr.map((elem) => this.getArrayDepth(elem)));
        arr.forEach((elem) => {
          if (typeof elem === 'object' && elem !== null && !Array.isArray(elem)) {
            complexity += 1;
          }
        });
      }
      return depth + complexity;
    },
  },
};
</script>
<style lang="scss" scoped>
.list-button-container {
  width: 128px;
}
</style>
