<!-- Copyright (c) 2023-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="h-100 d-flex w-100">
    <div class="w-100 bg-white">
      <FrNavbar>
        <template #right-content>
          <BButton
            id="expandRequestCart"
            variant="none"
            class="ml-auto d-lg-none"
            aria-controls="expandableRequestCart"
            :aria-expanded="requestCartExpanded"
            :aria-label="$t('governance.accessRequest.newRequest.expandRequestCart')"
            @click="toggleRequestCartPanel">
            <FrIcon
              icon-class="md-24"
              name="shopping_cart" />
          </BButton>
        </template>
      </FrNavbar>
      <div
        id="contentWrapper"
        class="w-100 cart-open-lg"
        :class="{ 'cart-open': requestCartExpanded }">
        <div class="overflow-auto h-100">
          <FrAccessRequestCatalog
            :application-search-results="applicationSearchResults"
            :catalog-filter-schema="catalogFilterSchema"
            :catalog-items="catalogItems"
            :glossary-schema="glossarySchema"
            :loading="loading"
            :prevent-request-with-violation="preventRequestWithViolation"
            :sod-error="sodError"
            :total-count="totalCount"
            @add-item-to-cart="addItemToCart"
            @get-catalog-filter-schema="getCatalogFilterSchema"
            @remove-item-from-cart="removeRequestedItem('accessItem', $event)"
            @search:catalog="searchCatalog"
            @search:applications="searchApplications"
            @submit-with-violation="submitNewRequest(previousPayload, true)" />
        </div>
        <div class="w-100 h-100 fixed-top fr-sidebar-shim d-lg-none" />
        <transition name="slide-fade">
          <div
            v-if="requestCartExpanded"
            id="expandableRequestCart"
            class="fr-cart-panel position-fixed shadow-lg h-100 overflow-auto">
            <div class="px-4 pt-4 pb-5">
              <div class="d-flex align-items-center justify-content-between mb-4">
                <h2 class="mb-0 h5">
                  {{ $t('governance.accessRequest.newRequest.yourRequest') }}
                </h2>
                <BButtonClose
                  class="ml-auto d-lg-none"
                  variant="link"
                  @click="toggleRequestCartPanel">
                  <FrIcon
                    name="close"
                    icon-class="text-light text-muted md-24" />
                </BButtonClose>
              </div>
              <FrRequestCart
                :request-cart-items="requestCartItems"
                :request-cart-users="requestedUsers"
                :require-request-justification="requireRequestJustification"
                :show-spinner="saving"
                @remove-requested-item="removeRequestedItem"
                @requested-item-click="openRequestedItemModal"
                @submit-new-request="submitNewRequest" />
            </div>
          </div>
        </transition>
      </div>
    </div>
    <BModal
      no-close-on-backdrop
      no-close-on-esc
      ok-only
      size="lg"
      :ok-title="$t('common.done')"
      :static="isTesting"
      :visible="requestErrors.length > 0"
      @hide="requestErrors = []">
      <template #modal-title>
        <div class="d-flex align-items-center">
          <FrIcon
            icon-class="md-24 mr-3 text-danger"
            name="error_outline" />
          <h1 class="h5 modal-title">
            {{ $t('governance.accessRequest.newRequest.requestErrorTitle') }}
          </h1>
        </div>
      </template>
      <p class="mb-4">
        {{ $t('governance.accessRequest.newRequest.requestErrorBody') }}
      </p>
      <BTable
        class="border"
        thead-class="d-none"
        :fields="requestErrorFields"
        :items="requestErrors">
        <template #cell(user)="{ item }">
          <BMedia no-body>
            <BImg
              class="mr-3 align-self-center rounded-circle"
              height="36"
              width="36"
              :alt="$t('common.avatar')"
              :src="item.user.icon || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
            <BMediaBody>
              <h2 class="h5 m-0">
                {{ item.user.name }}
              </h2>
              <small class="text-muted">
                {{ item.user.userName }}
              </small>
            </BMediaBody>
          </BMedia>
        </template>
        <template #cell(error)="{ item }">
          <div class="d-flex justify-content-end">
            <BBadge variant="danger">
              {{ item.error }}
            </BBadge>
          </div>
        </template>
      </BTable>
    </BModal>
    <FrGovernanceUserDetailsModal
      :user="currentUser"
      :user-details="currentUserDetails"
      only-details />
  </div>
