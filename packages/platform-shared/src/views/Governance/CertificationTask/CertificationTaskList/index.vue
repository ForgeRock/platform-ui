<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div class="d-flex justify-content-between certification-task-list_controls">
      <div class="d-flex justify-content-start">
        <template v-if="campaignDetails.allowBulkCertify">
          <BButton
            variant="link-dark">
            <FrIcon name="done_all" />
          </BButton>
          <BDropdown
            toggle-class="p-1"
            variant="link">
            <template #button-content>
              <label class="text-secondary mb-0">
                {{ $t('governance.certificationTask.select') }}
              </label>
              {{ languageSelected }}
            </template>
            <BDropdownItem
              @click="selectTask(true, true)">
              {{ $t('governance.certificationTask.selectAllTasks') }}
            </BDropdownItem>
            <BDropdownItem
              @click="selectTask(true)">
              {{ $t('governance.certificationTask.selectAllTasksThisPage') }}
            </BDropdownItem>
            <BDropdownDivider />
            <BDropdownItem
              @click="selectTask(false)">
              {{ $t('governance.certificationTask.deselectAll') }}
            </BDropdownItem>
          </BDropdown>
        </template>
        <BDropdown
          v-if="selectedTasks.length"
          toggle-class="p-1"
          variant="link">
          <template #button-content>
            <BButton
              variant="none"
              class="text-decoration-none pr-2 border-left">
              {{ $t('common.actions') }}
            </BButton>
          </template>
          <BDropdownItem
            v-if="enableBulkCertify"
            @click="saveCertifyBulkAction">
            <FrIcon
              class="mr-2"
              name="check" />
            {{ $t('governance.certificationTask.actions.certify') }}
          </BDropdownItem>
          <BDropdownItem
            v-if="enableBulkRevoke"
            @click="openActionConfirmationModal(revokeActionModalProps)">
            <FrIcon
              class="mr-2"
              name="block" />
            {{ $t('governance.certificationTask.actions.revoke') }}
          </BDropdownItem>
          <BDropdownItem
            v-if="enableBulkException"
            @click="openActionConfirmationModal(exceptionActionModalProps)">
            <FrIcon
              class="mr-2"
              name="schedule" />
            {{ $t('governance.certificationTask.actions.allowException') }}
          </BDropdownItem>
          <BDropdownDivider v-if="(enableBulkCertify || enableBulkRevoke || enableBulkException) && (enableBulkReassign || enableBulkForward)" />
          <BDropdownItem
            v-if="enableBulkReassign"
            @click="showReassignBulkActionModal()">
            <FrIcon
              class="mr-2"
              name="supervisor_account" />
            {{ $t('governance.certificationTask.actions.reassign') }}
          </BDropdownItem>
          <BDropdownItem
            v-if="enableBulkForward"
            @click="openForwardCertificationModal(null, true)">
            <FrIcon
              class="mr-2"
              name="redo" />
            {{ $t('governance.certificationTask.actions.forward') }}
          </BDropdownItem>
        </BDropdown>
      </div>
      <div>
        <BButton
          variant="link-dark"
          class="mr-2"
          @click="setFiltersView()">
          <FrIcon name="filter_list" />
        </BButton>
        <BButton
          variant="link-dark"
          class="mr-2"
          @click="openCertificationTaskSortModal()">
          <FrIcon
            outlined
            name="view_column" />
        </BButton>
      </div>
    </div>
    <div v-show="showFiltersSection">
      <FrCertificationTaskListFilters
        :cert-id="campaignId"
        :actor-id="actorId"
        @filter-certification-items="filterCertificationItems" />
    </div>
    <div v-if="isLoading">
      <FrSpinner class="py-5" />
    </div>
    <BTable
      v-else-if="tasksData.length"
      class="m-0 border-top border-bottom task-list-table"
      :fields="certificationListColumnsToShow"
      :items="tasksData"
      :per-page="pageSize"
      show-empty
      responsive>
      <template #cell(selector)="{ item }">
        <FrField
          v-if="item.decision.certification.status !== 'signed-off'"
          class="m-4"
          :value="item.selected"
          @change="addIndividualTaskToSelected($event, item)"
          name="columnSelected"
          type="checkbox" />
      </template>
      <template #cell(user)="{ item }">
        <div class="d-flex justify-content-start align-items-center">
          <BMedia
            class="clickable"
            @click="openUserModal(item.id)">
            <template #aside>
              <BImg
                class="mt-2"
                height="24"
                width="24"
                :alt="item.text"
                :aria-hidden="true"
                :src="item.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
            </template>
            <div
              class="media-body">
              <h5
                class="mb-0 text-dark text-truncate">
                {{ item.user.givenName }}
              </h5>
              <small class="text-truncate">
                {{ item.user.userName }}
              </small>
            </div>
          </BMedia>
        </div>
      </template>
      <template #cell(application)="{ item }">
        <div class="d-flex justify-content-between align-items-center">
          <BMedia
            class="clickable align-items-center"
            no-body
            @click="openApplicationModal(item.application, item.applicationOwner)">
            <BImg
              class="mr-4"
              width="28"
              height="28"
              :src="getApplicationLogo(item.application)"
              :alt="$t('common.logo')" />
            <div class="media-body align-self-center overflow-hidden text-nowrap">
              <span class="text-dark">
                {{ item.application.name }}
              </span>
            </div>
          </BMedia>
        </div>
      </template>
      <template #cell(entitlement)="{ item }">
        <div class="d-flex justify-content-between align-items-center">
          <BButton
            class="text-dark"
            variant="link"
            @click="openEntitlementModal(item)">
            {{ item.entitlement.__NAME__ }}
          </BButton>
        </div>
      </template>
      <template #cell(account)="{ item }">
        <div class="d-flex justify-content-between align-items-center">
          <BButton
            class="text-dark"
            data-testid="account-cell"
            variant="link"
            @click="openAccountModal(item)">
            {{ item.account.__NAME__ || item.account.mailNickname }}
          </BButton>
        </div>
      </template>
      <template #cell(comments)="{ item }">
        <div
          class="d-flex justify-content-start align-items-center"
          v-if="getNumberOfComments(item)">
          <BButton
            class="text-dark position-relative py-0"
            variant="link"
            @click="openCommentsModal(item.decision.certification.comments, item)">
            <FrIcon
              class="md-24"
              name="chat_bubble_outline" />
            <BBadge
              variant="danger"
              pill
              class="mr-1 position-absolute comments-counter">
              {{ getNumberOfComments(item) }}
            </BBadge>
          </BButton>
        </div>
      </template>
      <template #cell(actions)="{ item }">
        <template v-if="item.decision.certification.status === 'signed-off'">
          <BBadge
            :variant="getVariant(item.decision.certification.decision)"
            class="w-100">
            {{ startCase(item.decision.certification.decision) }}
          </BBadge>
        </template>
        <div
          v-else
          class="d-flex justify-content-end align-items-center">
          <!-- Certify -->
          <template v-if="item.permissions.certify">
            <BButton
              style="height: 30px; width: 35px; padding: 0px;"
              :id="`btnCertify-${item.id}`"
              :pressed="pressedButton(item, 'certify')"
              class="mr-1"
              variant="outline-success"
              @click="handleAction('certify', item)">
              <FrIcon name="check" />
            </BButton>
            <BTooltip
              :target="`btnCertify-${item.id}`"
              triggers="hover"
              placement="top">
              {{ $t('governance.certificationTask.actions.certify') }}
            </BTooltip>
          </template>
          <!-- Revoke -->

          <template v-if="item.permissions.revoke">
            <BButton
              style="height: 30px; width: 35px; padding: 0px;"
              :id="`btnRevoke-${item.id}`"
              :pressed="pressedButton(item, 'revoke')"
              class="mr-1"
              variant="outline-danger"
              @click="handleAction('revoke', item, lineRevokeActionModalProps)">
              <FrIcon name="block" />
            </BButton>
            <BTooltip
              :target="`btnRevoke-${item.id}`"
              triggers="hover"
              placement="top">
              {{ $t('governance.certificationTask.actions.revoke') }}
            </BTooltip>
          </template>

          <!-- Allow exception -->
          <template v-if="campaignDetails.exceptionDuration > 0 && item.permissions.exception">
            <BButton
              style="height: 30px; width: 35px; padding: 0px;"
              :id="`btnAllowException-${item.id}`"
              :pressed="pressedButton(item, 'exception')"
              class="mr-2"
              variant="outline-secondary"
              @click="handleAction('exception', item, lineExceptionActionModalProps)">
              <FrIcon name="schedule" />
            </BButton>
            <BTooltip
              :target="`btnAllowException-${item.id}`"
              triggers="hover"
              placement="top">
              {{ $t('governance.certificationTask.actions.allowException') }}
            </BTooltip>
          </template>

          <BDropdown
            no-caret
            boundary="window"
            toggle-class="p-1"
            variant="link">
            <template #button-content>
              <FrIcon
                class="text-dark md-24"
                name="more_horiz" />
            </template>
            <BDropdownItem
              v-if="campaignDetails.enableForward && item.permissions.forward"
              @click="openForwardCertificationModal(item.id, false)">
              <FrIcon
                class="mr-2"
                name="redo" />
              {{ $t('governance.certificationTask.actions.forward') }}
            </BDropdownItem>
            <BDropdownItem
              @click="openReviewersModal(item)">
              <FrIcon
                class="mr-2"
                name="group" />
              {{ $t('governance.certificationTask.actions.viewReviewers') }}
            </BDropdownItem>
            <BDropdownItem
              v-if="item.permissions.comment"
              @click="openAddCommentModal(item.id)">
              <FrIcon
                class="mr-2"
                name="mode_comment" />
              {{ $t('governance.certificationTask.actions.addComment') }}
            </BDropdownItem>
            <BDropdownItem
              @click="openActivityModal(item)">
              <FrIcon
                class="mr-2"
                name="article" />
              {{ $t('governance.certificationTask.actions.viewActivity') }}
            </BDropdownItem>
          </BDropdown>
        </div>
      </template>
    </BTable>
    <FrNoData
      v-else
      :card="false"
      class="mb-4"
      data-testid="cert-task-list-no-data"
      icon="inbox"
      :subtitle="$t('governance.certificationTask.noItems')" />
    <BPagination
      v-if="totalRows > pageSize"
      v-model="paginationPage"
      class="py-3 justify-content-center pagination-material-buttons"
      :per-page="pageSize"
      :total-rows="totalRows"
      @input="paginationChange" />

    <!-- Modal -->
    <FrCertificationTaskSortModal
      @update-columns="updateColumns"
      :task-list-columns="tasksFieldsToSort" />
    <FrCertificationForwardModal
      :id="currentItemTaskId"
      :bulk="bulkForward"
      @forward-item="forwardItem"
      @forward-bulk="saveForwardBulkAction" />
    <FrCertificationTaskActionConfirmModal
      :modal-options="actionConfirmationModalProps" />
    <FrCertificationTaskReassignModal
      @change-saving="toggleSaving"
      :campaign-id="campaignId"
      :selected-tasks="selectedTasks" />
    <FrCertificationTaskUserModal
      :user="currentUserSelectedModal" />
    <FrCertificationTaskApplicationModal
      v-if="currentApplicationSelectedModal"
      :application="currentApplicationSelectedModal" />
    <FrCertificationTaskAccountModal
      v-if="currentAccountSelectedModal"
      :account="currentAccountSelectedModal"
      :content="contentAccountSelectedModal" />
    <FrCertificationTaskCommentsModal
      :enable-add-comments="enableAddComments"
      :comments="currentCommentsSelectedModal"
      @open-add-comment-modal="openAddCommentModalFromCommentsModal"
      @close-modal="closeCertificationCommentsModal" />
    <FrCertificationTaskAddCommentModal @add-comment="addComment" />
    <FrCertificationActivityModal
      :activity="currentLineItemActivity"
      @close-modal="closeActivityModal" />
    <FrCertificationTaskReviewersModal
      :reviewers="currentReviewersSelectedModal"
      :hide-creation-button="!currentLineItemReassignPermission"
      @open-edit-reviewer-modal="openEditReviewerModal"
      @delete-reviewer="deleteReviewer" />
    <FrCertificationTaskEditReviewerModal
      :reviewer="currentReviewerSelectedModal"
      :is-saving="isSavingReviewer"
      :is-deleting="isDeletingReviewer"
      :is-allowed-deletion="currentReviewerSelectedModal && currentReviewersSelectedModal.length > 1 && !isLastSignOffReviewer()"
      @close-modal="closeEditReviewerModal"
      @edit-reviewer="editReviewer"
      @delete-reviewer="deleteReviewer" />
    <FrCertificationTaskEntitlementModal
      :entitlement="currentEntitlementSelected"
      :application="currentApplicationSelectedModal" />
  </div>
