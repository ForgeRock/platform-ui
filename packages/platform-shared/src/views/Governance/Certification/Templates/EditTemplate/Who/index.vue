<!-- Copyright (c) 2023-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="p-4 flex-grow-1 overflow-auto h-100">
    <BContainer
      fluid
      class="mt-4">
      <h4 class="mb-4">
        {{ $t('governance.editTemplate.whoWillCertify') }}
      </h4>
      <p>
        {{ $t('governance.editTemplate.whoWillCertifyDescription') }}
      </p>
      <FrField
        v-model="formFields.certType"
        class="mb-4"
        name="certType"
        testid="cert-type"
        type="select"
        :label="$t('governance.editTemplate.certifierType')"
        :options="certOptions" />
      <FrGovResourceSelect
        v-if="formFields.certType === 'user'"
        v-model="formFields.certUser"
        :initial-data="formFields.certUserInfo"
        name="certUser"
        data-testid="cert-type-user"
        role="role-selector"
        class="mb-5"
        resource-path="user"
        @get-user-info="formFields.certUserInfo = $event" />
      <FrGovResourceSelect
        v-if="formFields.certType === 'role'"
        v-model="formFields.certRole"
        :initial-data="formFields.certRoleInfo"
        name="certRole"
        class="mb-5"
        data-testid="cert-type-role"
        resource-path="role"
        @get-role-info="handleRoleInfo" />
      <FrField
        v-if="formFields.certType === 'custom'"
        v-model="formFields.certifierPath"
        class="mb-4"
        name="certifierPath"
        type="select"
        :label="$t('governance.editTemplate.certifierPath')"
        :options="getSchemaOptions" />
      <label>{{ $t('governance.editTemplate.options') }}</label>
      <FrField
        v-model="formFields.enableDefaultCertifier"
        class="mb-4"
        name="enableDefaultCerifier"
        testid="enable-default-certifier"
        type="checkbox"
        :description="$t('governance.editTemplate.enableDefaultCertifierDescription')"
        :label="$t('governance.editTemplate.enableDefaultCertifier')" />
      <BCollapse :visible="formFields.enableDefaultCertifier">
        <FrGovResourceSelect
          v-model="formFields.defaultCertifier"
          :initial-data="formFields.defaultCertifierInfo"
          name="defaultCertifier"
          class="mb-5"
          resource-path="user"
          @get-user-info="formFields.defaultCertifierInfo = $event" />
      </BCollapse>
    </BContainer>
  </div>
</template>

<script>
import {
  BCollapse,
  BContainer,
} from 'bootstrap-vue';
import {
  cloneDeep,
  map,
  pickBy,
  startsWith,
  get,
  sortBy,
  includes,
} from 'lodash';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import {
  types,
  typeSpecificFields,
} from '../../templateTypes';

export default {
  name: 'Who',
  components: {
    BCollapse,
    BContainer,
    FrField,
    FrGovResourceSelect,
  },
  props: {
    type: {
      type: String,
      default: types.IDENTITY,
    },
    value: {
      type: Object,
      default: () => {},
    },
    grantFilterProperties: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      types,
      formFields: {
        defaultCertifier: '',
        defaultCertifierInfo: {},
        enableDefaultCertifier: false,
        certRole: '',
        certType: '',
        certUser: '',
        certUserInfo: {},
        certRoleInfo: {},
        certifierPath: '',
      },
    };
  },
  created() {
    Object.keys(this.value).forEach((field) => {
      this.formFields[field] = cloneDeep(this.value[field]);
    });
  },
  computed: {
    certOptions() {
      const optionMap = {
        user: this.$t('governance.editTemplate.user'),
        role: this.$t('governance.editTemplate.role'),
        manager: this.$t('governance.editTemplate.manager'),
        organizationAdmin: this.$t('governance.editTemplate.organizationAdmin'),
        entitlementOwner: this.$t('governance.editTemplate.entitlementOwner'),
        roleOwner: this.$t('governance.editTemplate.roleOwner'),
        custom: this.$t('governance.editTemplate.custom'),
      };

      return typeSpecificFields[this.type].certifierOptions.map((option) => ({ text: (optionMap[option]), value: option }));
    },
    getSchemaOptions() {
      const values = pickBy(this.grantFilterProperties.user, (property) => (
        ((startsWith(property.key, 'fr') && !(includes(property.key, 'Date'))) || startsWith(property.key, 'custom'))
        && property.type === 'string'
      ));
      const arr = map(values, (property) => ({ text: get(property, 'displayName', property.key), value: property.key }));
      arr.push({ text: 'id', value: 'id' });
      return sortBy(arr, 'text');
    },
  },
  methods: {
    handleRoleInfo(roleInfo) {
      if (roleInfo?.name) this.formFields.certRoleInfo = roleInfo;
    },
  },
  watch: {
    formFields: {
      deep: true,
      handler(newVal) {
        const payload = cloneDeep(newVal);
        this.$emit('input', {
          ...payload,
        });
      },
    },
  },
};
</script>
