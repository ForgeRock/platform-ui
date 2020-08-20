<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <BFormTags
      v-model="inputValue"
      :autofocus="autofocus"
      :disabled="disabled"
      :class="[{'fr-error': errors.length > 0}, 'fr-tags']">
      <template v-slot="{ tags, inputAttrs, inputHandlers, addTag, removeTag }">
        <div @click="$refs.input.focus()">
          <label
            v-if="inputValue.length"
            class="text-secondary w-100">
            {{ fieldName }}
          </label>
          <Draggable
            v-model="inputValue"
            class="d-flex flex-wrap w-100"
            ghost-class="ghost-tag">
            <div
              class="mt-1 mr-1 fr-tag"
              v-for="tag in tags"
              :key="tag"
              body-class="py-1 pr-2 text-nowrap">
              <span class="fr-tag-text">
                {{ tag }}
              </span>
              <span @click="removeTag(tag)">
                <i
                  class="material-icons-outlined pl-2"
                  style="font-size: 10px; font-weight: 900;">
                  close
                </i>
              </span>
            </div>
          </Draggable>
        </div>
        <input
          ref="input"
          v-bind="inputAttrs"
          @blur="addTag()"
          v-on="inputHandlers"
          :placeholder="$t('common.addObject', {object: fieldName})"
          :class="[{'show': !tags.length}, 'fr-input']">
      </template>
    </BFormTags>
    <FrValidationError
      class="error-messages"
      :validator-errors="errors"
      :field-name="fieldName" />
  </div>
</template>

<script>
import {
  BFormTags,
} from 'bootstrap-vue';
import Draggable from 'vuedraggable';
import ValidationErrorList from '@forgerock/platform-shared/src/components/ValidationErrorList';

export default {
  name: 'FrTag',
  components: {
    BFormTags,
    Draggable,
    FrValidationError: ValidationErrorList,
  },
  data() {
    return {
      inputValue: this.value,
    };
  },
  props: {
    /**
     * Autofocus field.
     */
    autofocus: {
      type: Boolean,
      default: false,
    },
    /**
     * Flag to disable this field
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * List of errors related to input value
     */
    errors: {
      type: Array,
      default: () => [],
    },
    /**
     * Title of field
     */
    fieldName: {
      type: String,
      default: '',
    },
    /**
     * Binding to v-model
     */
    value: {
      type: [String, Array],
      default: '',
    },
  },
  watch: {
    inputValue(newVal) {
      this.$emit('input', newVal);
    },
    value(newVal) {
      if (!this.inputValue) {
        this.inputValue = newVal;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.fr-tags {
  display: flex;
  flex-wrap: wrap;
  line-height: 1em;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  min-height: calc(3rem + 2px);

  label,
  .input-group > label {
    margin: 1px;
    font-size: 12px;
    line-height: 1.5;
    color: $label-color;
    border: 1px solid transparent;
    border-radius: 0.25rem;
    transition: all 0.1s ease-in-out;
  }

  .fr-tag {
    border-radius: 4px;
    display: flex;
    padding: 3px 5px;
    margin: 2px 2px 5px;
    font-size: 0.85em;
    background-color: $light-blue;
    color: $gray-900;
    cursor: move;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;

    .material-icons-outlined {
      cursor: pointer;
    }
  }

  .ghost-tag {
    opacity: 0.3;
  }

  .fr-input {
    opacity: 0;
    padding: 0;
    height: 0;
    transition: all 0.15s;
    outline: 0;
    width: 100%;
    border: 0;
  }

  .fr-input:focus,
  .show {
    opacity: 1;
    height: 2rem;
    margin-top: 0.2rem;
  }

  .fr-tag-text {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
}
</style>