</template>
<script>
import {
  BBadge,
  BButton,
  BDropdown,
  BDropdownDivider,
  BDropdownItem,
  BImg,
  BMedia,
  BPagination,
  BTable,
  BTooltip,
} from 'bootstrap-vue';
import {
  cloneDeep,
  countBy,
  filter,
  get,
  pick,
  startCase,
} from 'lodash';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrCertificationTaskSortModal from '@forgerock/platform-shared/src/views/Governance/CertificationTask/CertificationTaskSortModal';
import FrCertificationForwardModal from '@forgerock/platform-shared/src/views/Governance/CertificationTask/CertificationForwardModal';
import FrCertificationTaskListFilters from '@forgerock/platform-shared/src/views/Governance/CertificationTask/CertificationTaskListFilters';
import FrCertificationTaskReassignModal from '@forgerock/platform-shared/src/views/Governance/CertificationTask/CertificationTaskReassignModal';
import FrCertificationTaskActionConfirmModal from '@forgerock/platform-shared/src/views/Governance/CertificationTask/CertificationTaskActionConfirmModal';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import AppSharedUtilsMixin from '@forgerock/platform-shared/src/mixins/AppSharedUtilsMixin';
import {
  certifyCertificationTasks,
  certifyLineItem,
  exceptionCertificationTasks,
  exceptionLineItem,
  forwardCertificationTasks,
  forwardLineItem,
  getCertificationLineItemUser,
  getCertificationTasksListByCampaign,
  getCertificationCountsByCampaign,
  getCertificationTaskAccountDetails,
  resetLineItem,
  revokeCertificationTasks,
  revokeLineItem,
  saveComment,
  reassignLineItem,
  updateLineItemReviewers,
  getCertificationEntitlementDetails,
} from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import FrCertificationActivityModal from './CertificationTaskActivityModal';
import FrCertificationTaskAccountModal from './CertificationTaskAccountModal';
import FrCertificationTaskAddCommentModal from './CertificationTaskAddCommentModal';
import FrCertificationTaskApplicationModal from './CertificationTaskApplicationModal';
import FrCertificationTaskCommentsModal from './CertificationTaskCommentsModal';
import FrCertificationTaskUserModal from './CertificationTaskUserModal';
import FrCertificationTaskReviewersModal from './CertificationTaskReviewersModal';
import FrCertificationTaskEditReviewerModal from './CertificationTaskEditReviewerModal';
import FrCertificationTaskEntitlementModal from './CertificationTaskEntitlementModal';

