<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
  <BCard no-body>
    <BCardHeader class="p-4">
      <h4>{{ $t('pages.profile.preferences.title') }}</h4>
      <p class="m-0">
        {{ $t('pages.profile.preferences.subtitle') }}
      </p>
    </BCardHeader>
    <BCardBody
      v-for="(obj, preference) in preferences"
      class="border-bottom"
      :key="preference"
      :collapsible="false"
      :panel-shown="false">
      <div class="d-inline-flex w-100">
        <h5 class="align-self-center m-0">
          {{ obj.description }}
        </h5>
        <div class="ml-auto">
          <FrField
            class="mr-4"
            :field="obj"
            :display-description="false"
            @valueChange="savePreferences(preference, $event)" />
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
import { mapState } from 'vuex';
import FrField from '@forgerock/platform-shared/src/components/Field';

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
  data() {
    return {
      preferences: {},
    };
  },
  mounted() {
    this.loadData();
  },
  computed: {
    ...mapState({
      currentPreferences: (state) => state.UserStore.preferences,
      properties: (state) => state.UserStore.schema.properties.preferences.properties,
    }),
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
