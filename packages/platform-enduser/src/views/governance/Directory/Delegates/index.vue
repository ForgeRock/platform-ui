<!-- Copyright (c) 2023-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer
    fluid
    class="my-5">
    <FrHeader
      class="mb-4"
      :title="$t('governance.delegates.title')"
      :subtitle="$t('governance.delegates.subtitle')" />
    <BCard no-body>
      <BCardHeader class="p-0">
        <div :class="`btn-toolbar ${hasIDMUsersViewPrivilege ? 'justify-content-between' : 'justify-content-end'} p-3 border-bottom-0`">
          <BButton
            v-if="hasIDMUsersViewPrivilege"
            @click="showAddModal"
            data-testid="add-delegate"
            variant="primary">
            <FrIcon
              icon-class="mr-2"
              name="add">
              {{ $t('governance.delegates.addDelegates') }}
            </FrIcon>
          </BButton>
          <div class="d-flex">
            <FrSearchInput
              v-model="searchQuery"
              data-testid="search-delegate"
              :placeholder="$t('common.search')"
              @clear="clear"
              @search="paginationPage = 1; loadData()" />
            <BButton
              @click="openColumnsModal"
              variant="link-dark"
              class="ml-2">
              <FrIcon
                icon-class="md-24"
                name="view_column" />
            </BButton>
          </div>
        </div>
      </BCardHeader>
      <BTable
        v-if="items.length"
        v-resizable-table="{ persistKey: 'governance-delegates' }"
        id="delegate-table"
        data-testid="delegate-table"
        @sort-changed="sortChanged"
        hover
        responsive
        :fields="fields"
        :items="items">
        <template #cell(user)="{ item }">
          <BMedia no-body>
            <BMediaAside vertical-align="center">
              <BImg
                class="rounded-circle"
                height="36"
                width="36"
                :alt="item.givenName"
                :aria-hidden="true"
                :src="item.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
            </BMediaAside>
            <BMediaBody class="text-truncate">
              <h5 class="mb-0 text-truncate">
                {{ item.givenName }} {{ item.sn }}
              </h5>
              <small class="text-muted text-truncate">
                {{ item.userName }}
              </small>
            </BMediaBody>
          </BMedia>
        </template>
        <template #cell(actions)="{ item }">
          <FrActionsCell
            :delete-option="false"
            :edit-option="false"
            :divider="false">
            <template #custom-top-actions>
              <BDropdownItem
                data-testid="remove-delegate"
                @click="showRemoveDelegateModal(item)">
                <FrIcon
                  icon-class="mr-2"
                  name="delete">
                  {{ $t('common.remove') }}
                </FrIcon>
              </BDropdownItem>
            </template>
          </FrActionsCell>
        </template>
      </BTable>
      <FrNoData
        v-else
        :card="false"
        class="mb-4"
        data-testid="delegates-no-data"
        icon="inbox"
        :subtitle="$t('governance.delegates.noDelegates')" />
      <FrPagination
        v-model="paginationPage"
        aria-controls="delegate-table"
        :last-page="isLast"
        :per-page="paginationPageSize"
        @input="pageChange"
        @on-page-size-change="pageSizeChange"
      />
    </BCard>
    <FrAddDelegateModal
      v-if="hasIDMUsersViewPrivilege"
      @delegate-added="loadData()" />
    <FrColumnPicker
      v-bind="pickerProps"
      :available-columns="tableFields" />
    <FrDeleteModal
      @delete-item="removeDelegate()"
      translated-item-type="delegate"
      id="delegate-delete-modal" />
  </BContainer>
</template>

<script>
import {
  BButton,
  BCard,
  BCardHeader,
  BContainer,
  BDropdownItem,
  BImg,
  BMedia,
  BMediaAside,
  BMediaBody,
  BTable,
} from 'bootstrap-vue';
import { mapState } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrColumnPicker from '@forgerock/platform-shared/src/components/ColumnPicker/ColumnPicker';
import useColumnPicker from '@forgerock/platform-shared/src/composables/useColumnPicker';
import FrDeleteModal from '@forgerock/platform-shared/src/components/DeleteModal';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import DateMixin from '@forgerock/platform-shared/src/mixins/DateMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import { getTaskProxies, deleteTaskProxy } from '@/api/governance/DirectoryApi';
import i18n from '@/i18n';
import FrAddDelegateModal from './AddDelegateModal';

