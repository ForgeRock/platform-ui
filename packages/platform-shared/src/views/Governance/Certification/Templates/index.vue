<!-- Copyright 2023-2026 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BCard no-body>
    <BCardHeader class="p-0">
      <div class="btn-toolbar p-3 justify-content-between border-bottom-0">
        <div class="btn-group mb-2 mb-sm-0 mr-1">
          <BButton
            @click="createNewTemplate()"
            variant="primary">
            <FrIcon
              icon-class="mr-2"
              name="add">
              {{ $t('governance.templates.newTemplate') }}
            </FrIcon>
          </BButton>
        </div>
        <FrSearchInput
          v-model="searchQuery"
          :placeholder="$t('common.search')"
          @clear="clear"
          @search="search" />
      </div>
    </BCardHeader>
    <div v-if="isLoading">
      <FrSpinner class="py-5" />
    </div>
    <BTable
      v-else-if="templatesData.length"
      class="mb-0"
      v-resizable-table="{ persistKey: 'certification-templates' }"
      hover
      :per-page="pageSize"
      show-empty
      responsive
      :empty-text="$t('governance.templates.noData')"
      :items="templatesData"
      :fields="fields"
      :no-local-sorting="true"
      :sort-by="sortBy"
      :sort-desc="sortDesc"
      @row-clicked="onRowClick"
      @sort-changed="sortTemplates">
      <template #cell(name)="{ item }">
        <BMedia
          class="align-items-center"
          no-body>
          <BMediaBody class="align-self-center">
            <h3 class="h5 m-0">
              {{ item.name }}
            </h3>
            <small class="text-muted">
              {{ $t(`governance.editTemplate.templateType.${item.certificationType}`) }}
            </small>
          </BMediaBody>
        </BMedia>
      </template>
      <template #cell(status)="{ item }">
        <BBadge
          v-if="item.status === 'pending'"
          class="w-100"
          variant="light">
          <span>{{ $t('governance.templates.unused') }}</span>
        </BBadge>
        <BBadge
          v-else-if="item.status === 'active'"
          class="w-100"
          variant="success">
          <span>{{ $t('common.active') }}</span>
        </BBadge>
      </template>
      <template #cell(nextRunDate)="{ item }">
        <span
          v-if="item.schedule"
          class="text-dark">
          {{ formatDate(item.schedule.nextRunDate) }}
        </span>
        <span
          v-else
          class="text-muted">
          {{ blankValueIndicator }}
        </span>
      </template>
      <template #cell(actions)="{ item, index }">
        <FrActionsCell
          :test-id="'certification-template-' + index"
          :edit-option="false"
          duplicate-option
          :divider="isStatusPending(item)"
          :delete-option="isStatusPending(item)"
          @duplicate-clicked="duplicateTemplate(item)"
          @delete-clicked="openDeleteModal(item.id)">
          <template #custom-top-actions>
            <BDropdownItem
              @click="openRunModal(item.id)">
              <FrIcon
                icon-class="mr-2"
                name="play_arrow">
                {{ $t('governance.templates.runNow') }}
              </FrIcon>
            </BDropdownItem>
            <BDropdownItem
              v-if="item.status === 'pending'"
              @click="editTemplate(item)">
              <FrIcon
                icon-class="mr-2"
                name="edit">
                {{ $t('governance.templates.editTemplate') }}
              </FrIcon>
            </BDropdownItem>
            <BDropdownItem
              v-if="item.status === 'active'"
              @click="openScheduleModal(item.id, item.schedule)">
              <FrIcon
                icon-class="mr-2"
                name="calendar_today">
                {{ item.scheduleId ? $t('governance.templates.editSchedule') : $t('governance.templates.scheduleCampaign') }}
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
      data-testid="templates-no-data"
      icon="inbox"
      :subtitle="$t('governance.templates.noTemplates')" />
    <FrPagination
      v-if="totalRows"
      :value="paginationPage"
      :total-rows="totalRows"
      :per-page="pageSize"
      @input="paginationChange"
      @on-page-size-change="pageSizeChange" />
    <FrRunTemplateModal @run-published-template="runTemplate" />
    <FrTemplateTypeModal />
    <FrScheduleTemplateModal
      :template-id="rowTemplateSelectedId"
      :template-schedule="rowTemplateSelectedSchedule"
      @load-template-list="search" />
    <FrDeleteModal
      :is-deleting="isDeleting"
      :translated-item-type="$t('governance.templates.template')"
      @delete-item="deleteTemplate" />
  </BCard>
