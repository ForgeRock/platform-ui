<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <p>
      {{ $t('governance.entitlements.chooseApplication') }}
    </p>
    <FrGovResourceSelect
      v-model="application"
      class="mb-4"
      name="Application"
      resource-path="application"
      validation="required"
      :label="$t('common.application')"
      :option-function="optionFunction"
      :query-param-function="queryParamFunction"
      :resource-function="getApplicationList"
      :set-initial-value="false"
      @selected:option="setObjectTypes">
      <template
        v-for="(slotName, index) in ['singleLabel', 'option']"
        :key="index"
        #[slotName]="{ option }">
        <BMedia
          no-body
          class="align-items-center">
          <img
            class="mr-2 size-28"
            :alt="$t('common.logo')"
            :src="getApplicationLogo(option.application)"
            :onerror="onImageError">
          <BMediaBody class="align-self-center overflow-hidden text-nowrap">
            <small class="text-dark">
              {{ option.text }}
            </small>
          </BMediaBody>
        </BMedia>
      </template>
    </FrGovResourceSelect>
    <BCollapse :visible="application.length">
      <FrField
        class="mb-4"
        name="objectType"
        open-direction="bottom"
        type="select"
        validation="required"
        :label="$t('common.objectType')"
        :options="objectTypeOptions"
        :value="objectType"
        @input="emitValue" />
    </BCollapse>
  </div>
</template>
<script setup>
import { cloneDeep } from 'lodash';
import { ref } from 'vue';
import {
  BCollapse,
  BMedia,
  BMediaBody,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import { getApplicationList } from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import { getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';

const emit = defineEmits(['input', 'selected:application']);

const application = ref('');
const objectType = ref('');
const objectTypeOptions = ref([]);

/**
 * Function to handle options for a given resource.
 * @param {Object} resource - The resource object for which options are being handled.
 */
function optionFunction(resource) {
  return {
    ...resource,
    text: resource.application?.name,
    value: resource.id,
  };
}

/**
 * Function to handle query parameters.
 * @param {Object} query - The query search term.
 */
function queryParamFunction(query) {
  const baseFilter = 'application.objectTypes.accountAttribute co ""';
  const queryFilter = query
    ? `application.name co "${query}"" and ${baseFilter}`
    : baseFilter;
  return {
    pageSize: 10,
    queryFilter,
  };
}

/**
 * Emits the selected application and object type value.
 * @param {Object} selectedObjectType - The object type that has been selected.
 */
function emitValue(selectedObjectType) {
  objectType.value = selectedObjectType;

  const value = application.value && objectType.value
    ? {
      applicationId: application.value.split('/').pop(),
      objectType: objectType.value,
    } : null;

  emit('input', value);
}

/**
 * Sets the object types based on the provided application.
 * @param {Object} selectedApplication - The selected application.
 */
function setObjectTypes(selectedApplication) {
  const allObjectTypes = cloneDeep(selectedApplication.application?.objectTypes) || [];
  objectTypeOptions.value = allObjectTypes
    .filter((x) => (x.accountAttribute))
    .map((x) => ({
      text: x.name,
      value: x.name,
    }));

  emit('selected:application', selectedApplication?.application);
  emitValue('');
}

</script>
