<!-- Copyright (c) 2023-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div class="d-flex">
      <FrFilterSidePanel
        v-if="usingNewListApi && showFilters"
        id="campaigns-filter-panel"
        :title="$t('common.filters')">
        <div class="d-flex flex-column h-100">
          <ul class="list-unstyled mb-0 flex-grow-1">
            <li class="px-4 py-2 fr-filters-nav mt-2">
              <h3 class="text-secondary mb-2">
                {{ $t('common.name') }}
              </h3>
              <BFormInput
                v-model="searchQuery"
                :aria-label="$t('common.name')"
                :placeholder="$t('common.search')"
                @input="debouncedSearch" />
            </li>
            <li class="px-4 py-2 fr-filters-nav">
              <h3 class="text-secondary mb-2 d-flex align-items-center">
                {{ $t('common.owner') }}
                <BButton
                  v-if="selectedOwner"
                  class="ml-auto p-0"
                  variant="link"
                  @click="selectedOwner = ''">
                  {{ $t('common.clear') }}
                </BButton>
              </h3>
              <FrGovResourceSelect
                v-model="selectedOwner"
                name="campaign-owner-filter"
                resource-path="managed/user"
                :label="$t('common.owner')"
                :set-initial-value="false" />
            </li>
            <li class="px-4 py-2 fr-filters-nav">
              <h3 class="text-secondary mb-2">
                {{ $t('governance.certification.campaignType') }}
              </h3>
              <BFormSelect
                v-model="selectedCampaignType"
                name="campaign-type-filter"
                :aria-label="$t('governance.certification.campaignType')"
                :options="campaignTypeOptions" />
            </li>
            <li class="px-4 py-2 fr-filters-nav">
              <h3 class="text-secondary mb-2">
                {{ $t('common.status') }}
              </h3>
              <BFormCheckboxGroup
                v-model="selectedStatuses"
                stacked
                :aria-label="$t('common.status')"
                :options="statusCheckboxOptions" />
            </li>
          </ul>
          <div class="p-1 d-flex justify-content-between">
            <BButton
              class="w-100"
              variant="outline-primary"
              data-testid="clear-campaign-filters"
              @click="resetFilters">
              {{ $t('governance.access.filter.clearFilters') }}
            </BButton>
          </div>
        </div>
      </FrFilterSidePanel>
      <div class="flex-grow-1 min-width-0">
        <BCard no-body>
          <BCardHeader class="p-0">
            <BButtonToolbar
              v-if="usingNewListApi"
              class="px-4 py-3 border-bottom-0 w-100">
              <div class="d-flex align-items-center w-100">
                <BButton
                  class="toolbar-link-text text-dark"
                  :aria-expanded="showFilters.toString()"
                  aria-controls="campaigns-filter-panel"
                  :aria-label="showFilters ? $t('governance.toolbar.hideFilters') : $t('governance.toolbar.showFilters')"
                  data-testid="filter-toggle"
                  variant="link"
                  @click="showFilters = !showFilters">
                  <FrIcon
                    icon-class="mr-lg-2"
                    name="filter_list">
                    <span class="d-none d-lg-inline">
                      {{ showFilters ? $t('governance.toolbar.hideFilters') : $t('governance.toolbar.showFilters') }}
                    </span>
                  </FrIcon>
                </BButton>
                <div class="d-flex align-items-center ml-auto">
                  <BButton
                    class="mr-2 text-body"
                    variant="link"
                    :aria-label="$t('governance.certificationTask.export')"
                    @click="openDownloadModal()">
                    <FrIcon
                      id="campaigns-export-icon"
                      icon-class="mr-1"
                      name="file_download" />
                  </BButton>
                  <BTooltip
                    target="campaigns-export-icon"
                    triggers="hover"
                    placement="top">
                    {{ $t('governance.certificationTask.export') }}
                  </BTooltip>
                  <BButton
                    @click="openColumnsModal"
                    :aria-label="$t('common.customizeColumns')"
                    variant="link"
                    class="ml-2 text-body">
                    <FrIcon
                      icon-class="md-24"
                      name="view_column" />
                  </BButton>
                </div>
              </div>
            </BButtonToolbar>
            <!-- also serves flag-on envs whose new endpoint is missing: restores
                 the old status-dropdown UX there -->
            <BButtonToolbar
              v-else
              class="justify-content-between p-3 border-bottom-0">
              <BDropdown
                id="dropdown-status"
                variant="link"
                class="ml-2 text-decoration-none">
                <template #button-content>
                  <span class="font-weight-bold mr-1">
                    {{ `${$t('common.status')}:` }}
                  </span>
                  <span>{{ statusSort.text }}</span>
                </template>
                <template v-for="([key, statusObj]) in Array.from(statuses)">
                  <BDropdownItem
                    v-if="!statusObj.sortHide"
                    :key="key"
                    @click="handleStatusSort(statusObj)">
                    {{ statusObj.text }}
                  </BDropdownItem>
                </template>
              </BDropdown>
              <div class="d-flex align-items-center">
                <BButton
                  class="mr-2 text-body"
                  variant="link"
                  :aria-label="$t('governance.certificationTask.export')"
                  @click="openDownloadModal()">
                  <FrIcon
                    id="campaigns-export-icon"
                    icon-class="mr-1"
                    name="file_download" />
                </BButton>
                <BTooltip
                  target="campaigns-export-icon"
                  triggers="hover"
                  placement="top">
                  {{ $t('governance.certificationTask.export') }}
                </BTooltip>
                <BButton
                  @click="openColumnsModal"
                  :aria-label="$t('common.customizeColumns')"
                  variant="link"
                  class="ml-2 text-body">
                  <FrIcon
                    icon-class="md-24"
                    name="view_column" />
                </BButton>
              </div>
            </BButtonToolbar>
          </BCardHeader>
          <FrSpinner
            v-if="tableLoading"
            class="py-5" />
          <BTable
            v-else-if="displayList.length"
            class="mb-0"
            v-resizable-table="{ persistKey: 'certification-campaigns' }"
            hover
            responsive
            tbody-tr-class="cursor-pointer"
            :fields="fields"
            :items="displayList"
            :no-local-sorting="true"
            :sort-by="sortBy"
            :sort-desc="sortDesc"
            @row-clicked="navigateToEdit($event)"
            @sort-changed="sortingChanged">
            <template #cell(name)="{ item }">
              <BMedia
                class="align-items-center"
                no-body>
                <BMediaBody class="align-self-center">
                  <h3 class="h5 m-0">
                    {{ item.campaignName || item.name }}
                  </h3>
                  <small class="text-muted">
                    {{ $t('governance.certification.certificationType', { type: startCase(item.certificationType) }) }}
                  </small>
                </BMediaBody>
              </BMedia>
            </template>
            <template #cell(status)="{ item }">
              <template v-if="item?.status && statuses.get(item.status)">
                <BBadge
                  class="w-100"
                  :variant="statuses.get(item.status).variant">
                  {{ statuses.get(item.status).text }}
                </BBadge>
              </template>
            </template>
            <template #cell(progress)="{ item, index }">
              <FrCircleProgressBar
                :id="`campaign-chart-${index.toString()}`"
                :progress="progressPercentage(item.progress)"
                :thickness="6"
                :empty-thickness="6"
                empty-color="#e7ebf0"
                :size="50">
                <template #count="{ count }">
                  <small class="font-weight-bold mb-0">
                    {{ count.currentValue }}%
                  </small>
                </template>
              </FrCircleProgressBar>
            </template>
            <template #cell(actions)="{ item }">
              <FrActionsCell
                :edit-option="false"
                :delete-option="false"
                :divider="false">
                <template #custom-top-actions>
                  <template v-if="(governanceDevEnabled && (isActiveLikeItem(item) || isClosedLikeItem(item))) || (!governanceDevEnabled && (isActiveLikeStatus || isClosedLikeStatus))">
                    <BDropdownItem @click="navigateToEdit(item)">
                      <FrIcon
                        icon-class="mr-2"
                        name="article">
                        {{ $t('common.viewDetails') }}
                      </FrIcon>
                    </BDropdownItem>
                  </template>
                  <template v-if="governanceDevEnabled ? isActiveLikeItem(item) : isActiveLikeStatus">
                    <BDropdownItem @click="openDeadlineModal(item.id, item.deadline)">
                      <FrIcon
                        icon-class="mr-2"
                        name="calendar_today">
                        {{ $t('governance.certification.updateDeadline') }}
                      </FrIcon>
                    </BDropdownItem>
                    <BDropdownDivider />
                    <BDropdownItem @click="openModal('cancel', item.id)">
                      <FrIcon
                        icon-class="mr-2"
                        name="close">
                        {{ $t('common.cancel') }}
                      </FrIcon>
                    </BDropdownItem>
                  </template>
                  <template v-if="governanceDevEnabled ? isStagedItem(item) : isStagedStatus">
                    <BDropdownItem @click="openModal('activate', item.id)">
                      <FrIcon
                        icon-class="mr-2"
                        name="calendar_today">
                        {{ $t('common.activate') }}
                      </FrIcon>
                    </BDropdownItem>
                    <BDropdownDivider />
                    <BDropdownItem @click="openModal('delete', item.id)">
                      <FrIcon
                        icon-class="mr-2"
                        name="delete">
                        {{ $t('common.delete') }}
                      </FrIcon>
                    </BDropdownItem>
                  </template>
                </template>
              </FrActionsCell>
            </template>
          </BTable>
          <FrNoData
            v-else
            class="mb-4"
            data-testid="campaigns-no-data"
            icon="inbox"
            :card="false"
            :subtitle="$t('governance.certification.noCampaigns', { type: usingNewListApi ? $t('governance.status.active') : statusSort.text })" />
          <FrPagination
            v-if="totalRows"
            :value="currentPage"
            :total-rows="totalRows"
            :per-page="pageSize"
            @input="paginationChange"
            @on-page-size-change="pageSizeChange" />
        </BCard>
      </div>
    </div>
    <VeeField
      name="campaignField"
      v-slot="{ meta: { valid } }">
      <BModal
        id="campaign-modal"
        title-class="h5"
        title-tag="h2"
        :title="campaignModal.title"
        @hidden="closeModal('campaign-modal')">
        <div class="mb-4 d-block">
          {{ campaignModal.description }}
        </div>
        <template #modal-footer="{ cancel }">
          <BButton
            variant="link"
            :class="[{'text-danger': campaignModal.variant === 'danger'}, 'mr-2']"
            @click="cancel">
            {{ $t('common.cancel') }}
          </BButton>
          <FrButtonWithSpinner
            data-testid="save-button"
            :disabled="isRequestLoading || !valid"
            :show-spinner="isRequestLoading"
            :button-text="campaignModal.buttonText"
            :spinner-text="campaignModal.spinnerText"
            :variant="campaignModal.variant"
            @click="campaignModal.handler" />
        </template>
      </BModal>
    </VeeField>
    <FrColumnPicker
      v-bind="pickerProps"
      :available-columns="tableFields" />
    <FrUpdateDeadlineModal
      :loading="isRequestLoading"
      :current-deadline="currentDeadline"
      @update-deadline="updateCampaignDeadline"
      @close-modal="closeModal" />
    <FrCampaignDetailsModal
      :campaign="creatingCampaign"
      @close="creatingCampaign = {}" />
    <FrDownloadItemsModal
      modal-id="campaigns-download-items-modal"
      grant-type="campaigns"
      :is-loading="isExporting"
      :totals="{ currentPage: displayList.length, all: totalRows }"
      :ok-function="exportItemsToFile" />
  </div>
