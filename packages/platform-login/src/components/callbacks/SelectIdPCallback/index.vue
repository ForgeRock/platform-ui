<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div v-if="providers">
    <input
      type="hidden"
      :name="name"
      :ref="name"
      :value="value">
    <button
      class="btn btn-lg btn-light btn-block fr-btn-social"
      type="button"
      v-for="(provider, count) in filteredProviders"
      :key="count"
      :style="socialButtonStyles[count]"
      @click="setValue(provider.provider)"
      @mouseover="hover(count, provider.uiConfig.buttonCustomStyleHover)"
      @mouseout="hover(count, provider.uiConfig.buttonCustomStyle)">
      <img
        v-if="provider.uiConfig.buttonImage"
        :src="provider.uiConfig.buttonImage">
      <!-- TODO No material icons for providers, need alternative or always have image for all icons -->
      <span class="ml-1">
        {{ continueWithText }} {{ provider.uiConfig.buttonDisplayName }}
      </span>
    </button>

    <FrHorizontalRule
      v-if="! standaloneMode"
      :insert="orText" />
  </div>
</template>

<script>
import {
  each,
  filter,
} from 'lodash';
import HorizontalRule from '@/components/utils/HorizontalRule';

export default {
  name: 'SelectIdPCallback',
  components: {
    FrHorizontalRule: HorizontalRule,
  },
  props: {
    callback: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      default: 0,
    },
    continueWithText: {
      type: String,
      default: '',
    },
    orText: {
      type: String,
      default: '',
    },
    callbackSubmitButton: {
      type: HTMLButtonElement,
      required: true,
    },

  },
  mounted() {
    this.providers = this.callback.getOutputByName('providers');

    // pausing briefly here so the login button is on the dom
    setTimeout(this.loadIDPs, 10);
  },
  computed: {
    filteredProviders() {
      return filter(this.providers, (provider) => provider.uiConfig);
    },
  },
  data() {
    return {
      name: '',
      value: 'localAuthentication',
      providers: [],
      socialButtonStyles: [],
      standaloneMode: false,
    };
  },
  methods: {
    loadIDPs() {
      this.name = `callback_${this.index}`;

      each(this.filteredProviders, (provider, index) => {
        this.$set(this.socialButtonStyles, index, provider.uiConfig.buttonCustomStyle);
      });

      /*
						If callback_index is zero and the "name" attribute on callbackSubmitButton is callback_1 we
						know SelectIdPCallback is by itself on the page. In this case we will hide callbackSubmitButton
						and click it to submit the form automatically when one of the social buttons is pressed.
				*/
      this.standaloneMode = this.index === 0 && this.callbackSubmitButton && this.callbackSubmitButton.name === 'callback_1';

      if (this.standaloneMode) {
        this.callbackSubmitButton.style.display = 'none';
      }
    },
    hover(index, style) {
      this.$set(this.socialButtonStyles, index, style);
    },
    setValue(provider) {
      this.value = provider;
      this.callback.setInputValue(this.value);
      // brief pause here to wait for this.value to propagate to this callback's
      // hidden input element before submitting the login form
      setTimeout(() => {
        this.callbackSubmitButton.disabled = false;
        this.callbackSubmitButton.click();
      }, 10);
    },
  },
};
</script>

<style type="scss" scoped>
  .fr-btn-social img{
    max-width: 21px;
    margin-right: 5px;
  }
</style>
