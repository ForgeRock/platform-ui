<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard
    class="account-card"
    no-body>
    <BCardHeader class="p-4">
      <h2 class="h4">
        {{ $t('pages.profile.preferences.title') }}
      </h2>
      <p class="m-0">
        {{ $t('pages.profile.preferences.subtitle') }}
      </p>
    </BCardHeader>
    <BCardBody
      v-for="(obj, preference, index) in preferences"
      :class="{ 'border-bottom': index !== preferencesLength }"
      :key="preference"
      :collapsible="false"
      :panel-shown="false">
      <div class="d-inline-flex w-100">
        <h3 class="h5 align-self-center m-0">
          {{ getTranslation(obj.description) }}
        </h3>
        <div class="ml-auto">
          <FrField
            v-model="obj.value"
            type="boolean"
            :name="preference"
            :label="obj.description"
            :sr-only-label="true"
            @change="savePreferences(preference, $event)" />
        </div>
      </div>
    </BCardBody>
  </BCard>
</template>

<script>
import {
  cloneDeep,
  keys,
} from 'lodash';
import {
  BCard,
  BCardBody,
  BCardHeader,
} from 'bootstrap-vue';
import { mapState } from 'pinia';
import { useEnduserStore } from '@forgerock/platform-shared/src/stores/enduser';
import FrField from '@forgerock/platform-shared/src/components/Field';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';

/**
 * @description Displays available user preferences, these are typically true/false values associated with a managed resource
 * (e.g. Do you want to recieve marketing emails?).
 */
export default {
  name: 'Preferences',
  components: {
    BCard,
    BCardBody,
    BCardHeader,
    FrField,
  },
  mixins: [
    TranslationMixin,
  ],
  data() {
    return {
      preferences: {},
    };
  },
  mounted() {
    this.loadData();
  },
  computed: {
    ...mapState(useEnduserStore, {
      currentPreferences: 'preferences',
      properties: (store) => store?.managedResourceSchema?.properties?.preferences?.properties,
    }),
    preferencesLength() {
      return Object.keys(this.preferences).length - 1;
    },
  },
  methods: {
    loadData() {
      const newKeys = keys(this.currentPreferences);
      const preferences = cloneDeep(this.properties);
      newKeys.forEach((key) => {
        preferences[key].value = this.currentPreferences[key];
      });

      this.preferences = preferences;
    },
    generatePatch(preference, value) {
      return [{ operation: 'replace', field: `/preferences/${preference}`, value }];
    },
    savePreferences(preference, value) {
      this.$emit('updateProfile', this.generatePatch(preference, value));
    },
  },
};
</script>
