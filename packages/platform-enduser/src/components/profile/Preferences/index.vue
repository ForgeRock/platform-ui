<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <FrListGroup
    :title="$t('pages.profile.preferences.title')"
    :subtitle="$t('pages.profile.preferences.subtitle')">
    <FrListItem
      v-for="(obj, preference) in preferences"
      :key="preference"
      :collapsible="false"
      :panel-shown="false">
      <div
        slot="list-item-header"
        class="d-inline-flex w-100">
        <h6 class="mt-3">
          {{ obj.description }}
        </h6>

        <div class="ml-auto">
          <ToggleButton
            class="mt-2 p-0 fr-toggle-primary"
            :id="preference"
            :height="28"
            :width="56"
            :sync="true"
            :css-colors="true"
            :value="obj.value"
            @change="savePreferences(preference, $event.value)" />
        </div>
      </div>
    </FrListItem>
  </FrListGroup>
</template>

<script>
import {
  cloneDeep,
  keys,
} from 'lodash';
import { mapState } from 'vuex';
import ListGroup from '@forgerock/platform-components/src/components/listGroup/';
import ListItem from '@forgerock/platform-components/src/components/listItem/';

/**
 * @description Displays available user preferences, these are typically true/false values associated with a managed resource (e.g. Do you want to recieve marketing emails?).
 *
 */
export default {
  name: 'Preferences',
  components: {
    FrListGroup: ListGroup,
    FrListItem: ListItem,
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
        delete preferences[key].type;
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