</template>

<script>
import dayjs from 'dayjs';
import { debounce, startCase } from 'lodash';
import { Field as VeeField } from 'vee-validate';
import {
  BBadge,
  BButton,
  BButtonToolbar,
  BCard,
  BCardHeader,
  BDropdown,
  BDropdownDivider,
  BDropdownItem,
  BFormCheckboxGroup,
  BFormInput,
  BFormSelect,
  BMedia,
  BMediaBody,
  BModal,
  BTable,
  BTooltip,
} from 'bootstrap-vue';
import { useI18n } from 'vue-i18n';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrColumnPicker from '@forgerock/platform-shared/src/components/ColumnPicker/ColumnPicker';
import useColumnPicker from '@forgerock/platform-shared/src/composables/useColumnPicker';
import FrCircleProgressBar from '@forgerock/platform-shared/src/components/CircleProgressBar';
import FrFilterSidePanel from '@forgerock/platform-shared/src/components/governance/FilterSidePanel';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import {
  getAdminCertificationItems,
  getCertificationList,
  activateCertification,
  cancelCertification,
  deleteCertification,
  updateCertificationDeadline,
} from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import CertificationMixin from '@forgerock/platform-shared/src/mixins/Governance/Certification';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import { CAMPAIGN_EXPIRING_DAYS, CampaignStates } from '@forgerock/platform-shared/src/utils/governance/types';
import { downloadAsType } from '@forgerock/platform-shared/src/utils/downloadFile';
import FrDownloadItemsModal from '@forgerock/platform-shared/src/views/Governance/CertificationTask/TaskList/modals/DownloadItemsModal/DownloadItemsModal';
import FrUpdateDeadlineModal from './CampaignDetails/CampaignOverview/UpdateDeadlineModal';
import FrCampaignDetailsModal from './CampaignDetailsModal';