</template>

<script>
import {
  cloneDeep,
  get,
  isEmpty,
  pick,
} from 'lodash';
import {
  BBadge,
  BButton,
  BButtonClose,
  BImg,
  BMedia,
  BMediaBody,
  BModal,
  BTable,
} from 'bootstrap-vue';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNavbar from '@forgerock/platform-shared/src/components/Navbar';
import MediaMixin from '@forgerock/platform-shared/src/mixins/MediaMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import { getApplicationDisplayName, getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { getResource, getGlossarySchema, getIgaAccessRequest } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import {
  getResourceFunction,
  getResourcePath,
  queryParamFunction,
} from '@forgerock/platform-shared/src/components/FormEditor/utils/govObjectSelect';
import FrGovernanceUserDetailsModal from '@forgerock/platform-shared/src/components/governance/UserDetailsModal';
import { getCatalogFilterSchema, searchCatalog } from '@forgerock/platform-shared/src/api/governance/CatalogApi';
import { scanNewEntitlementAccess } from '@forgerock/platform-shared/src/api/governance/PolicyApi';
import { saveNewRequest, validateRequest } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import FrAccessRequestCatalog from '../../components/AccessRequestCatalog';
import FrRequestCart from '@/components/governance/RequestCart';

/**
 * @constant
 * @type {Array}
 * @default
 */
const userRequiredParams = [
  'userName',
  'givenName',
  'sn',
  'mail',
  'accountStatus',
];

/**
 * View housing new access request catalog and request cart panel
 */
