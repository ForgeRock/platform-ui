<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrInputLayout
    :description="description"
    :id="`${internalId}___input__`"
    :class="{ 'has-prepend-btn': hasPrependBtn }"
    :errors="combinedErrors"
    :label="label"
    :name="name"
    :is-html="isHtml">
    <BFormTags
      v-model="inputValue"
      v-on="$listeners"
      add-on-change
      :autofocus="autofocus"
      :class="{'polyfill-placeholder': floatLabels}"
      :disabled="disabled"
      @focus="onTagFieldFocus()"
      :id="internalId">
      <template #default="{ tags, inputAttrs, inputHandlers, removeTag }">
        <ul
          class="overflow-hidden pl-0 mb-0"
          :id="`fr-tags-list_${internalId}`">
          <li>
            <Draggable
              v-model="inputValue"
              :disabled="disabled"
              class="d-flex flex-wrap w-100"
              ghost-class="ghost-tag"
              :item-key="((item) => inputValue.indexOf(item))">
              <template #item="{ element }">
                <div
                  body-class="py-1 pr-2 text-nowrap"
                  class="fr-tag"
                  :key="element"
                  :id="`fr-tags-tag_${element.toString().replace(/\s/g, '_')}`">
                  <span class="fr-tag-text">
                    {{ element }}
                  </span>
                  <span
                    :data-testid="`remove-${element.toString().replace(/\s/g, '-')}-tag`"
                    @click="removeTag(element)"
                    @keydown.enter="removeTag(element)">
                    <FrIcon
                      tabindex="0"
                      :aria-label="$t('common.close')"
                      :aria-controls="`fr-tags-tag_${element.toString().replace(/\s/g, '_')}`"
                      icon-class="close-icon pl-2"
                      name="close"
                    />
                  </span>
                  <BTooltip
                    :target="`fr-tags-tag_${element.toString().replace(/\s/g, '_')}`"
                    :title="element"
                    :delay="{ show: 1500, hide: 0 }"
                    triggers="hover"
                    position="top"
                  />
                </div>
              </template>
            </Draggable>
          </li>
        </ul>
        <input
          v-bind="inputAttrs"
          v-on="{...inputHandlers, ...validationListeners}"
          ref="input"
          :data-testid="`inp-${name}`"
          :class="[{'has-values': tags.length}, 'fr-tag-input']"
          :placeholder="label"
          @blur="onBlur($event)"
          @input="inputValueHandler(inputValue, $event.target.value)"
          :aria-describedby="`fr-tags-list_${internalId}`">
      </template>
    </BFormTags>
    <template
      v-for="(key, slotName) in $slots"
      #[slotName]="slotData">
      <slot
        :name="slotName"
        v-bind="slotData" />
    </template>
  </FrInputLayout>
</template>

<script>
import { cloneDeep, isEqual } from 'lodash';
import { BFormTags, BTooltip } from 'bootstrap-vue';
import { useField } from 'vee-validate';
import uuid from 'uuid/v4';
import Draggable from 'vuedraggable';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { toRef } from 'vue';
import FrInputLayout from '../Wrapper/InputLayout';
import InputMixin from '../Wrapper/InputMixin';

Draggable.compatConfig = { MODE: 3 };

export default {
  name: 'Tag',
  mixins: [
    InputMixin,
  ],
  components: {
    BFormTags,
    Draggable,
    FrInputLayout,
    FrIcon,
    BTooltip,
  },
  setup(props) {
    const {
      value: inputValue, errors: fieldErrors, handleBlur,
    } = useField(() => `${props.name}-id-${uuid()}`, toRef(props, 'validation'), { validateOnMount: props.validationImmediate, initialValue: [], bails: false });

    // validationListeners: Contains custom event listeners for validation.
    // Since vee-validate +4 removes the interaction modes, this custom listener is added
    // to validate on blur to perform a similar aggressive validation in addition to the validateOnValueUpdate.
    const validationListeners = {
      blur: (evt) => handleBlur(evt, true),
    };

    return { inputValue, fieldErrors, validationListeners };
  },
  data() {
    return {
      oldValue: [],
      hasPrependBtn: Object.keys(this.$slots).includes('prependButton'),
    };
  },
  computed: {
    combinedErrors() {
      return this.errors.concat(this.fieldErrors);
    },
  },
  methods: {
    /**
     * Toggles floating label state depending on input values
     * @param inputValue The current input value
     * @param toggle Whether there was a value added
     */
    inputValueHandler(inputValue, toggle) {
      this.floatLabels = (toggle || inputValue.toString().length > 0) && !!this.label;
    },
    /**
    * onBlur event handler
    */
    onBlur() {
      if (this.floatingLabel && this.label) {
        this.floatLabels = this.inputValue?.toString().length > 0;
      }
    },
    /**
     * Sets the floatLabels to true when the tag field is focused
     */
    onTagFieldFocus() {
      if (this.floatingLabel && this.label) {
        this.floatLabels = true;
      }
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
.form-label-group:not(.fr-field-error) {
  .form-control {
    &:focus-within {
      border-color: $primary;
      -webkit-box-shadow: 0 0 0 0.0625rem $primary;
      box-shadow: 0 0 0 0.0625rem $primary;
    }
  }
}
.form-label-group.fr-field-error {
  .form-control {
    &:focus-within {
      border-color: $danger !important;
      -webkit-box-shadow: 0 0 0 0.0625rem $danger !important;
      box-shadow: 0 0 0 0.0625rem $danger !important;
    }
  }
}

.b-form-tags {
  display: flex;
  flex-wrap: wrap;
  line-height: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  min-height: calc(3rem + 2px);
  border-radius: $border-radius !important;

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

    :deep(.close-icon) {
      cursor: pointer;
      font-size: 12px;
      font-weight: 900;
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
  }

  .close-icon {
    &:focus-visible {
      outline: solid 2px $primary;
      outline-offset: -1px;
      -webkit-transition: none;
      transition: none;
    }
  }
}

.has-prepend-btn .b-form-tags {
  padding-right: 56px;
}

:deep(.within-input-button) {
  position: absolute;
  right: 0;
}

:deep(.within-input-button .btn) {
  border: none !important;
  background: transparent !important;
}
</style>
