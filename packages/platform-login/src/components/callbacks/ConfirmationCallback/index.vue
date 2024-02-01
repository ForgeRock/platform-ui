<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    v-if="showOnlyPositiveAnswer"
    :class="[{ 'd-flex': variant === 'link' }]">
    <div :class="[{ 'btn-block mt-3': variant === 'link' },'d-flex',positionButton]">
      <BButton
        class="mt-1"
        :variant="variant"
        @click="setValue(0)"
        :aria-label="firstOption"
        :data-testid="`btn-${firstOption.toLowerCase().replace(/\s/g, '')}`">
        {{ getTranslation(firstOption) }}
      </BButton>
    </div>
  </div>
  <div
    v-else
    :class="[{ 'd-flex': variant === 'link' }]">
    <div
      v-for="(option, index) in options"
      :key="index"
      :class="[{ 'btn-block mt-3': variant === 'link' },{ 'd-flex': variant !== 'link' },positionButton]"
      :data-testid="`option-${option.toLowerCase().replace(/\s/g, '')}`">
      <BButton
        :class="[{ 'btn-block': variant === 'link' },'mt-1']"
        :variant="variant"
        @click="setValue(index)"
        :aria-label="option"
        :data-testid="`btn-${option.toLowerCase().replace(/\s/g, '')}`">
        {{ getTranslation(option) }}
      </BButton>
    </div>
  </div>
</template>

<script>
import { BButton } from 'bootstrap-vue';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';

export default {
  name: 'ConfirmationCallback',
  components: {
    BButton,
  },
  mixins: [
    TranslationMixin,
  ],
  props: {
    callback: {
      type: Object,
      required: true,
    },
    positionButton: {
      type: String,
      default: '',
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
  },
  mounted() {
    this.options = this.callback.getOptions();
    if (this.showOnlyPositiveAnswer) {
      [this.firstOption] = this.options;
    }
  },
  data() {
    return {
      options: [],
      showOnlyPositiveAnswer: this.stage?.showOnlyPositiveAnswer,
      firstOption: '',
    };
  },
  methods: {
    setValue(value) {
      this.callback.setInputValue(value);
      this.$emit('next-step');
    },
  },
};
</script>