</template>
<script>
import {
  BBadge,
  BButton,
  BCard,
  BCardHeader,
  BMedia,
  BMediaBody,
  BDropdownItem,
  BTable,
} from 'bootstrap-vue';
import dayjs from 'dayjs';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrDeleteModal from '@forgerock/platform-shared/src/components/DeleteModal';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import useCertification from '@forgerock/platform-shared/src/composables/certification';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import {
  deleteTemplate,
  duplicateTemplate,
  getTemplateList,
  runPublishedTemplate,
} from '@forgerock/platform-shared/src/api/governance/TemplateApi';
import FrRunTemplateModal from '@forgerock/platform-shared/src/views/Governance/Certification/Templates/modals/RunTemplateModal';
import FrTemplateTypeModal from '@forgerock/platform-shared/src/views/Governance/Certification/Templates/modals/TemplateTypeModal';
import FrScheduleTemplateModal from '@forgerock/platform-shared/src/views/Governance/Certification/Templates/modals/ScheduleTemplateModal';
import { types } from './templateTypes';

export default {
  name: 'Templates',
  components: {
    BBadge,
    BButton,
    BCard,
    BCardHeader,
    BDropdownItem,
    BMedia,
    BMediaBody,
    BTable,
    FrActionsCell,
    FrDeleteModal,
    FrIcon,
    FrTemplateTypeModal,
    FrNoData,
    FrPagination,
    FrRunTemplateModal,
    FrScheduleTemplateModal,
    FrSearchInput,
    FrSpinner,
  },
  mixins: [NotificationMixin],
  setup() {
    const { setTemplate } = useCertification();
    return { setTemplate };
  },
  data() {
    return {
      blankValueIndicator,
      searchQuery: '',
      currentPage: 1,
      sortDesc: false,
      sortBy: 'name',
      totalRows: 0,
      mainPageNumber: 1,
      pageSize: 10,
      templatesData: [],
      isLoading: false,
      isDeleting: false,
      paginationPage: 1,
      rowTemplateSelectedId: null,
      rowTemplateSelectedSchedule: null,
      fields: [
        {
          key: 'name',
          label: this.$t('common.name'),
          sortable: true,
          class: 'w-50 text-truncate',
        },
        {
          key: 'nextRunDate',
          label: this.$t('governance.templates.nextRunDate'),
          sortable: false,
          class: 'w-25 text-truncate',
        },
        {
          key: 'status',
          label: this.$t('governance.templates.status'),
          sortable: true,
          class: 'w-140px',
        },
        {
          key: 'actions',
          label: this.$t('common.actions'),
          sortable: false,
          class: 'w-100px fr-no-resize sticky-right',
        }],
    };
  },
  mounted() {
    this.getTemplateData(this.paginationPage);
  },
  methods: {
    createNewTemplate() {
      this.$bvModal.show('CampaignTemplateTypeModal');
    },
    clear() {
      this.searchQuery = '';
      this.search();
    },
    formatDate(date) {
      return dayjs(date).format('MMM D, YYYY');
    },
    /**
     * Reload the event data based on a search query
     * @param {String} query the query to search with
     */
    sortTemplates({ sortBy }) {
      this.sortBy = sortBy;
      this.sortDesc = !this.sortDesc;
      this.getTemplateData(this.mainPageNumber);
    },
    /**
     * Reload the event data based on a search query
     * @param {String} query the query to search with
     */
    search() {
      this.currentPage = this.mainPageNumber;
      this.getTemplateData(this.currentPage);
    },
    pageSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.getTemplateData(1);
    },
    paginationChange(page) {
      this.paginationPage = page;
      this.getTemplateData(this.paginationPage);
    },
    loadTemplateList(resourceData, page) {
      this.totalRows = resourceData.data.totalHits;
      this.currentPage = page;
      this.templatesData = resourceData.data.result;
    },
    buildUrlParams(queryString, pageNumber, sortBy, sortDesc) {
      const managedResourceParams = {
        queryString,
        pageSize: this.pageSize,
        pageNumber: pageNumber - 1,
        sortBy,
        sortDesc,
      };

      return managedResourceParams;
    },
    getTemplateData(currentPage) {
      this.isLoading = true;
      const urlParams = this.buildUrlParams(this.searchQuery, currentPage, this.sortBy, this.sortDesc);
      getTemplateList(urlParams).then((resourceData) => this.loadTemplateList(resourceData, currentPage)).catch((error) => {
        this.showErrorMessage(error, this.$t('governance.templates.errors.errorSavingTemplate'));
      }).finally(() => {
        this.isLoading = false;
      });
    },
    isStatusPending(item) {
      return item.status === 'pending';
    },
    openDeleteModal(templateId) {
      this.rowTemplateSelectedId = templateId;
      this.$bvModal.show('deleteModal');
    },
    openRunModal(templateId) {
      this.rowTemplateSelectedId = templateId;
      this.$bvModal.show('runPublishedTemplateModal');
    },
    openScheduleModal(templateId, templateSchedule) {
      this.rowTemplateSelectedId = templateId;
      this.rowTemplateSelectedSchedule = templateSchedule;
      this.$bvModal.show('scheduleTemplateFormModal');
    },
    deleteTemplate() {
      this.isDeleting = true;
      deleteTemplate(this.rowTemplateSelectedId)
        .then(() => {
          this.displayNotification('success', this.$t('governance.templates.notifications.deleteSuccess'));
          this.getTemplateData(this.mainPageNumber);
        })
        .catch((err) => {
          this.showErrorMessage(
            err,
            this.$t('governance.templates.errors.errorDeletingTemplate'),
          );
        })
        .finally(() => {
          this.$bvModal.hide('deleteModal');
          this.isDeleting = false;
          this.rowTemplateSelectedId = null;
          this.paginationPage = this.mainPageNumber;
        });
    },
    duplicateTemplate(template) {
      this.isLoading = true;
      this.rowTemplateSelectedId = template.id;
      duplicateTemplate(this.rowTemplateSelectedId)
        .then(() => {
          this.displayNotification('success', this.$t('governance.templates.notifications.savingSuccess'));
          getTemplateList({ queryString: `${template.name} (copy)` }).then(({ data }) => {
            if (data?.result?.length) this.editTemplate(data.result[0]);
          });
        })
        .catch((err) => {
          this.showErrorMessage(
            err,
            this.$t('governance.templates.errors.errorSavingTemplate'),
          );
        })
        .finally(() => {
          this.isLoading = false;
          this.rowTemplateSelectedId = null;
        });
    },
    runTemplate() {
      this.isLoading = true;
      this.$bvModal.hide('runPublishedTemplateModal');
      const params = {
        templateId: this.rowTemplateSelectedId,
      };

      runPublishedTemplate(params).then(() => {
        this.getTemplateData(this.mainPageNumber);
        this.displayNotification('success', this.$t('governance.templates.notifications.savingSuccess'));
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('governance.templates.errors.errorSavingTemplate'));
      }).finally(() => {
        this.isLoading = false;
        this.rowTemplateSelectedId = null;
      });
    },
    onRowClick(event) {
      if (event.status !== 'active') this.editTemplate(event);
    },
    editTemplate(template) {
      this.setTemplate(template);
      this.$router.push({
        name: 'CertificationTemplate',
        params: {
          type: types[template.certificationType.toUpperCase()],
        },
      });
    },
  },
};
</script>
