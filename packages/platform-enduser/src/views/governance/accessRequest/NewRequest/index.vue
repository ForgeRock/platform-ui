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
            :aria-label="$t('governance.accessRequests.newRequest.expandRequestCart')"
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
            :catalog-items="catalogItems"
            :total-count="totalCount"
            @add-item-to-cart="addItemToCart"
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
                  {{ $t('governance.accessRequests.newRequest.yourRequest') }}
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
                :request-cart-users="users"
                @remove-requested-item="removeRequestedItem"
                @requested-item-click="openRequestedItemModal"
                @submit-new-request="submitNewRequest" />
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import {
  BButton,
  BButtonClose,
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
import { saveNewRequest, searchCatalog } from '../../../../api/governance/CatalogApi';

/**
 * View housing new access request catalog and request cart panel
 */
export default {
  name: 'NewRequest',
  components: {
    BButton,
    FrAccessRequestCatalog,
    BButtonClose,
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
      catalogResults: [],
      requestCartExpanded: false,
      requestCartItems: [],
      requestCartUsers: this.$route.params.requestingFor || [],
      totalCount: 0,
    };
  },
  computed: {
    applications() {
      return this.requestCartItems.filter((item) => item.itemType === 'application');
    },
    catalogItems() {
      if (this.catalogResults[0]?.role) {
        return this.catalogResults.map((catalogItem) => ({
          description: catalogItem.role.description,
          name: catalogItem.role.name,
          id: catalogItem.role.id,
          requested: this.isRequested(catalogItem.role.id),
        }));
      }
      if (this.catalogResults[0]?.entitlement) {
        return this.catalogResults.map((catalogItem) => ({
          description: catalogItem.entitlement.description,
          icon: this.getApplicationLogo(catalogItem.application),
          name: catalogItem.entitlement.displayName,
          appType: catalogItem.assignment.name,
          templateName: catalogItem.application.templateName,
          id: catalogItem.entitlement.id,
          requested: this.isRequested(catalogItem.entitlement.id),
        }));
      }
      if (this.catalogResults[0]?.application) {
        return this.catalogResults.map((catalogItem) => ({
          description: catalogItem.application.description,
          icon: this.getApplicationLogo(catalogItem.application),
          name: catalogItem.application.name,
          appType: this.getApplicationDisplayName(catalogItem.application),
          templateName: catalogItem.application.templateName,
          id: catalogItem.application.id,
          requested: this.isRequested(catalogItem.application.id),
        }));
      }
      return this.catalogResults;
    },
    entitlements() {
      return this.requestCartItems.filter((item) => item.itemType === 'entitlement');
    },
    roles() {
      return this.requestCartItems.filter((item) => item.itemType === 'role');
    },
    users() {
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
    addItemToCart(item) {
      this.requestCartItems.push(item);
      this.displayNotification('success', this.$t('pageTitles.requestAdded'));
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
     * @param {String} catalogType application, entitlement, or role
     * @param {Object} params query parameters including pageSize, page, sortField, and sort direction
     * overall catalog search
     */
    async searchCatalog(catalogType, params) {
      try {
        const searchParams = {
          // fields: 'application, entitlement, assignment, role', // TODO: determine what this looks like with full api
          pageSize: params.pageSize || 10,
          pagedResultsOffset: ((params.page || 1) - 1) * 10, // TODO: This will be used for the full api
          pageNumber: params.page || 1, // TODO: Remove this for the final api
          sortKeys: [params.sortField] || '',
          sortDir: params.sortDir || 'desc',
        };
        const payload = {
          targetFilter: {
            operator: 'EQUALS',
            operand: {
              targetName: 'item.type',
              targetValue: catalogType,
            },
          },
        };
        if (params.applicationFilter) {
          // TODOL add to targetFilter with full api?
        }
        if (params.searchValue) {
          // TODOL add to targetFilter with full api?
        }
        const { data } = await searchCatalog(searchParams, payload);
        this.catalogResults = data?.results || [];
        this.totalCount = data?.totalCount || 0;
      } catch (error) {
        this.showErrorMessage(error, this.$t('governance.accessRequests.newRequest.errorSearchingCatalog'));
      }
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
        this.showErrorMessage(error, this.$t('governance.accessRequests.newRequest.errorSearchingCatalog'));
      }
    },
    /**
     * Opens up the requested items details modal
     */
    openRequestedItemModal() {

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
      this.displayNotification('success', this.$t(`governance.accessRequests.newRequest.${itemRemovedSuccessTranslation}`));
    },
    /**
     * Submits a new request
     * @param {Object} payload justification, priority, expiration properties
     */
    submitNewRequest(payload) {
      try {
        const body = { ...payload };
        const users = this.users.map((user) => user.id);
        const applications = this.applications.map((application) => ({ type: 'application', id: application.id }));
        const entitlements = this.entitlements.map((entitlement) => ({ type: 'entitlement', id: entitlement.id }));
        const roles = this.roles.map((role) => ({ type: 'role', id: role.id }));

        body.users = users;
        body.catalogs = [...applications, ...entitlements, ...roles];
        saveNewRequest(body);
        this.displayNotification('success', this.$t('governance.accessRequests.newRequest.requestSuccess'));
        this.$router.push({
          name: 'MyRequests',
        });
      } catch (error) {
        this.displayNotification('error', error);
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
