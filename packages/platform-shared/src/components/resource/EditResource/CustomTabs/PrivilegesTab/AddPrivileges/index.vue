<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <div class="text-muted m-4">
      {{ $t('pages.access.addPrivilegesDescription') }}
    </div>
    <FrPrivilegeEditor
      v-for="(privilege, index) in newPrivileges"
      :key="index"
      :privilege="privilege"
      :identity-object-schema="schemaMap[privilege.path]"
      :show-delete="true"
      :show-header="index === 0"
      :index="index"
      @input="updateNewPrivilege"
      @remove-privilege="removeNewPrivilege" />
    <div>
      <div class="m-4 d-flex">
        <div class="form-group mb-0 mr-1 w-100">
          <FrField
            v-if="!loading"
            :field="identityObjectField">
            <template v-slot:option="{ option }">
              <i class="material-icons-outlined mr-3">
                {{ option.icon || 'settings_system_daydream' }}
              </i>
              {{ (option.text ? (option.text) : '') | PluralizeFilter }}
              <small class="text-monospace text-muted ml-1">
                {{ option.value }}
              </small>
            </template>
            <template v-slot:singleLabel="{ option }">
              <i class="material-icons-outlined mr-3">
                {{ option.icon || 'settings_system_daydream' }}
              </i>
              {{ (option.text ? (option.text) : '') | PluralizeFilter }}
              <small class="text-monospace text-muted ml-1">
                {{ option.value }}
              </small>
            </template>
          </FrField>
        </div>
        <BButton
          variant="outline-primary"
          class="w-25"
          @click="addNewPrivilege"
          id="add_new_privilege">
          <i class="material-icons mr-2">
            add
          </i>{{ $t("common.add") }}
        </BButton>
      </div>
    </div>
  </div>
</template>

<script>
import {
  each,
  sortBy,
} from 'lodash';
import {
  BButton,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
// eslint-disable-next-line import/no-extraneous-dependencies
import PluralizeFilter from '@forgerock/platform-shared/src/filters/PluralizeFilter';
import PrivilegeEditor from '../PrivilegeEditor';

export default {
  name: 'AddPrivileges',
  components: {
    FrField,
    FrPrivilegeEditor: PrivilegeEditor,
    BButton,
  },
  filters: {
    PluralizeFilter,
  },
  props: {
    newPrivileges: {
      type: Array,
      default: () => [],
    },
    privilegesField: {
      type: Object,
      default: () => {},
    },
    loading: {
      type: Boolean,
      default: true,
    },
    schemaMap: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      identityObjectField: {
        title: this.$t('pages.access.chooseIdentityObject'),
        type: 'select',
        options: this.getIdentityObjectOptions(),
        value: '',
      },
    };
  },
  methods: {
    /**
    * Adds a new privilege to the newPrivileges array
    */
    addNewPrivilege() {
      if (this.identityObjectField.value) {
        this.newPrivileges.push({
          path: this.identityObjectField.value,
          name: this.$options.filters.PluralizeFilter(this.schemaMap[this.identityObjectField.value].title),
          actions: [],
          filter: '',
          permissions: ['VIEW'],
          accessFlags: [],
        });
        // empty the dropdown
        this.identityObjectField.value = '';
        // remove the identityObject from the list of options by resetting the options
        this.identityObjectField.options = this.getIdentityObjectOptions();
      }
    },
    /**
    * Removes a new privilege from the newPrivileges array
    *
    * @property {string} index - newPrivilege array index
    */
    removeNewPrivilege(index) {
      this.newPrivileges.splice(index, 1);
      this.identityObjectField.options = this.getIdentityObjectOptions();
    },
    /**
    * Updates the value of a specific privilege in the newPrivileges array
    *
    * @property {object} newVal - new privilege object
    * @property {number} index - newPrivilege array index
    */
    updateNewPrivilege(newVal, index) {
      this.newPrivileges[index] = newVal;
    },
    /**
    * Reads all the identityObject schemas and sets dropdown options for available identityObjects
    */
    getIdentityObjectOptions() {
      const options = [];
      each(this.schemaMap, (schema, key) => {
        options.push({
          text: schema.title,
          value: key,
          icon: schema['mat-icon'],
        });
      });
      return sortBy(options, 'text');
    },
  },
};
</script>
