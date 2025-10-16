<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer
    fluid>
    <BRow class="mt-5 pb-4 pb-lg-0 align-items-center">
      <BCol lg="8">
        <FrHeader
          :title="$t('pageTitles.Roles')"
          :subtitle="$t('governance.administer.roles.subtitle')" />
      </BCol>
    </BRow>
    <BCard
      no-body
      class="mb-4 p-0"
      body-class="p-3">
      <FrSpinner
        v-if="isLoading"
        class="py-5" />
      <div v-else>
        <BButtonToolbar class="p-3 border-bottom-0">
          <BButton
            v-if="showAddButton"
            class="ml-2 mr-2"
            variant="primary"
            @click="navigateToRoleDetails()">
            <FrIcon
              icon-class="mr-2"
              name="add">
              {{ $t('common.newObject', { object: 'role' }) }}
            </FrIcon>
          </BButton>
          <FrActionsMenu
            variant="link"
            :selected-item-index="selectedStatusIndex"
            toggle-class="text-dark px-0 d-flex">
            <template #button-content>
              <div class="p-0 toolbar-link-text">
                <span class="font-weight-bold mr-1">
                  {{ `${$t('common.status')}:` }}
                </span>
                {{ $t(`common.${roleStatus}`) }}
              </div>
            </template>
            <template #default>
              <BDropdownItem
                v-for="status in statusOptions"
                :active="status === roleStatus"
                @click="handleStatusChange(status)"
                :key="status">
                {{ $t(`common.${status}`) }}
              </BDropdownItem>
            </template>
          </FrActionsMenu>
          <FrSearchInput
            v-model="searchValue"
            class="ml-auto"
            @clear="search('')"
            @search="search(searchValue)" />
        </BButtonToolbar>
        <FrNoData
          v-if="items.length === 0"
          class="border-0 shadow-none"
          icon="assignment_ind"
          body-class="mb-5"
          :title="$t('governance.access.noRecordFound', { grantType: 'roles' })"
          :subtitle="$t('governance.access.noResultsRole', { grantType: 'role' })" />
        <BTable
          v-else
          :ref="(el) => grid = el"
          v-resizable-table="{ persistKey: 'gov-resource-managed/alpha_role', showColumnResizer: true }"
          v-model:sort-by="sortBy"
          v-model:sort-desc="sortDesc"
          :busy="isLoading"
          table-class="mb-0 cursor-pointer"
          tbody-tr-class="fit-content tr-gov-resource-list text-break"
          details-td-class="fit-content"
          :fields="roleColumns"
          :items="items"
          no-local-sorting
          no-sort-reset
          hover
          responsive
          @row-clicked="navigateToRoleDetails"
          @sort-changed="sortChanged">
          <template #cell(name)="{ item }">
            <div class="h5">{{ item?.name || blankValueIndicator }}</div>
          </template>
          <template #cell(description)="{ item }">
            {{ item?.description || blankValueIndicator }}
          </template>
          <template #cell(actions)="{ item }">
            <FrActionsCell
              :divider="false"
              @edit-clicked="navigateToRoleDetails(item)"
              @delete-clicked="showDeleteModal([item])">
              <template #custom-top-actions>
                <BDropdownItem
                  v-if="roleStatus === 'draft'"
                  @click="publishRole(item)">
                  <FrIcon
                    icon-class="mr-2"
                    name="publish">
                    {{ $t('common.publish') }}
                  </FrIcon>
                </BDropdownitem>
              </template>
            </FrActionsCell>
          </template>
        </BTable>
      </div>
      <br>
      <br>
      <BModal
        id="deleteRolesModal"
        :ref="(e) => deleteRolesModal = e"
        no-close-on-backdrop
        no-close-on-esc
        :title="$t('pages.access.removeModalTitle')"
        cancel-variant="outline-secondary"
        ok-variant="danger"
        :ok-title="$t('common.remove')"
        @close="hideDeleteModal"
        @ok="deleteRoles">
        <div>
          {{ $t('pages.access.removeConfirm', { type: $t('common.roles') }) }}
        </div>
      </BModal>
    </BCard>
    <FrRequestSubmitSuccessModal
      :request-id="requestId"
      router-path="AdministerRoles"
      :success-text="i18n.global.t('governance.administer.roles.successPublish')" />
  </BContainer>
</template>

<script setup>
/**
 * Displays the list of roles with recommendations.
 * @component AdministerRoles
 * @prop {Boolean} isLoading - Determines if the information is loading
 * @prop {Array} roles - All roles with recommendations
 */
import {
  BButton,
  BButtonToolbar,
  BCard,
  BDropdownItem,
  BTable,
  BModal,
} from 'bootstrap-vue';
import {
  ref,
  watch,
  computed,
  onMounted,
} from 'vue';
import { useRouter } from 'vue-router';
import { find, map } from 'lodash';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getRoleList } from '@forgerock/platform-shared/src/api/governance/RoleApi';
import { requestAction, submitCustomRequest } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import { getPrivileges } from '@forgerock/platform-shared/src/api/governance/PermissionsApi';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import FrActionsMenu from '@forgerock/platform-shared/src/components/ActionsMenu/ActionsMenu';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrRequestSubmitSuccessModal from '@/views/governance/LCM/RequestSubmitSuccessModal';
import i18n from '@/i18n';

// composables
const router = useRouter();
const { bvModal } = useBvModal();
const { userId } = useUserStore();

