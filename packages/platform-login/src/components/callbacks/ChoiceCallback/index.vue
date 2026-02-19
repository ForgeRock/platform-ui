<!-- Copyright (c) 2020-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BFormGroup
      v-if="isRadioDisplay"
      class="text-left"
      :label="selectedLabel">
      <BFormRadioGroup
        v-model="selected.value"
        :options="selected.options"
        :autofocus="autofocus"
        :aria-label="selectedLabel"
        text-field="text"
        :stacked="displayType === 'radio'"
        @input="callback.setInputValue($event)" />
    </BFormGroup>
    <BFormGroup
      v-else-if="isButtonDisplay"
      class="text-center"
      :label="selectedLabel">
      <div
        role="group"
        :aria-label="selectedLabel"
        :class="setContainerClasses">
        <BButton
          v-for="(option) in selected.options"
          :variant="variant"
          :class="setButtonClasses"
          :key="option.value"
          :pressed="selected.value === option.value"
          :aria-label="`${option.text} ${selected.value === option.value ? '(selected)' : ''}`"
          @click="selected.value = option.value; callback.setInputValue(option.value)">
          {{ option.text }}
        </BButton>
      </div>
    </BFormGroup>
    <FrField
      v-else
      v-model="selected.value"
      type="select"
      :autofocus="autofocus"
      :floating-label="floatingLabel"
      :label="selected.label"
      :name="selected.name"
      :options="selected.options"
      show-hover-title
      @input="callback.setInputValue($event)" />
  </div>
</template>

<script>
import {
  BFormGroup,
  BFormRadioGroup,
  BButton,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';

export default {
  name: 'ChoiceCallback',
  components: {
    FrField,
    BButton,
    BFormGroup,
    BFormRadioGroup,
  },
  mixins: [
    TranslationMixin,
  ],
  props: {
    autofocus: {
      type: Boolean,
      default: false,
    },
    callback: {
      type: Object,
      required: true,
    },
    floatingLabel: {
      type: Boolean,
      default: true,
    },
    index: {
      type: Number,
      default: 0,
    },
    /**
     * Stage info
     */
    stage: {
      type: Object,
      default: null,
    },
    variant: {
      type: String,
      default: 'primary',
    },
    positionButton: {
      type: String,
      default: '',
    },
  },
  data() {
    const choices = this.getTranslation(this.callback.getChoices());
    const options = choices.map((item, itemIndex) => ({
      text: item,
      value: itemIndex,
    }));
    return {
      displayType: this.stage?.displayType ? this.stage.displayType : 'select',
      selected: {
        name: `callback_${this.index}`,
        label: this.callback.getPrompt(),
        value: this.callback.getDefaultChoice(),
        options,
      },
    };
  },
  computed: {
    isButtonDisplay() {
      return ['verticalButtons', 'horizontalButtons'].includes(this.displayType);
    },
    isRadioDisplay() {
      return ['radio', 'horizontalRadio'].includes(this.displayType);
    },
    selectedLabel() {
      return this.getTranslation(this.selected.label);
    },
    setContainerClasses() {
      let classes = 'd-flex';
      if (this.displayType === 'verticalButtons') {
        classes += ' flex-column';
        if (this.positionButton === 'justify-content-center') {
          classes += ' align-items-center';
        } else if (this.positionButton === 'justify-content-start') {
          classes += ' align-items-start';
        } else if (this.positionButton === 'justify-content-end') {
          classes += ' align-items-end';
        }
      } else if (this.displayType === 'horizontalButtons') {
        classes += ' flex-wrap btn-gap';
        if (this.positionButton !== 'flex-column') {
          classes += ` ${this.positionButton}`;
        } else {
          classes += ' flex-grow-1';
        }
      }
      return classes;
    },
    setButtonClasses() {
      let classes = 'mw-100';
      if (this.variant === 'link') {
        classes += ' btn-block';
      }
      if (this.displayType === 'verticalButtons') {
        classes += ' mt-1';
      }
      if (this.displayType === 'horizontalButtons') {
        if (this.positionButton === 'flex-column') {
          classes += ' flex-grow-1';
        }
      }
      return classes;
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.form-label-group-input) {
  label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }
}

.btn-gap {
  gap: 0.5rem;
}
</style>
