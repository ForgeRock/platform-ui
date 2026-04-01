<!-- Copyright 2023-2026 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <BCard no-body>
      <BCardHeader class="p-0">
        <div class="btn-toolbar justify-content-between p-3 border-bottom-0">
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
                :key="key"
                v-if="!statusObj.sortHide"
                @click="handleStatusSort(statusObj)">
                {{ statusObj.text }}
              </BDropdownItem>
            </template>
          </BDropdown>
        </div>
      </BCardHeader>
      <FrSpinner
        v-if="tableLoading"
        class="py-5" />
      <BTable
        v-else-if="accessReviewList.length"
        class="mb-0"
        v-resizable-table="{ persistKey: 'certification-campaigns' }"
        hover
        responsive
        tbody-tr-class="cursor-pointer"
        :fields="fields"
        :items="accessReviewList"
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
            :empty-color="styles.brightGray"
            :size="50">
            <template #count="{ count }">
              <small class="font-weight-bold mb-0">
                {{ count.currentValue }}%
              </small>
            </template>
          </FrCircleProgressBar>
        </template>
        <template #cell(edit)="{ item }">
          <FrActionsCell
            :edit-option="false"
            :delete-option="false"
            :divider="false">
            <template #custom-top-actions>
              <template v-if="(isActiveLikeStatus || isClosedLikeStatus)">
                <BDropdownItem @click="navigateToEdit(item)">
                  <FrIcon
                    icon-class="mr-2"
                    name="article">
                    {{ $t('common.viewDetails') }}
                  </FrIcon>
                </BDropdownItem>
              </template>
              <template v-if="isActiveLikeStatus">
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
              <template v-if="isStagedStatus">
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
        :subtitle="$t('governance.certification.noCampaigns', { type: statusSort.text })" />
      <FrPagination
        v-if="totalRows"
        :value="currentPage"
        :total-rows="totalRows"
        :per-page="pageSize"
        @input="paginationChange"
        @on-page-size-change="pageSizeChange" />
    </BCard>
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
    <FrUpdateDeadlineModal
      :loading="isRequestLoading"
      :current-deadline="currentDeadline"
      @update-deadline="updateCampaignDeadline"
      @close-modal="closeModal" />
    <FrCampaignDetailsModal
      :campaign="creatingCampaign"
      @close="creatingCampaign = {}" />
  </div>
</template>

<script>
import { startCase } from 'lodash';
import { Field as VeeField } from 'vee-validate';
import {
  BBadge,
  BButton,
  BCard,
  BCardHeader,
  BDropdown,
  BDropdownDivider,
  BDropdownItem,
  BMedia,
  BMediaBody,
  BModal,
  BTable,
} from 'bootstrap-vue';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrCircleProgressBar from '@forgerock/platform-shared/src/components/CircleProgressBar';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import {
  getAdminCertificationItems,
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
import { CampaignStates } from '@forgerock/platform-shared/src/utils/governance/types';
import styles from '@/scss/main.scss';
import FrUpdateDeadlineModal from './CampaignDetails/CampaignOverview/UpdateDeadlineModal';
import FrCampaignDetailsModal from './CampaignDetailsModal';

export default {
  name: 'Campaigns',
  components: {
    BBadge,
    BButton,
    BCard,
    BCardHeader,
    BDropdown,
    BDropdownDivider,
    BDropdownItem,
    BMedia,
    BMediaBody,
    BModal,
    BTable,
    FrActionsCell,
    FrButtonWithSpinner,
    FrCampaignDetailsModal,
    FrCircleProgressBar,
    FrIcon,
    FrNoData,
    FrPagination,
    FrSpinner,
    FrUpdateDeadlineModal,
    VeeField,
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
      styles,
      totalRows: 0,
      tableLoading: true,
      sortDesc: false,
      selectedCertId: null,
      accessReviewList: [],
      isRequestLoading: false,
      modalType: null,
      currentDeadline: '',
      fields: [
        {
          key: 'name',
          label: this.$t('common.name'),
          sortable: true,
        },
        {
          key: 'formattedStartDate',
          label: this.$t('common.startDate'),
          sortable: true,
        },
        {
          key: 'formattedDeadline',
          class: 'w-140px',
          label: this.$t('common.deadline'),
          sortable: true,
        },
        {
          key: 'status',
          class: 'w-140px',
          label: this.$t('common.status'),
        },
        {
          key: 'progress',
          class: 'w-140px',
          label: this.$t('common.progress'),
        },
        {
          key: 'edit',
          class: 'w-120px fr-no-resize sticky-right',
          label: this.$t('common.actions'),
        }],
    };
  },
  computed: {
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
    this.getList();
  },
  methods: {
    startCase,
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
      return getAdminCertificationItems(params);
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
</style>
