<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="h-100 d-flex w-100">
    <div class="w-100 bg-white">
      <FrNavbar
        hide-dropdown
        hide-toggle
        :show-help-link="false"
        :show-docs-link="false"
        :show-profile-link="false">
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
              class="md-24"
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
            :loading="loading"
            :total-count="totalCount"
            @add-item-to-cart="addItemToCart"
            @get-catalog-filter-schema="getCatalogFilterSchema"
            @remove-item-from-cart="removeRequestedItem('accessItem', $event)"
            @search:catalog="searchCatalog"
            @search:applications="searchApplications" />
        </div>
        <div class="w-100 h-100 fixed-top fr-sidebar-shim d-lg-none" />
        <!-- eslint-disable-next-line vue/component-name-in-template-casing -->
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
                    class="text-light text-muted md-24" />
                </BButtonClose>
              </div>
              <FrRequestCart
                :request-cart-items="requestCartItems"
                :request-cart-users="requestedUsers"
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
            class="md-24 mr-3 text-danger"
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
  </div>
</template>

<script>
import { cloneDeep } from 'lodash';
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
import BreadcrumbMixin from '@forgerock/platform-shared/src/mixins/BreadcrumbMixin';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNavbar from '@forgerock/platform-shared/src/components/Navbar';
import MediaMixin from '@forgerock/platform-shared/src/mixins/MediaMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import AppSharedUtilsMixin from '@forgerock/platform-shared/src/mixins/AppSharedUtilsMixin';
import { getResource } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import FrAccessRequestCatalog from '../../components/AccessRequestCatalog';
import FrRequestCart from '@/components/governance/RequestCart';
import { saveNewRequest, validateRequest } from '@/api/governance/AccessRequestApi';
import { getCatalogFilterSchema, searchCatalog } from '@/api/governance/CatalogApi';

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
    FrIcon,
    FrNavbar,
    FrRequestCart,
  },
  mixins: [
    AppSharedUtilsMixin,
    BreadcrumbMixin,
    MediaMixin,
    NotificationMixin,
  ],
  data() {
    return {
      applicationSearchResults: [],
      catalogFilterSchema: [],
      catalogResults: [],
      isTesting: false,
      loading: true,
      requestCartExpanded: false,
      requestCartItems: [],
      requestCartUsers: this.$route.params.requestingFor || [],
      saving: false,
      requestErrorFields: [{ key: 'user' }, { key: 'error' }],
      requestErrors: [],
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
        }));
      }
      if (this.catalogResults[0]?.entitlement) {
        return this.catalogResults.map((catalogItem) => ({
          description: catalogItem.entitlement.description,
          icon: this.getApplicationLogo(catalogItem.application),
          name: catalogItem.entitlement.displayName,
          appType: catalogItem.entitlement.name,
          templateName: catalogItem.application.templateName,
          id: catalogItem.id,
          requested: this.isRequested(catalogItem.id),
        }));
      }
      if (this.catalogResults[0]?.application) {
        return this.catalogResults.map((catalogItem) => ({
          description: catalogItem.application.description,
          icon: this.getApplicationLogo(catalogItem.application),
          name: catalogItem.application.name,
          appType: this.getApplicationDisplayName(catalogItem.application),
          templateName: catalogItem.application.templateName,
          id: catalogItem.id,
          requested: this.isRequested(catalogItem.id),
        }));
      }
      return this.catalogResults;
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
  mounted() {
    this.handleResize();
    // Add resize listener to determine whether side request cart should appear
    window.addEventListener('resize', this.handleResize);
    this.setBreadcrumb('/my-requests', this.$t('pageTitles.MyRequests'));
  },
  methods: {
    /**
     * Adds selected item to request cart
     * @param {Object} item item to add to cart
     */
    async addItemToCart(item) {
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
          accountGrant: 'application,id',
          entitlementGrant: 'application,entitlement,id',
          roleMembership: 'role,id',
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
        this.showErrorMessage(error, this.$t('governance.accessRequest.newRequest.errorSearchingCatalog'));
      }
      this.loading = false;
    },
    /**
     * Search the IGA commons for applications for the entitlement application filter field
     * @param {String} query query string to search applications
     */
    async searchApplications(query) {
      try {
        const { data } = await getResource(`${this.$store.state.realm}_application`, query);
        this.applicationSearchResults = data?.result || [];
      } catch (error) {
        this.showErrorMessage(error, this.$t('governance.accessRequest.newRequest.errorSearchingCatalog'));
      }
    },
    /**
     * Opens up the requested items details modal
     */
    openRequestedItemModal() {
      // TODO
    },
    /**
     * Removes selected item from request cart
     * @param {String} context either 'user' or 'accessItem' to target corresponding request item array
     * @param {String} itemId id of item to remove from cart
     */
    removeRequestedItem(context, itemId) {
      const targetArray = context === 'user' ? this.requestCartUsers : this.requestCartItems;
      const index = targetArray.findIndex((targetItem) => targetItem.id === itemId);
      const itemRemovedSuccessTranslation = context === 'user' ? 'requesteeRemoved' : 'itemRemoved';

      targetArray.splice(index, 1);
      this.displayNotification('success', this.$t(`governance.accessRequest.newRequest.${itemRemovedSuccessTranslation}`));
    },
    /**
     * Submits a new request
     * @param {Object} payload justification, priority, expiration properties
     */
    async submitNewRequest(payload) {
      this.saving = true;
      try {
        const users = this.requestedUsers.map((user) => user.id);
        const applications = this.requestedApplications.map((application) => ({ type: 'application', id: application.id }));
        const entitlements = this.requestedEntitlements.map((entitlement) => ({ type: 'entitlement', id: entitlement.id }));
        const roles = this.requestedRoles.map((role) => ({ type: 'role', id: role.id }));

        payload.users = users;
        payload.catalogs = [...applications, ...entitlements, ...roles];
        await saveNewRequest(payload);
        this.displayNotification('success', this.$t('governance.accessRequest.newRequest.requestSuccess'));
        this.$router.push({
          name: 'MyRequests',
        });
      } catch (error) {
        this.displayNotification('error', error);
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
  beforeDestroy() {
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