function mutateCampaignStatus(campaign) {
  if (campaign.status === CampaignStates.IN_PROGRESS) {
    if (campaign.deadline && dayjs().isAfter(dayjs(campaign.deadline))) {
      campaign.status = CampaignStates.OVERDUE;
    } else if (campaign.deadline && dayjs().add(CAMPAIGN_EXPIRING_DAYS, 'day').isAfter(dayjs(campaign.deadline))) {
      campaign.status = CampaignStates.EXPIRING;
    }
  } else if (campaign.numInProgress > 0 && campaign.numInProgress >= campaign.doc_count) {
    // must match the statuses Map key ('completed'), not the backend value
    // (CampaignStates.COMPLETE), so the badge renders and the row is closed-like
    campaign.status = 'completed';
  }
}

const ACTIVE_LIKE_STATUSES = ['in-progress', 'active', 'creating', 'expiring', 'overdue'];
const CLOSED_LIKE_STATUSES = ['closed', 'expired', 'cancelled', 'completed', 'signed-off'];

export default {
  name: 'Campaigns',
  components: {
    BBadge,
    BButton,
    BButtonToolbar,
    BCard,
    BCardHeader,
    BDropdown,
    BDropdownDivider,
    BDropdownItem,
    BFormCheckboxGroup,
    BFormInput,
    BFormSelect,
    BMedia,
    BMediaBody,
    BModal,
    BTable,
    BTooltip,
    FrActionsCell,
    FrButtonWithSpinner,
    FrCampaignDetailsModal,
    FrCircleProgressBar,
    FrColumnPicker,
    FrDownloadItemsModal,
    FrFilterSidePanel,
    FrGovResourceSelect,
    FrIcon,
    FrNoData,
    FrPagination,
    FrSpinner,
    FrUpdateDeadlineModal,
    VeeField,
  },
  setup() {
    const { t } = useI18n();
    const tableFields = [
      {
        key: 'name',
        label: t('common.name'),
        sortable: true,
      },
      {
        key: 'formattedStartDate',
        label: t('common.startDate'),
        sortable: true,
      },
      {
        key: 'formattedDeadline',
        class: 'w-140px',
        label: t('common.deadline'),
        sortable: true,
      },
      {
        key: 'status',
        class: 'w-140px',
        label: t('common.status'),
      },
      {
        key: 'progress',
        class: 'w-140px',
        label: t('common.progress'),
      },
      {
        key: 'actions',
        class: 'w-120px fr-no-resize sticky-right',
        label: t('common.actions'),
      },
    ];

    const {
      activeColumns,
      open: openColumnsModal,
      pickerProps,
    } = useColumnPicker(
      () => tableFields,
      {
        storageKey: () => 'governance-certification-campaigns-column-picker',
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
    CertificationMixin,
    NotificationMixin,
  ],
  data() {
    return {
      currentPage: 1,
      pageSize: 10,
      creatingCampaign: {},
      totalRows: 0,
      tableLoading: true,
      sortBy: 'name',
      sortDesc: false,
      selectedCertId: null,
      accessReviewList: [],
      isExporting: false,
      isRequestLoading: false,
      modalType: null,
      currentDeadline: '',
      showFilters: false,
      selectedOwner: '',
      selectedCampaignType: '',
      selectedStatuses: [],
      isInitialising: false,
      getListRequestId: 0,
      newListUnavailable: false, // set once when /governance/certification 404s
    };
  },
  watch: {
    selectedOwner() {
      if (!this.governanceDevEnabled || this.isInitialising) return;
      this.currentPage = 1;
      this.getList();
    },
    selectedCampaignType() {
      if (!this.governanceDevEnabled || this.isInitialising) return;
      this.currentPage = 1;
      this.getList();
    },
    selectedStatuses() {
      if (!this.governanceDevEnabled || this.isInitialising) return;
      this.currentPage = 1;
      this.getList();
    },
  },
  computed: {
    governanceDevEnabled() {
      return this.$store?.state?.SharedStore?.governanceDevEnabled === true;
    },
    // whether the new certification list endpoint is actually being used —
    // false once the legacy fallback has engaged, even if the flag stays on
    usingNewListApi() {
      return this.governanceDevEnabled && !this.newListUnavailable;
    },
    fields() {
      return this.activeColumns;
    },
    displayList() {
      return this.accessReviewList;
    },
    filterableStatusKeys() {
      return Array.from(this.statuses)
        .filter(([, statusObj]) => !statusObj.sortHide)
        .map(([key]) => key);
    },
    statusCheckboxOptions() {
      return Array.from(this.statuses)
        .filter(([, statusObj]) => !statusObj.sortHide)
        .map(([key, statusObj]) => ({
          text: statusObj.text,
          value: key,
        }));
    },
    campaignTypeOptions() {
      return [
        { text: this.$t('governance.certification.activeCampaignsLabels.all'), value: '' },
        { text: this.$t('governance.certification.activeCampaignsLabels.identity'), value: 'identity' },
        { text: this.$t('governance.certification.activeCampaignsLabels.entitlement'), value: 'entitlement' },
        { text: this.$t('governance.certification.activeCampaignsLabels.entitlementComposition'), value: 'entitlementComposition' },
        { text: this.$t('governance.certification.activeCampaignsLabels.application'), value: 'application' },
        { text: this.$t('governance.certification.activeCampaignsLabels.roleMembership'), value: 'roleMembership' },
        { text: this.$t('governance.certification.activeCampaignsLabels.identityProfile'), value: 'identityProfile' },
        { text: this.$t('governance.certification.activeCampaignsLabels.roleComposition'), value: 'roleComposition' },
      ];
    },
    campaignModal() {
      if (this.modalType === 'activate') {
        return ({
          title: this.$t('governance.certification.modal.activateCampaign'),
          description: this.$t('governance.certification.modal.activateCampaignDescription'),
          buttonText: this.$t('governance.certification.modal.activateCampaignButton'),
          spinnerText: this.$t('common.canceling'),
          handler: this.activateCampaign,
          variant: 'primary',
        });
      }
      if (this.modalType === 'cancel') {
        return ({
          title: this.$t('governance.certification.modal.cancelCampaign'),
          description: this.$t('governance.certification.modal.cancelCampaignDescription'),
          buttonText: this.$t('governance.certification.modal.cancelCampaignButton'),
          spinnerText: this.$t('common.canceling'),
          handler: this.cancelCampaign,
          variant: 'danger',
        });
      }
      return ({
        title: this.$t('governance.certification.modal.deleteCampaign'),
        description: this.$t('governance.certification.modal.deleteCampaignDescription'),
        buttonText: this.$t('governance.certification.modal.deleteCampaignButton'),
        spinnerText: this.$t('common.canceling'),
        handler: this.deleteCampaign,
        variant: 'danger',
      });
    },
    isStagedStatus() {
      const statuses = Object.fromEntries(this.statuses);
      const matchStatuses = [statuses.staging.type];
      return matchStatuses.findIndex((type) => this.statusSort.type === type) > -1;
    },
  },
  created() {
    this.debouncedSearch = debounce(() => {
      if (!this.governanceDevEnabled) return;
      this.currentPage = 1;
      this.getList();
    }, 300);
  },
  mounted() {
    this.statuses = this.statuses.set(
      'signed-off',
      {
        sortHide: true,
        type: 'signed-off',
        variant: 'success',
        text: this.$t('governance.status.complete'),
      },
    );
    this.statuses = this.statuses.set(
      'staging',
      {
        param: 'staging',
        type: 'staging',
        variant: 'light',
        text: this.$t('governance.status.staging'),
      },
    );
    this.isInitialising = true;
    if (this.governanceDevEnabled) {
      this.selectedStatuses = this.filterableStatusKeys;
    } else {
      this.sortBy = 'formattedDeadline';
    }
    this.getList();
    this.$nextTick(() => {
      this.isInitialising = false;
    });
  },
  methods: {
    startCase,
    // one-way switch to the legacy data source for this session
    engageLegacyFallback() {
      this.isInitialising = true; // suppress the filter watchers while we reset
      this.newListUnavailable = true;
      this.showFilters = false;
      this.selectedOwner = '';
      this.selectedCampaignType = '';
      this.selectedStatuses = [];
      this.sortBy = 'formattedDeadline'; // legacy endpoint's default sort (mounted()
      this.sortDesc = false; //  set 'name' on the flag-on branch)
      this.currentPage = 1;
      // eslint-disable-next-line no-console
      console.warn('[Campaigns] /governance/certification unavailable — using legacy /governance/admin/certification');
      this.$nextTick(() => {
        this.isInitialising = false;
      });
    },
    resetFilters() {
      if (!this.governanceDevEnabled || this.isInitialising) return;
      this.isInitialising = true;
      this.searchQuery = '';
      this.selectedOwner = '';
      this.selectedCampaignType = '';
      this.selectedStatuses = [...this.filterableStatusKeys];
      this.currentPage = 1;
      this.getList();
      this.$nextTick(() => {
        this.isInitialising = false;
      });
    },
    buildQueryFilter() {
      const parts = [];
      if (this.searchQuery) {
        parts.push(`name co '${this.searchQuery.replace(/'/g, "\\'")}'`);
      }
      if (this.selectedOwner) {
        const ownerId = this.selectedOwner.split('/').pop();
        parts.push(`ownerId co '${ownerId.replace(/'/g, "\\'")}'`);
      }
      if (this.selectedCampaignType) {
        parts.push(`certificationType eq '${this.selectedCampaignType}'`);
      }
      // an empty selection is treated as "all": the checkbox group only renders
      // filterable statuses, and every status being un-checked would otherwise
      // require the backend to support a negation this endpoint may not accept
      const allSelected = !this.selectedStatuses.length
        || this.selectedStatuses.length === this.filterableStatusKeys.length;
      if (!allSelected) {
        const statusParts = this.selectedStatuses.map((key) => {
          const param = this.statuses.get(key)?.param || key;
          return `status eq '${param}'`;
        });
        parts.push(statusParts.length === 1 ? statusParts[0] : `(${statusParts.join(' or ')})`);
      }
      return parts.length ? parts.join(' and ') : undefined;
    },
    getList() {
      const params = {
        pageNumber: this.currentPage - 1,
        pageSize: this.pageSize,
        sortBy: this.getSortBy(),
        sortDesc: this.sortDesc,
      };
      if (this.usingNewListApi) {
        const queryFilter = this.buildQueryFilter();
        if (queryFilter) params._queryFilter = queryFilter;
      } else {
        params.status = this.statusSort.param;
        params.queryString = this.searchQuery;
      }
      // sequence requests: only the most recent call may render, so rapid
      // filter changes can't leave stale data in the table
      this.getListRequestId += 1;
      const requestId = this.getListRequestId;
      this.getItems(params).then(({ data }) => {
        if (requestId !== this.getListRequestId) return;
        if (this.$store?.state?.certificationCount) {
          // normalize like fixedData below: the new list endpoint returns totalHits
          this.$store.commit('setCertificationCount', data.totalHits || data.totalCount);
        }
        const fixedData = {
          totalCount: data.totalHits || data.totalCount,
          result: data?.results?.length > -1 ? data.results : (data?.result || []),
        };
        if (fixedData.result[0]?._source) {
          fixedData.result = fixedData.result.map((item) => ({ ...item._source }));
        }
        if (this.usingNewListApi) fixedData.result.forEach(mutateCampaignStatus);
        this.setAccessReviewList(fixedData);
      }).catch((error) => {
        if (requestId !== this.getListRequestId) return;
        // endpoint absent (404) or method not routed (405): fall back to the
        // legacy admin endpoint so flag-on envs don't render an empty table
        if (this.usingNewListApi && [404, 405].includes(error?.response?.status)) {
          this.engageLegacyFallback();
          this.getList();
          return;
        }
        this.tableLoading = false;
        this.showErrorMessage(error, this.$t('governance.certificationTask.errors.certificationListError'));
      });
    },
    pageSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.currentPage = 1;
      this.getList();
    },
    paginationChange(pageNumber) {
      this.currentPage = pageNumber;
      this.getList();
    },
    openDeadlineModal(id, deadline) {
      this.$root.$emit('bv::show::modal', 'UpdateDeadlineModal');
      this.selectedCertId = id;
      this.currentDeadline = deadline;
    },
    openModal(modalType, id) {
      this.modalType = modalType;
      this.selectedCertId = id;
      this.$root.$emit('bv::show::modal', 'campaign-modal');
    },
    getItems(params) {
      this.tableLoading = true;
      return this.usingNewListApi
        ? getCertificationList(params)
        : getAdminCertificationItems(params);
    },
    closeModal(modalName) {
      this.selectedCertId = null;
      this.currentDeadline = null;
      this.isRequestLoading = false;
      this.$root.$emit('bv::hide::modal', modalName);
      this.getList();
    },
    activateCampaign() {
      this.isRequestLoading = true;
      activateCertification(this.selectedCertId)
        .then(this.closeModal('campaign-modal'));
    },
    cancelCampaign() {
      this.isRequestLoading = true;
      cancelCertification(this.selectedCertId)
        .then(this.closeModal('campaign-modal'));
    },
    deleteCampaign() {
      this.isRequestLoading = true;
      deleteCertification(this.selectedCertId)
        .then(this.closeModal('campaign-modal'));
    },
    isActiveLikeItem(item) {
      return ACTIVE_LIKE_STATUSES.includes(item.status);
    },
    isClosedLikeItem(item) {
      return CLOSED_LIKE_STATUSES.includes(item.status);
    },
    isStagedItem(item) {
      return item.status === CampaignStates.STAGING;
    },
    navigateToEdit(item) {
      if (item.status === CampaignStates.CREATING) {
        this.creatingCampaign = item;
        this.$root.$emit('bv::show::modal', 'campaign-details-modal');
        return;
      }
      this.$router.push({
        name: 'CampaignDetails',
        params: {
          campaignId: item.id,
          tab: 'details',
        },
      });
    },
    updateCampaignDeadline(newDeadline) {
      this.isRequestLoading = true;
      updateCertificationDeadline(this.selectedCertId, newDeadline).then(() => {
        this.displayNotification('success', this.$t('governance.certificationDetails.deadlineSuccessfullyUpdatedMessage'));
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('governance.certificationDetails.errors.errorUpdatingDeadlineDefault'));
      }).finally(() => {
        this.isRequestLoading = false;
        this.closeModal('UpdateDeadlineModal');
      });
    },
    progressPercentage(progress = 0) {
      const actualProgress = progress * 100;
      return actualProgress >= 50
        ? Math.floor(actualProgress)
        : Math.ceil(actualProgress);
    },
    openDownloadModal() {
      this.$bvModal.show('campaigns-download-items-modal');
    },
    // shared by export "all rows": normalizes either API response shape without
    // touching tableLoading (which getItems mutates for the table itself)
    mapExportResults(data) {
      let rawResult = data?.results?.length > -1 ? data.results : (data?.result || []);
      if (rawResult[0]?._source) rawResult = rawResult.map((r) => ({ ...r._source }));
      rawResult.forEach((r) => {
        if (r.campaignId) r.id = r.campaignId;
        if (r.campaignName) r.name = r.campaignName;
      });
      return rawResult;
    },
    async exportItemsToFile(downloadOptions) {
      const { format, rows } = downloadOptions;
      let items = this.displayList;
      try {
        this.isExporting = true;
        if (rows === 'all') {
          const pageSize = format === 'pdf' ? 1000 : 10000;
          const params = {
            sortBy: this.getSortBy(),
            sortDesc: this.sortDesc,
            pageSize,
          };
          if (this.usingNewListApi) {
            const queryFilter = this.buildQueryFilter();
            if (queryFilter) params._queryFilter = queryFilter;
            const { data } = await getCertificationList(params);
            items = this.mapExportResults(data);
          } else {
            params.status = this.statusSort.param;
            params.queryString = this.searchQuery;
            const { data } = await getAdminCertificationItems(params);
            items = this.mapExportResults(data);
          }
        }
        const exportData = items.map((item) => ({
          [this.$t('common.name')]: item.name || '',
          [this.$t('common.type')]: startCase(item.certificationType) || '',
          [this.$t('common.startDate')]: item.startDate || '',
          [this.$t('common.deadline')]: item.deadline || '',
          [this.$t('common.status')]: item.status ? this.statuses.get(item.status)?.text || item.status : '',
          [this.$t('common.progress')]: `${this.progressPercentage(item.progress)}%`,
        }));
        const fileName = this.$t('governance.certification.campaigns');
        downloadAsType(exportData, format, `${fileName}.${format}`, fileName);
      } catch (error) {
        this.showErrorMessage(error, this.$t('governance.certificationTask.errors.exportError'));
      } finally {
        this.isExporting = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
:deep(#dropdown-status) {
  button {
    color: $black;
    padding-left: 0;
    padding-right: 0;
  }
}
.fr-filters-nav {
  h3 {
    font-size: 0.875rem;
  }
}
</style>