export default {
  name: 'NewRequest',
  components: {
    BBadge,
    BButton,
    BButtonClose,
    BImg,
    BMedia,
    BMediaBody,
    BModal,
    BTable,
    FrAccessRequestCatalog,
    FrGovernanceUserDetailsModal,
    FrIcon,
    FrNavbar,
    FrRequestCart,
  },
  mixins: [
    MediaMixin,
    NotificationMixin,
  ],
  setup() {
    const { setBreadcrumb } = useBreadcrumb();
    return { setBreadcrumb };
  },
  data() {
    return {
      applicationSearchResults: [],
      catalogFilterSchema: [],
      catalogResults: [],
      currentUser: {},
      preventRequestWithViolation: false,
      previousPayload: {},
      selectedUserAccountsDetails: { result: [] },
      selectedUserEntitlementsDetails: { result: [] },
      selectedUserRolesDetails: { result: [] },
      sodError: {},
      glossarySchema: {},
      isTesting: false,
      loading: true,
      requestCartExpanded: false,
      requestCartItems: [],
      requestCartUsers: this.$store.state.requestCartUsers || [],
      requestErrorFields: [{ key: 'user' }, { key: 'error' }],
      requestErrors: [],
      requireRequestJustification: false,
      saving: false,
      totalCount: 0,
    };
  },
  computed: {
    catalogItems() {
      if (this.catalogResults[0]?.role) {
        return this.catalogResults.map((catalogItem) => ({
          description: catalogItem.role.description,
          name: catalogItem.role.name,
          id: catalogItem.id,
          requested: this.isRequested(catalogItem.id),
          glossary: catalogItem.glossary?.idx['/role'],
        }));
      }
      if (this.catalogResults[0]?.entitlement) {
        return this.catalogResults.map((catalogItem) => ({
          description: catalogItem.glossary?.idx['/entitlement']?.description || catalogItem.entitlement.description,
          icon: getApplicationLogo(catalogItem.application),
          name: catalogItem.descriptor?.idx['/entitlement']?.displayName || catalogItem.entitlement.displayName,
          appType: catalogItem.entitlement.name,
          templateName: catalogItem.application.templateName,
          id: catalogItem.id,
          assignmentId: catalogItem.assignment.id,
          requested: this.isRequested(catalogItem.id),
          glossary: catalogItem.glossary?.idx['/entitlement'],
        }));
      }
      if (this.catalogResults[0]?.application) {
        return this.catalogResults.map((catalogItem) => ({
          description: catalogItem.application.description,
          icon: getApplicationLogo(catalogItem.application),
          name: catalogItem.application.name,
          appType: getApplicationDisplayName(catalogItem.application),
          templateName: catalogItem.application.templateName,
          id: catalogItem.id,
          requested: this.isRequested(catalogItem.id),
          glossary: catalogItem.glossary?.idx['/application'],
          applicationId: catalogItem.application.id,
          mappingNames: catalogItem.application.mappingNames,
          connectorId: catalogItem.application.connectorId,
        }));
      }
      return this.catalogResults;
    },
    currentUserDetails() {
      return {
        userAccounts: this.selectedUserAccountsDetails,
        userEntitlements: this.selectedUserEntitlementsDetails,
        userRoles: this.selectedUserRolesDetails,
      };
    },
    requestedApplications() {
      return this.requestCartItems.filter((item) => item.itemType === 'application');
    },
    requestedEntitlements() {
      return this.requestCartItems.filter((item) => item.itemType === 'entitlement');
    },
    requestedRoles() {
      return this.requestCartItems.filter((item) => item.itemType === 'role');
    },
    requestedUsers() {
      return this.requestCartUsers.map((user) => ({
        icon: user.profileImage,
        ...user,
      }));
    },
  },
  async mounted() {
    this.handleResize();
    // Add resize listener to determine whether side request cart should appear
    window.addEventListener('resize', this.handleResize);
    this.setBreadcrumb('/my-requests', this.$t('pageTitles.MyRequests'));
    try {
      const { data } = await getGlossarySchema();
      this.glossarySchema = {
        application: this.filterGlossarySchema(data['/openidm/managed/application']),
        entitlement: this.filterGlossarySchema(data['/openidm/managed/assignment']),
        role: this.filterGlossarySchema(data['/openidm/managed/role']),
      };
    } catch (error) {
      this.showErrorMessage(error, this.$t('governance.certificationTask.errors.glossaryError'));
    }
    try {
      const { data } = await getIgaAccessRequest();
      this.requireRequestJustification = data.requireRequestJustification;
      this.preventRequestWithViolation = data.preventRequestWithViolation;
    } catch {
      // We don't need to show an error here
    }
  },
  methods: {
    /**
     * Adds selected item to request cart
     * @param {Object} item item to add to cart
     */
    async addItemToCart(item) {
      this.sodError = {};
      try {
        // check if user already has access
        const { data } = await validateRequest({
          users: this.requestedUsers.map((user) => user.id),
          catalogs: [{ type: item.itemType, id: item.id }],
          accessModifier: 'add',
          priority: 'low',
        });
        if (data?.errors?.length) {
          // open modal showing errors if there are any validation errors
          this.requestErrors = data?.errors.map((error) => ({
            user: this.requestedUsers.find((user) => user.id === error.userId),
            error: this.$t(`governance.accessRequest.newRequest.${error.error}`),
          }));
        } else {
          this.requestCartItems.push(item);
          this.displayNotification('success', this.$t('governance.accessRequest.newRequest.requestAdded'));
        }
      } catch (error) {
        this.showErrorMessage(error, this.$t('governance.accessRequest.newRequest.errorValidatingAccessRequests'));
      }
    },
    /**
     * Filter schema attribute to not include 'requestable' or 'description' fields
     * @param {Array} schema glossary schema attributes
     */
    filterGlossarySchema(schema) {
      return schema.filter(({ name }) => !(name === 'requestable' || name === 'description'));
    },
    /**
     * Retrieves list of fields that can be filtered on
     * @param {String} objectType object type to filter results by
     */
    async getCatalogFilterSchema(objectType) {
      try {
        const { data: catalogFilterSchema } = await getCatalogFilterSchema(objectType);
        this.catalogFilterSchema = catalogFilterSchema;
      } catch (error) {
        this.showErrorMessage(error, this.$t('governance.accessRequest.newRequest.errorGettingCatalogFilterSchema'));
      }
    },
    /**
     * Ensures access request cart is always expanded when screen resolution is above 992px
     */
    handleResize() {
      this.requestCartExpanded = !this.media('lt-lg').matches;
    },
    /**
     * Determines if catalog item is in request cart
     * @param {String} catalogItemId id of item to to check presence in cart
     */
    isRequested(catalogItemId) {
      return !!this.requestCartItems.find((requestCartItem) => requestCartItem.id === catalogItemId);
    },
    /**
     * Search the request catalog using the provided filter, sort, and page details
     * @param {String} catalogType accountGrant, entitlementGrant, or roleMembership
     * @param {Object} params query parameters including pageSize, page, sortKeys, and sort direction
     * overall catalog search
     */
    async searchCatalog(catalogType, params) {
      try {
        this.loading = true;
        const fieldsMap = {
          accountGrant: 'application,id,glossary',
          entitlementGrant: 'application,entitlement,id,descriptor,glossary,assignment',
          roleMembership: 'role,id,glossary',
        };
        const searchParams = {
          fields: fieldsMap[catalogType],
          pageSize: params.pageSize || 10,
          pagedResultsOffset: ((params.page || 1) - 1) * 10,
        };
        if (params.sortKeys) {
          searchParams.sortKeys = `${params.sortDir === 'desc' ? '-' : ''}${params.sortKeys}`;
        }
        const payload = {
          targetFilter: {
            operator: 'EQUALS',
            operand: {
              targetName: 'item.type',
              targetValue: catalogType,
            },
          },
        };

        if (params.applicationFilter || params.filter?.operand || params.searchValue) {
          payload.targetFilter.operand = [cloneDeep(payload.targetFilter)];
          payload.targetFilter.operator = 'AND';
          if (params.applicationFilter) {
            const applicationFilterOperand = {
              operator: 'OR',
              operand: [],
            };
            params.applicationFilter.forEach((applicationId) => {
              applicationFilterOperand.operand.push({
                operator: 'EQUALS',
                operand: {
                  targetName: 'application.id',
                  targetValue: applicationId,
                },
              });
            });
            payload.targetFilter.operand.push(applicationFilterOperand);
          }
          if (params.filter?.operand) {
            payload.targetFilter.operand.push(params.filter);
          }
          if (params.searchValue) {
            const nameMap = {
              accountGrant: 'application.name',
              entitlementGrant: 'assignment.name',
              roleMembership: 'role.name',
            };
            payload.targetFilter.operand.push({
              operator: 'CONTAINS',
              operand: {
                targetName: nameMap[catalogType],
                targetValue: params.searchValue,
              },
            });
          }
        }

        const { data } = await searchCatalog(searchParams, payload);
        this.catalogResults = data?.result || [];
        this.totalCount = data?.totalCount || 0;
      } catch (error) {
        this.showErrorMessage(error, this.$t('governance.resource.errors.errorSearchingCatalog'));
      }
      this.loading = false;
    },
    /**
     * Search the IGA commons for applications for the entitlement application filter field
     * @param {String} queryString query string to search applications
     */
    async searchApplications(queryString) {
      try {
        const { data } = await getResource('application', { queryString, authoritative: false });
        this.applicationSearchResults = data?.result || [];
      } catch (error) {
        this.showErrorMessage(error, this.$t('governance.resource.errors.errorSearchingCatalog'));
      }
    },
    /**
     * Opens up the requested items details modal
     * @param {String} id item ID
     */
    openRequestedItemModal(id) {
      if (!this.context === 'user') {
        return;
      }
      this.openUserDetailsModal(id);
    },
    /**
     * Get user information and open details modal
     * @param {String} id user ID
     */
    openUserDetailsModal(id) {
      // get user details
      const resourceFunction = getResourceFunction('user');
      const resourcePath = getResourcePath('user');
      resourceFunction(resourcePath, queryParamFunction(id, resourcePath, true))
        .then(({ data }) => {
          const userData = get(data, 'result[0]', {});
          this.currentUser = pick(userData, userRequiredParams);
          this.$bvModal.show('GovernanceUserDetailsModal');
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('governance.certificationTask.errors.getUserError'));
        });
    },
    /**
     * Removes selected item from request cart
     * @param {String} context either 'user' or 'accessItem' to target corresponding request item array
     * @param {String} itemId id of item to remove from cart
     */
    removeRequestedItem(context, itemId) {
      this.sodError = {};
      const targetArray = context === 'user' ? this.requestCartUsers : this.requestCartItems;
      const index = targetArray.findIndex((targetItem) => targetItem.id === itemId);
      const itemRemovedSuccessTranslation = context === 'user' ? 'requesteeRemoved' : 'itemRemoved';

      targetArray.splice(index, 1);
      this.displayNotification('success', this.$t(`governance.accessRequest.newRequest.${itemRemovedSuccessTranslation}`));
    },
    /**
     * Submits a new request
     * @param {Object} payload justification, priority, expiration properties
     * @param {Boolean} skipSOD submit request without checking SOD
     */
    async submitNewRequest(payload, skipSOD) {
      this.previousPayload = cloneDeep(payload);
      this.saving = true;
      this.sodError = {};
      try {
        const users = this.requestedUsers.map((user) => user.id);
        // Add form request data to applications, if present
        const applications = this.requestedApplications.map((application) => {
          const item = { type: 'application', id: application.id };
          if (!isEmpty(application.requestData)) item.data = { form: application.requestData };
          return item;
        });
        const entitlements = this.requestedEntitlements.map((entitlement) => ({ type: 'entitlement', id: entitlement.id }));
        const roles = this.requestedRoles.map((role) => ({ type: 'role', id: role.id }));

        payload.users = users;
        payload.catalogs = [...applications, ...entitlements, ...roles];

        // perform SOD check when requesting entitlements for a single user
        if (!skipSOD && users.length === 1 && entitlements.length) {
          try {
            const assignmentIds = this.requestedEntitlements.map((entitlement) => (entitlement.assignmentId));
            const additionalAccess = assignmentIds.map((id) => ({ type: 'entitlementGrant', assignmentId: id }));
            const { data } = await scanNewEntitlementAccess(users[0], additionalAccess);
            if (data.result?.length) {
              // SOD violation found, set error and do not submit request
              this.sodError = data.result;
            } else {
              // no SOD violations, submit request
              this.sodError = {};
              await saveNewRequest(payload);
              this.displayNotification('success', this.$t('governance.request.requestSuccess'));
              this.$router.push({ name: 'MyRequests' });
            }
          } catch (error) {
            this.showErrorMessage(error, this.$t('governance.request.errorCheckingSod'));
          }
        } else {
          await saveNewRequest(payload);
          this.displayNotification('success', this.$t('governance.request.requestSuccess'));
          this.$router.push({ name: 'MyRequests' });
        }
      } catch (error) {
        this.showErrorMessage(error, this.$t('governance.accessRequest.newRequest.requestErrorTitle'));
      } finally {
        this.saving = false;
      }
    },
    /**
     * Expands or collapses request cart side panel (only available if resolution is below 992px)
     */
    toggleRequestCartPanel() {
      this.requestCartExpanded = !this.requestCartExpanded;
    },
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
};
</script>

<style lang="scss" scoped>
#contentWrapper {
  padding-right: 0;
  height: calc(100vh - 72px);
  &.cart-open {
    .fr-sidebar-shim {
      display: block;
      z-index: 2;
    }

    .fr-cart-panel {
      margin-right: 0;
      z-index: 3;
    }
  }

  @media (min-width: 992px) {
    &.cart-open-lg {
      padding-right: 320px;
      .fr-cart-panel {
        margin-right: 0;
        z-index: 3;
      }
    }
  }

  .fr-sidebar-shim {
    display: none;
    background-color: $black;
    opacity: 0.2;
  }

  .fr-cart-panel {
    right: 0;
    width: 320px;
    background-color: $white;
    top: 0;
    margin-top: 72px;
    margin-right: -320px;

    &.slide-fade-enter-active {
      transition: all .3s ease;
    }
    &.slide-fade-leave-active {
      transition: all .2s ease;
    }
    &.slide-fade-enter, .slide-fade-leave-to {
      transform: translateX(10px);
      opacity: 0;
    }
  }
}
</style>