const prop = defineProps({
  roles: {
    type: Array,
    default: () => [],
  },
  listName: {
    type: String,
    default: '',
  },
  autoIdSettings: {
    type: Object,
    default: () => ({}),
  },
  showColumnResizer: {
    type: Boolean,
    default: false,
  },
});

const items = ref([]);
const isLoading = ref(false);
const roleStatus = ref('active');
const isMounted = ref(false);
const deleteRoleIds = ref(null);
const deleteRolesModal = ref(null);
const grid = ref(null);
const queriedRoles = ref([]);
const queryFields = ['role.name', 'role.description'];
const searchValue = ref('');
const statusOptions = ref(['active', 'draft']);
const selectedStatusIndex = computed(() => statusOptions.value.indexOf(roleStatus.value));
const showAddButton = ref(false);
const showDeleteButton = ref(false);
const requestId = ref('');
const roleColumns = [
  {
    key: 'name',
    label: i18n.global.t('common.name'),
    initialSort: true,
    sortable: true,
    sortKey: 'name',
  },
  {
    key: 'description',
    label: i18n.global.t('common.description'),
  },
  {
    key: 'actions',
    label: '',
  },
];

/**
 * Set which role permissions the user has.
 */
async function getPermissions() {
  const { data: privilegesData } = await getPrivileges(userId);
  if (privilegesData.permissions.includes('createRole')) showAddButton.value = true;
  if (privilegesData.permissions.includes('deleteRole')) showDeleteButton.value = true;
}

/**
 * Query the provided resource.
 * * @param {string} resource - The type of resource to query for.
 */
async function queryRoles(resource = 'role') {
  isLoading.value = true;
  const searchParams = {
    pageSize: 10,
    roleStatus: roleStatus.value,
    sortBy: roleStatus.value === 'active' ? 'role.name' : 'name',
  };
  if (searchValue.value) {
    searchParams.queryFilter = queryFields.map((field) => `${field} co "${searchValue.value}"`).join(' or ');
  }
  const { data } = await getRoleList(resource, searchParams);
  queriedRoles.value = data.result;
  items.value = map(data.result, (item) => ({
    ...item.role,
    status: roleStatus.value,
  }));
  await getPermissions();
  isLoading.value = false;
}

/**
 * Handle changes to the targeted status.
 * * @param {string} status - The status to query for.
 */
function handleStatusChange(status) {
  selectedStatusIndex.value = statusOptions.value.indexOf(status);
  roleStatus.value = status;
  queryRoles();
}

/**
 * Show the success modal on save.
 */
function showSuccessModal() {
  bvModal.value.show('successful-submit');
}

/**
 * Save the request to delete roles.
 */
async function deleteRoles() {
  isLoading.value = true;
  try {
    await Promise.all(map(deleteRoleIds.value, async (id) => {
      const payload = {
        role: {
          roleId: id,
          status: roleStatus.value,
        },
      };
      const { data } = await submitCustomRequest('deleteRole', payload);
      requestId.value = data.id;
    }));
    showSuccessModal();
  } catch (error) {
    showErrorMessage(error, i18n.global.t('errors.deleteObject', { object: 'role' }));
  } finally {
    isLoading.value = false;
    deleteRoleIds.value = [];
    bvModal.value.hide('deleteRolesModal');
  }
}

/**
 * Searches for roles based on the provided query.
 * @param {string} query - The search query to filter resources.
 */
function search(query) {
  searchValue.value = query;
  queryRoles();
}

/**
 * Navigates to the details page of the specified role.
 * @param {Object} role - The role object containing details to navigate to.
 */
function navigateToRoleDetails(role) {
  let roleId = 'new';
  const status = roleStatus.value;
  if (role) {
    roleId = role.id;
  }
  router.push({
    name: 'RoleDetails',
    params: {
      roleId,
      roleStatus: status,
    },
  });
}

/**
 * Show the delete confirmation modal.
 * @param {Array} roles - The roles to be deleted on confirmation.
 */
function showDeleteModal(roles) {
  deleteRoleIds.value = map(roles, 'id');
  bvModal.value.show('deleteRolesModal');
}

/**
 * Save the request to publish a role.
 * @param {Object} role - The role data to be published.
 */
async function publishRole(role) {
  isLoading.value = true;
  const originalRole = find(queriedRoles.value, (r) => r.role.id === role.id);
  const { id, status, ...object } = role;
  const glossary = originalRole.glossary.idx['/role'];
  const payload = {
    role: {
      roleId: id,
      status,
      object,
      glossary,
    },
  };
  try {
    const { data } = await requestAction('publishRole', 'publish', null, payload);
    requestId.value = data.id;
    showSuccessModal();
  } catch (error) {
    showErrorMessage(error, i18n.global.t('errors.savingObject', { object: 'role' }));
  } finally {
    isLoading.value = false;
    queryRoles();
  }
}

/**
 * Hide the delete modal.
 */
function hideDeleteModal() {
  grid.value.clearSelected();
  bvModal.value.hide('deleteRolesModal');
}

watch(() => prop.roles, (newRoles) => {
  items.value = newRoles;
}, { immediate: true });

onMounted(() => {
  queryRoles();
  isMounted.value = true;
});

</script>
<style lang="scss" scoped>
:deep(.fit-content) {
  min-width: fit-content;
  word-wrap: break-word;
  word-break: break-word;
}

:deep(.w-65) {
  width: 65% !important;
}
</style>
