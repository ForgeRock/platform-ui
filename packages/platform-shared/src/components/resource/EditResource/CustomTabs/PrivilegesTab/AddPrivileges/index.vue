<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
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
      :excluded-names="allExcludedNames"
      @input="updateNewPrivilege"
      @remove-privilege="removeNewPrivilege" />
    <div>
      <div class="m-4 d-flex">
        <div class="form-group mb-0 mr-1 w-100">
          <FrField
            v-if="!loading"
            v-model="identityObjectField.value"
            type="select"
            :label="$t('pages.access.chooseIdentityObject')"
            :options="identityObjectField.options">
            <template
              v-for="(slotName, index) in ['singleLabel', 'option']"
              :key="index"
              #[slotName]="{ option }">
              <FrIcon
                icon-class="mr-3"
                :name="option.icon || 'settings_system_daydream'">
                {{ pluralizeValue(option.text ? (option.text) : '') }}
                <small class="text-monospace text-muted ml-1">
                  {{ option.value }}
                </small>
              </FrIcon>
            </template>
          </FrField>
        </div>
        <BButton
          variant="outline-primary"
          class="w-25 text-nowrap"
          @click="addNewPrivilege"
          id="add_new_privilege">
          <FrIcon
            icon-class="mr-2"
            name="add">
            {{ $t("common.add") }}
          </FrIcon>
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
import { pluralizeValue } from '@forgerock/platform-shared/src/utils/PluralizeUtils';
import isFraasFilter from '@forgerock/platform-shared/src/utils/fraasUtils';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import PrivilegeEditor from '../PrivilegeEditor';

export default {
  name: 'AddPrivileges',
  components: {
    FrField,
    FrIcon,
    FrPrivilegeEditor: PrivilegeEditor,
    BButton,
  },
  props: {
    existingNames: {
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
        options: this.getIdentityObjectOptions(),
        value: '',
      },
      newPrivileges: [],
    };
  },
  computed: {
    allExcludedNames() {
      const newNames = this.newPrivileges.map((privilege) => privilege.name);
      return [...newNames, ...this.existingNames];
    },
  },
  methods: {
    isFraasFilter,
    pluralizeValue,
    /**
    * Adds a new privilege to the newPrivileges array
    */
    addNewPrivilege() {
      if (this.identityObjectField.value) {
        this.newPrivileges.push({
          path: this.identityObjectField.value,
          name: pluralizeValue(this.schemaMap[this.identityObjectField.value].title),
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
    * @returns sorted identity object options for dropdown consumption
    */
    getIdentityObjectOptions() {
      let options = [];
      each(this.schemaMap, (schema, key) => {
        options.push({
          text: schema.title,
          value: key,
          icon: schema['mat-icon'],
        });
      });

      if (this.$store.state.isFraas) {
        // filter out options that don't pertain to the current realm
        options = this.isFraasFilter(options, 'value');
      }

      return sortBy(options, 'text');
    },
  },
  watch: {
    newPrivileges: {
      handler(newPrivileges) {
        this.$emit('new-privileges-modified', newPrivileges);
      },
      deep: true,
    },
  },
};
</script>
