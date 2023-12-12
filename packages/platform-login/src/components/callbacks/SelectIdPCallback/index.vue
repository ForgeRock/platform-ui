<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div v-if="providers">
    <input
      type="hidden"
      :name="name"
      :ref="name"
      :value="value">
    <button
      class="btn btn-light btn-block fr-btn-social"
      type="button"
      ref="button"
      v-for="(provider, count) in filteredProviders"
      :key="count"
      :style="socialButtonStyles[count]"
      @click="setValue(provider.provider)"
      @mouseover="hover(count, provider.uiConfig.buttonCustomStyleHover)"
      @mouseout="hover(count, provider.uiConfig.buttonCustomStyle)">
      <div>
        <img
          v-if="provider.uiConfig.providerKey"
          :src="require(`@forgerock/platform-shared/src/assets/images/${provider.uiConfig.providerKey}-logo.svg`)">
        <img
          v-else-if="provider.uiConfig.buttonImage"
          :src="provider.uiConfig.buttonImage"
          alt="">
        <span class="ml-1">
          {{ $t('login.social.signInWith', {buttonDisplayName: provider.uiConfig.buttonDisplayName}) }}
        </span>
      </div>
    </button>

    <FrHorizontalRule
      v-if="!isOnlyCallback"
      class="my-3"
      :insert="$t('login.social.or')" />
  </div>
</template>

<script>
import {
  delay,
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
    autofocus: {
      type: Boolean,
      default: false,
    },
    callback: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      default: 0,
    },
    isOnlyCallback: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      name: '',
      value: 'localAuthentication',
      providers: [],
      socialButtonStyles: [],
    };
  },
  mounted() {
    // Browser consistent focus (targets the first button of the IDP list)
    if (this.autofocus) {
      delay(() => {
        if (this.$refs.button) {
          this.$refs.button[0].focus({ focusVisible: true });
        }
      }, 600);
    }
    // if a user does not click a social provider, the input value should be localAuthentication
    this.callback.setInputValue('localAuthentication');
    this.providers = this.callback.getOutputByName('providers');

    // pausing briefly here so the login button is on the dom
    this.$nextTick(
      this.loadIDPs,
    );
  },
  computed: {
    filteredProviders() {
      return filter(this.providers, (provider) => provider.uiConfig);
    },
  },
  methods: {
    loadIDPs() {
      this.name = `callback_${this.index}`;

      each(this.filteredProviders, (provider, index) => {
        this.$set(this.socialButtonStyles, index, provider.uiConfig.buttonCustomStyle);
      });

      if (this.isOnlyCallback) {
        this.$emit('hide-next-button', true);
      }
    },
    hover(index, style) {
      this.$set(this.socialButtonStyles, index, style);
    },
    setValue(provider) {
      this.value = provider;
      this.callback.setInputValue(this.value);
      this.$emit('next-step');
    },
  },
};
</script>

<style type="scss" scoped>
  .fr-btn-social img {
    max-width: 21px;
    margin-right: 5px;
  }
</style>