/**
 * @typedef {"certify" | "revoke" | "exception" | "abstain"} ItemDecisionString
 */

/**
 * @typedef {"revoke" | "allow-exception" | "forward" } lineItemAction
 */

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
  'adminOfOrg',
  'aliasList',
  'city',
  'country',
  'description',
  'lastSync',
  'manager',
  'postalAddress',
  'postalCode',
  'stateProvince',
  'telephoneNumber',
];

export default {
  name: 'CertificationTaskList',
  components: {
    BBadge,
    BButton,
    BDropdown,
    BDropdownDivider,
    BDropdownItem,
    BImg,
    BMedia,
    BPagination,
    BTable,
    BTooltip,
    FrCertificationActivityModal,
    FrCertificationForwardModal,
    FrCertificationTaskAccountModal,
    FrCertificationTaskActionConfirmModal,
    FrCertificationTaskAddCommentModal,
    FrCertificationTaskApplicationModal,
    FrCertificationTaskCommentsModal,
    FrCertificationTaskEditReviewerModal,
    FrCertificationTaskEntitlementModal,
    FrCertificationTaskListFilters,
    FrCertificationTaskReassignModal,
    FrCertificationTaskReviewersModal,
    FrCertificationTaskSortModal,
    FrCertificationTaskUserModal,
    FrField,
    FrIcon,
    FrNoData,
    FrSpinner,
  },
  mixins: [
    AppSharedUtilsMixin,
    NotificationMixin,
  ],
  props: {
    campaignDetails: {
      type: Object,
      default: () => {},
    },
    /**
     * this is the governance certification campaign selected
    */
    actorId: {
      type: String,
      default: '',
    },
    campaignId: {
      type: String,
      default: null,
    },
    refreshTasks: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    showEntitlementColumn: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const revokeActionModalProps = {
      title: 'revokeTitle',
      description: 'revokeDescription',
      placeHolder: 'revokePlaceHolder',
      okLabel: 'revokeTitle',
      okFunction: this.saveRevokeCertificationTasks,
    };
    const exceptionActionModalProps = {
      title: 'exceptionTitle',
      description: 'exceptionDescription',
      placeHolder: 'exceptionPlaceHolder',
      okLabel: 'exceptionTitle',
      okFunction: this.saveAllowExceptionBulkAction,
    };

    return {
      listFilters: null,
      contentAccountSelectedModal: {},
      currentAccountSelectedModal: null,
      currentApplicationSelectedModal: null,
      currentCommentsSelectedModal: [],
      currentLineItemActivity: [],
      currentLineItemIdSelectedModal: null,
      currentLineItemReassignPermission: false,
      currentPage: 1,
      currentReviewerSelectedModal: null,
      currentReviewersSelectedModal: [],
      currentUserSelectedModal: {},
      enableAddComments: true,
      sortDesc: false,
      sortBy: 'user.givenName',
      totalRows: 0,
      mainPageNumber: 1,
      pageSize: 10,
      tasksData: [],
      selectedTasks: [],
      isAllSelected: false,
      isLoading: false,
      isDeleting: false,
      isSavingReviewer: false,
      isDeletingReviewer: false,
      paginationPage: 1,
      rowTemplateSelectedId: null,
      certificationListColumns: [],
      languageSelected: '',
      showFiltersSection: false,
      currentItemTaskId: '',
      revokeActionModalProps,
      exceptionActionModalProps,
      actionConfirmationModalProps: {},
      lineRevokeActionModalProps: {
        ...revokeActionModalProps,
        description: 'revokeInlineItemDescription',
        okFunction: this.saveRevokeLineItemAction,
      },
      lineExceptionActionModalProps: {
        ...exceptionActionModalProps,
        description: 'exceptionInlineItemDescription',
        okFunction: this.saveAllowExceptionLineItemAction,
      },
      bulkForward: false,
      tasksFieldsToSort: [],
      currentEntitlementSelected: null,
    };
  },
  computed: {
    certificationListColumnsToShow() {
      return this.certificationListColumns.filter((col) => col.show);
    },
    tasksFields() {
      const fields = [
        {
          key: 'user',
          label: this.$t('governance.certificationTask.user'),
          sortable: true,
          class: 'text-truncate fr-access-cell',
          show: true,
        },
        {
          key: 'application',
          label: this.$t('governance.certificationTask.application'),
          sortable: true,
          class: 'text-truncate fr-access-cell',
          show: true,
        },
        {
          key: 'entitlement',
          label: this.$t('governance.certificationTask.entitlement'),
          sortable: false,
          class: 'text-truncate fr-access-cell',
          show: true,
        },
        {
          key: 'account',
          label: this.$t('governance.certificationTask.account'),
          sortable: false,
          class: 'text-truncate fr-access-cell',
          show: true,
        },
        {
          key: 'comments',
          label: this.$t('governance.certificationTask.comments'),
          sortable: false,
          class: 'w-140px fr-access-cell',
          show: true,
        },
        {
          key: 'actions',
          class: 'w-208px border-left fr-access-cell',
          label: '',
          sortable: false,
          show: true,
        },
      ];

      if (!this.showEntitlementColumn) {
        const entitlementColumnIndex = fields.findIndex((column) => (column.key === 'entitlement'));
        fields.splice(entitlementColumnIndex, 1);
      }

      if (this.campaignDetails.allowBulkCertify) {
        fields.unshift({
          key: 'selector',
          label: '',
          sortable: false,
          class: 'selector-cell',
          show: true,
        });
      }

      return fields;
    },
    enableBulkCertify() {
      return this.selectedTasks.findIndex((task) => task.permissions?.certify === false) === -1;
    },
    enableBulkRevoke() {
      return this.selectedTasks.findIndex((task) => task.permissions?.revoke === false) === -1;
    },
    enableBulkException() {
      if (this.campaignDetails.exceptionDuraion === 0) return false;
      return this.selectedTasks.findIndex((task) => task.permissions?.exception === false) === -1;
    },
    enableBulkReassign() {
      if (!this.campaignDetails.enableReassign) return false;
      return this.selectedTasks.findIndex((task) => task.permissions?.reassign === false) === -1;
    },
    enableBulkForward() {
      if (!this.campaignDetails.enableForward) return false;
      return this.selectedTasks.findIndex((task) => task.permissions?.forward === false) === -1;
    },
  },
  methods: {
    startCase,
    toggleSaving() {
      this.$emit('change-saving');
    },
    filterCertificationItems(filters) {
      this.listFilters = {
        ...filters,
      };
      this.getCertificationTaskList(this.paginationPage);
    },
    getNumberOfComments(task) {
      const activity = task?.decision?.certification?.comments;
      const activityByAction = countBy(activity, (item) => item.action);
      return activityByAction?.comment || 0;
    },
    openAccountModal(content) {
      this.currentAccountSelectedModal = {
        account: content.account,
        decision: content.item.decision.certification.decision,
        decisionDate: content.item.decision.certification.decisionDate,
        decisionBy: content.item.decision.certification.decisionBy,
      };
      this.contentAccountSelectedModal = cloneDeep(content.account);
      delete this.contentAccountSelectedModal?.metadata;
      delete this.contentAccountSelectedModal?.proxyAddresses;
      this.$nextTick(() => {
        this.$root.$emit('bv::show::modal', 'CertificationTaskAccountModal');
      });
    },
    openAddCommentModal(lineItemId) {
      this.currentLineItemIdSelectedModal = lineItemId;
      this.$root.$emit('bv::show::modal', 'CertificationTaskAddCommentModal');
    },
    openAddCommentModalFromCommentsModal() {
      this.$root.$emit('bv::hide::modal', 'CertificationTaskCommentsModal');
      this.$root.$emit('bv::show::modal', 'CertificationTaskAddCommentModal');
    },
    openApplicationModal(application, applicationOwners) {
      this.currentApplicationSelectedModal = {
        ...application,
        applicationOwners,
      };
      this.$nextTick(() => {
        this.$root.$emit('bv::show::modal', 'CertificationTaskApplicationModal');
      });
    },
    openEntitlementModal({ id, application }) {
      getCertificationEntitlementDetails(this.campaignId, id).then(({ data }) => {
        this.currentApplicationSelectedModal = application;
        this.currentEntitlementSelected = data;
        this.$root.$emit('bv::show::modal', 'CertificationTaskEntitlementModal');
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('governance.certificationTask.entitlementModal.loadErrorMessage'));
        this.currentEntitlementSelected = null;
        this.currentApplicationSelectedModal = null;
      });
    },
    openCommentsModal(activity, lineItem) {
      this.enableAddComments = lineItem.permissions?.comment;
      const comments = filter(activity, { action: 'comment' });
      this.currentCommentsSelectedModal = comments;
      this.currentLineItemIdSelectedModal = lineItem.id;
      this.$nextTick(() => {
        this.$root.$emit('bv::show::modal', 'CertificationTaskCommentsModal');
      });
    },
    closeCertificationCommentsModal() {
      this.currentCommentsSelectedModal = [];
    },
    openReviewersModal({ id, decision: { certification: { actors } }, permissions: { reassign } }) {
      this.currentLineItemIdSelectedModal = id;
      this.currentReviewersSelectedModal = actors;
      this.currentLineItemReassignPermission = reassign;
      this.$root.$emit('bv::show::modal', 'CertificationTaskReviewersModal');
    },
    openEditReviewerModal(reviewer) {
      this.currentReviewerSelectedModal = reviewer;
      this.$root.$emit('bv::hide::modal', 'CertificationTaskReviewersModal');
      this.$root.$emit('bv::show::modal', 'CertificationTaskEditReviewerModal');
    },
    closeEditReviewerModal() {
      this.currentReviewerSelectedModal = null;
      this.$root.$emit('bv::hide::modal', 'CertificationTaskEditReviewerModal');
      this.$root.$emit('bv::show::modal', 'CertificationTaskReviewersModal');
    },
    editReviewer(reviewerId, permissions, newReviewer) {
      this.isSavingReviewer = true;

      // Verify if the user already exists on current reviewers
      if (newReviewer && this.currentReviewersSelectedModal.some((reviewer) => reviewer.id === reviewerId)) {
        this.displayNotification('error', this.$t('governance.certificationTask.lineItemReviewersModal.editReviewerUserExistsErrorMessage'));
        this.isSavingReviewer = false;
        return;
      }

      // assign the permissions to the user
      reassignLineItem(this.campaignId, this.currentLineItemIdSelectedModal, reviewerId, permissions).then(() => {
        let messageKey = 'governance.certificationTask.lineItemReviewersModal.editReviewerSuccessfullyMessage';
        const currentReviewer = this.currentReviewersSelectedModal.find((reviewer) => reviewer.id === reviewerId);
        if (!currentReviewer) {
          newReviewer.id = reviewerId;
          newReviewer.permissions = permissions;
          this.currentReviewersSelectedModal.push(newReviewer);
          messageKey = 'governance.certificationTask.lineItemReviewersModal.addReviewerSuccessfullyMessage';
        } else {
          currentReviewer.permissions = permissions;
        }
        this.displayNotification('success', this.$t(messageKey));
        this.closeEditReviewerModal();
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('governance.certificationTask.lineItemReviewersModal.editReviewerErrorMessage'));
      }).finally(() => {
        this.isSavingReviewer = false;
      });
    },
    deleteReviewer(reviewerId, closeModal) {
      this.isDeletingReviewer = true;
      let deletedReviewerIndex;
      const newReviewers = this.currentReviewersSelectedModal.filter((reviewer, index) => {
        if (reviewer.id === reviewerId) {
          deletedReviewerIndex = index;
        }
        return reviewer.id !== reviewerId;
      });
      updateLineItemReviewers(this.currentLineItemIdSelectedModal, newReviewers).then(() => {
        this.displayNotification('success', this.$t('governance.certificationTask.lineItemReviewersModal.removeReviewerSuccessfullyMessage'));
        this.currentReviewersSelectedModal.splice(deletedReviewerIndex, 1);
        if (closeModal) {
          this.closeEditReviewerModal();
        }
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('governance.certificationTask.lineItemReviewersModal.removeReviewerErrorMessage'));
      }).finally(() => {
        this.isDeletingReviewer = false;
      });
    },
    isLastSignOffReviewer() {
      const signOffReviewers = this.currentReviewersSelectedModal.filter((reviewer) => reviewer.permissions.signoff);
      if (signOffReviewers.length > 1) return false;
      return signOffReviewers[0].id === this.currentReviewerSelectedModal.id;
    },
    openUserModal(lineItemId) {
      getCertificationLineItemUser(this.campaignId, lineItemId)
        .then(({ data }) => {
          this.currentUserSelectedModal = pick(data, userRequiredParams);
          this.$root.$emit('bv::show::modal', 'CertificationTaskUserModal');
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('governance.certificationTask.error.getUserError'));
        });
    },
    addComment(comment) {
      saveComment(this.campaignId, this.currentLineItemIdSelectedModal, comment).then(() => {
        this.getCertificationTaskList(this.paginationPage)
          .then(() => {
            const currentTask = this.tasksData.find((task) => task.id === this.currentLineItemIdSelectedModal);
            const taskActivity = currentTask?.decision?.certification?.comments;
            const comments = filter(taskActivity, { action: 'comment' });
            this.currentCommentsSelectedModal = comments;
          });
        this.displayNotification('success', this.$t('governance.certificationTask.lineItemAddCommentModal.addCommentSuccessfullyMessage'));
        this.$root.$emit('bv::hide::modal', 'CertificationTaskAddCommentModal');
        this.$root.$emit('bv::show::modal', 'CertificationTaskCommentsModal');
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('governance.certificationTask.error.addCommentErrorDefaultMessage'));
      });
    },
    openActivityModal(item) {
      const lineItemActivity = item?.decision?.certification?.comments;
      this.currentLineItemActivity = lineItemActivity;
      this.$root.$emit('bv::show::modal', 'CertificationActivityModal');
    },
    closeActivityModal() {
      this.currentLineItemActivity = [];
    },
    paginationChange() {
      this.getCertificationTaskList(this.paginationPage);
    },
    updateColumns(draggedColumnsList) {
      this.certificationListColumns = draggedColumnsList || this.tasksFields;
      if (this.campaignDetails.allowBulkCertify) {
        this.certificationListColumns.unshift({
          key: 'selector',
          label: '',
          sortable: false,
          class: 'selector-cell',
          show: true,
        });
      }
    },
    openCertificationTaskSortModal() {
      this.tasksFieldsToSort = cloneDeep(this.certificationListColumns);
      this.$root.$emit('bv::show::modal', 'CertificationTaskSortModal');
    },
    isTaskSelected(taskId) {
      return this.allSelected || this.selectedTasks.some((task) => task === taskId);
    },
    getVariant(status) {
      if (status === 'revoke') return 'danger';
      if (status === 'certify') return 'success';
      return '';
    },
    loadTasksList(resourceData, page) {
      this.totalRows = resourceData.data.totalCount;
      this.currentPage = page;
      const resultData = resourceData.data.result;

      this.tasksData = resultData.map((task) => ({
        ...task,
        selected: this.isTaskSelected(task.id),
      }));

      this.$emit('check-progress');
    },
    getCertificationTaskList(currentPage) {
      this.isLoading = true;
      const urlParams = this.buildUrlParams(currentPage, this.sortBy, this.sortDesc);
      const payload = this.buildBodyParams();

      // if all users line items are complete, emit an event
      getCertificationCountsByCampaign(this.campaignId, this.actorId, this.isAdmin).then(({ data }) => {
        this.$emit('set-totals', data.totals);
      });

      return getCertificationTasksListByCampaign(urlParams, this.campaignId, payload)
        .then((resourceData) => this.addCertificationTaskAccountDetails(resourceData))
        .then((resourceData) => this.loadTasksList(resourceData, currentPage))
        .catch((error) => {
          this.showErrorMessage(error, this.$t('governance.certificationTask.errors.certificationListError'));
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    async addCertificationTaskAccountDetails(resourceData) {
      const data = resourceData.data.result.map(async (task) => {
        const accountResponse = await getCertificationTaskAccountDetails(this.campaignId, task.id);
        return {
          ...task,
          account: accountResponse?.data,
        };
      });
      const result = await Promise.all(data);
      const mappedData = {
        ...resourceData,
        data: {
          ...resourceData.data,
          result,
        },
      };
      return mappedData;
    },
    getSortParam(sortBy) {
      switch (sortBy) {
        case 'application':
          return 'application.templateName';
        case 'user':
          return 'user.givenName';
        default:
          return sortBy;
      }
    },
    getFilterFormatted(operator, targetName, targetValue) {
      return {
        operator,
        operand: {
          targetName,
          targetValue,
        },
      };
    },
    getBaseFilters() {
      const filterPath = this.isAdmin
        ? 'decision.certification.primaryReviewer.id'
        : 'decision.certification.actors.id';
      return this.getFilterFormatted('EQUALS', filterPath, this.actorId);
    },
    buildBodyParams() {
      if (!this.listFilters) {
        return {
          targetFilter: this.getBaseFilters(),
        };
      }

      const decisionsFilter = this.listFilters.decision;
      const includeNoDecision = decisionsFilter?.includes('noDecision');
      const userFilter = this.getFilterFormatted('EQUALS', 'user.id', this.listFilters.user);
      const applicationFilter = this.getFilterFormatted('EQUALS', 'application.id', this.listFilters.application);
      const decisionsToFilter = decisionsFilter.filter((decision) => (decision !== 'noDecision'));
      const decisionFilter = this.getFilterFormatted('IN', 'decision.certification.decision', decisionsToFilter);
      const noDecisionFilter = {
        operator: 'NOT',
        operand: [this.getFilterFormatted('EXISTS', 'decision.certification.decision')],
      };
      const userApplicationFilter = [applicationFilter, userFilter].filter((filterInput) => (filterInput.operand.targetValue));

      const operandTargetFilter = {
        operator: includeNoDecision ? 'OR' : 'AND',
        operand: includeNoDecision ? [decisionFilter, noDecisionFilter] : [decisionFilter, ...userApplicationFilter],
      };

      const targetFilter = {
        targetFilter: {
          operator: 'AND',
          operand: includeNoDecision ? [operandTargetFilter, ...userApplicationFilter, this.getBaseFilters()]
            : [operandTargetFilter, this.getBaseFilters()],
        },
      };
      return targetFilter;
    },
    buildUrlParams(pageNumber, sortBy, sortDesc) {
      const sortByColumn = this.getSortParam(sortBy);
      const managedResourceParams = {
        appendUserPermissions: true,
        pageSize: this.pageSize,
        pageNumber: pageNumber - 1,
        sortBy: sortByColumn,
        sortDesc,
      };
      if (this.isAdmin) {
        managedResourceParams.isAdmin = this.isAdmin;
        managedResourceParams.actorId = this.actorId;
      }
      return managedResourceParams;
    },
    addIndividualTaskToSelected(selectValue, item) {
      if (selectValue) this.selectedTasks.push(item);
      else this.selectedTasks = this.selectedTasks.filter((task) => task.id !== item.id);
    },
    selectTask(selectValue, selectAll = false) {
      this.allSelected = selectAll;
      this.selectedTasks = [];
      const tasksListClone = cloneDeep(this.tasksData);
      this.tasksData = tasksListClone.map((task) => {
        if (selectValue) this.selectedTasks = [...this.selectedTasks, task];
        return {
          ...task,
          selected: selectValue,
        };
      });
    },
    setFiltersView() {
      this.showFiltersSection = !this.showFiltersSection;
    },
    getUnique(arr) {
      return [...new Map(arr.map((item) => ([item.id, item]))).values()];
    },
    /**
     * Determines whether the button is to be displayed pressed depending on the decision applied in the item
     * @param {Object} item object with item decision information
     * @param {ItemDecisionString} status string to be compared to determine if the button is pressed
     */
    pressedButton(item, status) {
      const decision = get(item, 'decision.certification.decision', '');
      return decision === status;
    },
    openForwardCertificationModal(id, isBulk) {
      this.currentItemTaskId = id;
      this.bulkForward = isBulk;
      this.$root.$emit('bv::show::modal', 'certification-forward-modal');
    },
    closeCertificationCommentModal(action) {
      this.currentItemTaskId = '';
      this.$root.$emit('bv::hide::modal', `certification-${action}-modal`);
    },
    /**
     * Checks to see if we should be resetting a line item or executing the
     */
    handleAction(type, item, modalProps = null) {
      if (this.pressedButton(item, type)) {
        this.resetLineItemAction(item.id);
        return;
      }

      switch (type) {
        case 'certify':
          this.certifyLineItemAction(item.id);
          break;
        case 'revoke':
        case 'exception':
          this.openActionConfirmationModal(modalProps, item.id);
          break;
        default:
          break;
      }
    },
    resetLineItemAction(id) {
      this.toggleSaving();
      resetLineItem(this.campaignId, id)
        .then(() => {
          this.updateCertificationTaskList('saveSuccessful', this.paginationPage);
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('governance.certificationTask.errors.certifyError'));
        })
        .finally(() => {
          this.toggleSaving();
        });
    },
    certifyLineItemAction(id) {
      this.toggleSaving();

      certifyLineItem(this.campaignId, id)
        .then(() => {
          this.updateCertificationTaskList('saveSuccessful', this.paginationPage);
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('governance.certificationTask.errors.certifyError'));
        })
        .finally(() => {
          this.toggleSaving();
        });
    },
    /**
     * Performs the revoke to the selected item
     * @param {Object} data data of the certification to revoke
     * @param {String} data.id id of the item to be revoked
     * @param {String} data.comment comment for the revoke
     */
    saveRevokeLineItemAction(comment) {
      this.toggleSaving();
      revokeLineItem(this.campaignId, this.currentItemTaskId, comment)
        .then(() => {
          this.updateCertificationTaskList('saveSuccessful', this.paginationPage);
          this.closeCertificationCommentModal('revoke');
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('governance.certificationTask.errors.revokeError'));
        })
        .finally(() => {
          this.toggleSaving();
        });
    },
    /**
     * Performs the exception to the selected item
     * @param {Object} data data of the certification to allow exception
     * @param {String} data.id id of the item to be excepted
     * @param {String} data.comment comment for the exception
     */
    saveAllowExceptionLineItemAction(comment) {
      this.toggleSaving();
      exceptionLineItem(this.campaignId, this.currentItemTaskId, comment)
        .then(() => {
          this.updateCertificationTaskList('saveSuccessful', this.paginationPage);
          this.closeCertificationCommentModal('allow-exception');
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('governance.certificationTask.errors.allowExceptionError'));
        })
        .finally(() => {
          this.toggleSaving();
        });
    },
    /**
     * @param {Object} data data of the certification to forward
     * @param {String} data.id id of the certification to forward
     * @param {String} data.comment comment for the forward
     * @param {String} data.newActorId id of new actor
     */
    forwardItem({ id, comment, newActorId }) {
      this.toggleSaving();
      forwardLineItem(this.campaignId, id, comment, newActorId)
        .then(() => {
          this.updateCertificationTaskList('reviewItemForwarded', this.paginationPage);
          this.closeCertificationCommentModal('forward');
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('governance.certificationTask.errors.forwardItemError'));
        })
        .finally(() => {
          this.toggleSaving();
        });
    },
    /**
     * Manages the update of the certification when performing any action on it
     * @param {String} message message to be displayed in the success notification
     * @param {Number} [page] number of page to reload
     */
    updateCertificationTaskList(message, page = this.mainPageNumber) {
      this.displayNotification('success', this.$t(`governance.certificationTask.success.${message}`));
      this.selectedTasks = [];
      this.getCertificationTaskList(page);
      this.$emit('update-details');
    },
    saveCertifyBulkAction() {
      this.toggleSaving();
      const payload = { ids: this.selectedTasks.map((task) => (task.id)) };
      certifyCertificationTasks(this.campaignId, payload)
        .then(() => {
          this.toggleSaving();
          this.updateCertificationTaskList('certifySuccess');
        });
    },
    saveRevokeCertificationTasks(message) {
      this.toggleSaving();
      const payload = { message, ids: this.selectedTasks.map((task) => (task.id)) };
      revokeCertificationTasks(this.campaignId, payload)
        .then(() => {
          this.toggleSaving();
          this.updateCertificationTaskList('revokeSuccess');
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('governance.certificationTask.errors.revokeError'));
        });
    },
    saveAllowExceptionBulkAction(message) {
      this.toggleSaving();
      const payload = { message, ids: this.selectedTasks.map((task) => (task.id)) };
      exceptionCertificationTasks(this.campaignId, payload)
        .then(() => {
          this.toggleSaving();
          this.updateCertificationTaskList('allowExceptionSuccess');
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('governance.certificationTask.errors.allowExceptionError'));
        });
    },
    showReassignBulkActionModal() {
      this.$root.$emit('bv::show::modal', 'CertificationTaskReassignModal');
    },
    openActionConfirmationModal({
      title,
      description,
      placeHolder,
      okLabel,
      okFunction,
    }, currentItemTaskId = null) {
      this.currentItemTaskId = currentItemTaskId;
      this.actionConfirmationModalProps = {
        title,
        description,
        placeHolder,
        okLabel,
        okFunction,
      };
      this.$root.$emit('bv::show::modal', 'CertificationTaskActionConfirmModal');
    },
    saveForwardBulkAction({ comment, newActorId }) {
      this.toggleSaving();
      const payload = { message: comment, newActorId, ids: this.selectedTasks.map((task) => (task.id)) };
      forwardCertificationTasks(this.campaignId, payload)
        .then(() => {
          this.toggleSaving();
          this.updateCertificationTaskList('onForwardSuccess');
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('governance.certificationTask.errors.onForwardError'));
        });
    },
  },
  mounted() {
    this.updateColumns();
    this.getCertificationTaskList(this.paginationPage);
  },
  watch: {
    refreshTasks(newVal, oldVal) {
      if (newVal && !oldVal) {
        this.getCertificationTaskList(this.paginationPage);
        this.$emit('refresh-complete');
      }
    },
    campaignDetails: {
      deep: true,
      handler() {
        this.updateColumns();
      },
    },
  },
};
</script>
<style lang="scss" scoped>
  .certification-task-list {
    &_controls {
      padding: 10px;
      border-bottom: 1 solid $gray-200;
    }
  }
  .small-column {
    width: 5%;
  }
  .clickable:hover {
    cursor: pointer;
    text-decoration: underline;
  }
  .comments-counter {
    right: 0.25rem;
    top: -0.25rem;
  }

  ::v-deep {
    .fr-access-cell {
      padding: 1rem 1.5rem !important;
    }

    .selector-cell {
      width: 40px;
      padding: 0 .5rem 0 0 !important;
    }

    .w-208px {
      width: 208px;
      box-shadow: -4px 0px 5px 0px rgb(0 0 0 / 5%);
    }
    .w-140px {
      width: 140px;
    }
  }
</style>
