<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrInputLayout
    :description="description"
    :id="`${id}___input__`"
    :errors="errors"
    :label="label"
    :name="name"
    :validation="validation"
    :validation-immediate="validationImmediate">
    <BFormTags
      v-model="inputValue"
      v-on="$listeners"
      add-on-change
      :autofocus="autofocus"
      :class="{'polyfill-placeholder': floatLabels}"
      :disabled="disabled"
      :id="id">
      <template v-slot="{ tags, inputAttrs, inputHandlers, removeTag }">
        <div
          class="overflow-hidden"
          @click="$refs.input.focus()">
          <Draggable
            v-model="inputValue"
            class="d-flex flex-wrap w-100"
            ghost-class="ghost-tag">
            <div
              v-for="tag in tags"
              body-class="py-1 pr-2 text-nowrap"
              class="fr-tag"
              :key="tag">
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
          v-bind="inputAttrs"
          v-on="inputHandlers"
          ref="input"
          :class="[{'has-values': tags.length}, 'fr-tag-input']"
          :placeholder="label"
          @input="inputValueHandler(inputValue, $event.target.value)">
      </template>
    </BFormTags>
  </FrInputLayout>
</template>

<script>
import { cloneDeep, isEqual } from 'lodash';
import { BFormTags } from 'bootstrap-vue';
import Draggable from 'vuedraggable';
import FrInputLayout from '../Wrapper/InputLayout';
import InputMixin from '../Wrapper/InputMixin';

export default {
  name: 'Tag',
  mixins: [
    InputMixin,
  ],
  components: {
    BFormTags,
    Draggable,
    FrInputLayout,
  },
  data() {
    return {
      inputValue: [],
      oldValue: [],
    };
  },
  methods: {
    inputValueHandler(inputValue, toggle) {
      this.floatLabels = (toggle || inputValue.toString().length > 0) && !!this.label;
    },
    /**
    * Default setInputValue method. Overrides possible in components
    *
    * @param {Array|Object|Number|String} newVal value to be set for internal model
    */
    setInputValue(newVal) {
      if (newVal !== undefined && newVal !== null) {
        if (!isEqual(this.oldValue, newVal)) {
          if (newVal === '') {
            this.inputValue = [];
          } else {
            this.inputValue = newVal;
          }
          this.oldValue = cloneDeep(newVal);
        }
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.b-form-tags {
  display: flex;
  flex-wrap: wrap;
  line-height: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
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
    padding: 2px 5px 0 10px;
    margin: 0.25rem 0.5rem 0.25rem 0;
    font-size: 0.8125rem;
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

  .fr-tag-input {
    opacity: 0;
    padding: 0;
    height: 0;
    outline: 0;
    width: 100%;
    border: 0;

    &.has-values {
      transition: all 0.15s;
    }
  }

  .fr-tag-input:focus,
  .polyfill-placeholder {
    opacity: 1;
    height: 1.85rem;
  }

  .fr-tag-text {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;

    &:hover {
      overflow: auto;
    }
  }
}
</style>
