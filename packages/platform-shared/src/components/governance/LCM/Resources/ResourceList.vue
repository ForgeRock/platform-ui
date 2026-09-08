<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer
    fluid
    :class="{ 'my-0 px-0': isEmbedded }">
    <FrHeader
      v-if="!isEmbedded"
      class="mb-4"
      :title="$t('governance.administer.resources.title')"
      :subtitle="$t('governance.administer.resources.subtitle')" />
    <FrGovResourceList
      :class="isEmbedded ? 'mb-0' : 'mb-5'"
      :is-embedded="isEmbedded"
      resource="resource"
      :additional-query-params="queryFilter"
      :custom-filter="forcedApplicationFilter"
      :columns="currentColumns"
      :query-fields="queryFields"
      :resource-function="fetchResources"
      :show-add-button="false"
      :show-errors="false">
      <template #cell(displayName)="{ item }">
        <BMedia
          class="align-items-center"
          no-body>
          <BMediaAside class="align-self-center mr-4">
            <div class="size-36 fr-app-logo-bg d-flex align-items-center justify-content-center">
              <img
                v-if="logoSource"
                class="size-24"
                :alt="$t('common.logo')"
                :src="logoSource">
              <FrIcon
                v-else
                icon-class="size-24"
                name="inventory_2" />
            </div>
          </BMediaAside>
          <BMediaBody class="align-self-center overflow-hidden text-nowrap">
            <p class="h5 mb-0">
              {{ item.displayName || item.id }}
            </p>
          </BMediaBody>
        </BMedia>
      </template>
    </FrGovResourceList>
  </BContainer>
</template>

<script setup>
import { computed } from 'vue';
import {
  BContainer,
  BMedia,
  BMediaAside,
  BMediaBody,
} from 'bootstrap-vue';
import FrGovResourceList from '@forgerock/platform-shared/src/components/governance/GovResourceList';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import { getResourceList } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import i18n from '@/i18n';

const props = defineProps({
  // When set, the list renders without the page header and is force-scoped to
  // those applications (used when embedded in an application page)
  isEmbedded: {
    type: Boolean,
    default: false,
  },
  applicationIds: {
    type: Array,
    default: null,
  },
  applicationName: {
    type: String,
    default: '',
  },
  // The hosting application's resolved logo; rows brand with it when set,
  // falling back to the generic resource icon
  logoSource: {
    type: String,
    default: '',
  },
  // Side-tab key this view is hosted under when embedded, so detail views can
  // return the breadcrumb to the originating side tab
  objectTab: {
    type: String,
    default: '',
  },
});

// No base filter currently applied — an empty string is falsy against
// GovResourceList's additionalQueryParams check, so this list shows everything
const queryFilter = '';

// Fields requested from the backend so rows carry the display data the table renders
const queryFields = ['displayName', 'objectType'];

/**
 * The resource endpoint nests each record under a `resource` key (alongside id
 * and permissions); GovResourceList renders flat rows, so lift the inner object.
 * @param {String} resource resource type (ignored — see getResourceList)
 * @param {Object} queryParams query parameters passed through to the API
 * @returns {Promise} Axios-style response with flat result rows
 */
async function fetchResources(resource, queryParams) {
  const { data } = await getResourceList(resource, queryParams);
  return {
    data: {
      ...data,
      result: (data.result || []).map((row) => ({
        id: row.id,
        permissions: row.permissions,
        ...row.resource,
      })),
    },
  };
}

/**
 * Query filter force-scoping the list to the embedding application(s).
 * Passed as customFilter to GovResourceList, which always ANDs it with any
 * user-driven search — users cannot remove or bypass it.
 * @returns {string|null} The application.id query filter, or null when standalone
 */
const forcedApplicationFilter = computed(() => (props.applicationIds?.length
  ? `(${props.applicationIds.map((id) => `application.id eq '${id}'`).join(' or ')})`
  : null));

const currentColumns = computed(() => [
  {
    key: 'displayName',
    label: i18n.global.t('common.displayName'),
  },
  {
    key: 'objectType',
    label: i18n.global.t('common.objectType'),
  },
  // No actions in the embedded view — there is no resource details route to act on yet
  ...(!props.isEmbedded ? [{
    key: 'actions',
    label: i18n.global.t('common.actions'),
    sortable: false,
    class: 'w-120px justify-content-end fr-no-resize sticky-right',
  }] : []),
]);
</script>

<style lang="scss" scoped>
:deep {
  // No resource details route exists yet — rows don't navigate, so don't show
  // the pointer affordance GovResourceList applies by default
  .tr-gov-resource-list {
    cursor: default;
  }
}
</style>