export default {
  name: 'Delegates',
  components: {
    BButton,
    BCard,
    BCardHeader,
    BContainer,
    BDropdownItem,
    BImg,
    BMedia,
    BMediaAside,
    BMediaBody,
    BTable,
    FrActionsCell,
    FrAddDelegateModal,
    FrColumnPicker,
    FrDeleteModal,
    FrHeader,
    FrIcon,
    FrNoData,
    FrPagination,
    FrSearchInput,
  },
  setup() {
    const tableFields = [
      {
        key: 'user',
        label: i18n.global.t('common.user.user'),
      },
      {
        key: 'start',
        label: i18n.global.t('governance.delegates.startDate'),
      },
      {
        key: 'end',
        label: i18n.global.t('governance.delegates.endDate'),
      },
      {
        key: 'actions',
        class: 'fr-no-resize sticky-right w-120px',
        label: i18n.global.t('common.actions'),
      },
    ];

    const {
      activeColumns,
      open: openColumnsModal,
      pickerProps,
    } = useColumnPicker(
      () => tableFields,
      {
        storageKey: () => 'governance-delegates-column-picker',
      },
    );

    return {
      activeColumns,
      openColumnsModal,
      pickerProps,
      tableFields,
    };
  },
  mixins: [
    DateMixin,
    NotificationMixin,
  ],
  data() {
    return {
      isLast: true,
      items: [],
      paginationPage: 1,
      paginationPageSize: 10,
      searchQuery: '',
      selectedDelegate: {},
      sortDesc: null,
    };
  },
  computed: {
    ...mapState(useUserStore, ['userId', 'hasIDMUsersViewPrivilege']),
    fields() {
      return this.activeColumns;
    },
  },
  mounted() {
    this.loadData();
  },
  methods: {
    clear() {
      this.searchQuery = '';
      this.paginationPage = 1;
      this.loadData();
    },
    getStartDate(duration) {
      if (!duration) return '-';
      const date = new Date(duration[0].duration.split('/')[0]);

      return `${this.monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    },
    getEndDate(duration) {
      if (!duration) return '-';
      const date = new Date(duration[0].duration.split('/')[1]);
      const endYear = date.getFullYear();
      const nowYear = new Date().getFullYear();

      // delegates with created with no end date have an end date of 100 years
      // we consider anything with an end date longer than 30 years to have no end date
      if ((endYear > nowYear) && ((endYear - nowYear) > 30)) return '-';

      return `${this.monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    },
    loadData() {
      const params = {
        pageSize: this.paginationPageSize,
        pageNumber: this.paginationPage,
      };

      if (this.searchQuery) params.queryString = this.searchQuery;

      /* Removing sort on this component pending a fix for OPENIDM-20595, leaving commented to potentially re-enable in future
      if (this.sortDesc !== null) {
        params.sortBy = 'userName';
        params.sortDir = this.sortDesc
          ? 'desc'
          : 'asc';
      } */

      getTaskProxies(this.userId, params).then(({ data }) => {
        this.items = data.result.map((delegate) => ({
          ...delegate,
          start: this.getStartDate(delegate._refProperties?.temporalConstraints),
          end: this.getEndDate(delegate._refProperties?.temporalConstraints),
        }));
        if ('pagedResultsCookie' in data) {
          this.isLast = data.pagedResultsCookie === null;
        } else {
          // If pagedResultsCookie is not provided, fallback to checking if the number of results is less than the page size to determine if it's the last page
          this.isLast = data.resultCount < this.paginationPageSize;
        }
      }).catch((err) => {
        this.showErrorMessage(err, this.$t('governance.delegates.errorGettingDelegates'));
      });
    },
    removeDelegate() {
      const delegateId = `managed/user/${this.selectedDelegate._refResourceId}`;

      deleteTaskProxy(this.userId, [delegateId]).then(() => {
        this.$bvModal.hide('delegate-delete-modal');
        this.displayNotification('success', this.$t('governance.delegates.delegateRemoved'));
        this.paginationPage = 1;
        this.loadData();
      }).catch((err) => {
        this.showErrorMessage(err, this.$t('governance.delegates.errorDeletingDelegate'));
      });
    },
    showAddModal() {
      this.$bvModal.show('add-delegate-modal');
    },
    showRemoveDelegateModal(delegate) {
      this.selectedDelegate = delegate;
      this.$bvModal.show('delegate-delete-modal');
    },
    sortChanged(event) {
      this.sortDesc = event.sortDesc;
      this.loadData();
    },
    pageChange(page) {
      this.paginationPage = page;
      this.loadData();
    },
    pageSizeChange(pageSize) {
      this.paginationPageSize = pageSize;
      this.loadData();
    },
  },
};
</script>

<style lang="scss" scoped>
:deep {
  .w-96px {
    width: 96px;
  }
}
</style>
