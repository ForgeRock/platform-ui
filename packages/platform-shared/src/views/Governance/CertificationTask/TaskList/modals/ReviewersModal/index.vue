<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    body-class="p-0"
    content-class="border-0"
    :footer-class="!hideCreationButton ? 'justify-content-between' : ''"
    :id="modalId"
    no-close-on-backdrop
    no-close-on-esc
    scrollable
    size="lg">
    <template #modal-header="{ close }">
      <h5 class="modal-title">
        {{ $t('governance.certificationTask.lineItemReviewersModal.title') }}
      </h5>
      <BButtonClose
        variant="link"
        class="ml-auto"
        @click="close">
        <FrIcon
          name="close"
          icon-class="md-24" />
      </BButtonClose>
    </template>
    <div>
      <BTable
        class="m-0"
        :items="reviewers"
        selectable
        hover
        :fields="fields"
        @row-clicked="editReviewer">
        <template #cell(reviewer)="{ item }">
          <BMedia
            v-if="item.id.split('/')[1] === ResourceType.USER"
            no-body>
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
                {{ item.givenName + ' ' + item.sn }}
              </h5>
              <small class="text-muted text-truncate">
                {{ item.userName }}
              </small>
            </BMediaBody>
          </BMedia>
          <BMedia
            v-else
            no-body>
            <BMediaAside vertical-align="center">
              <div class="rounded-circle d-flex align-items-center justify-content-center bg-lightblue text-primary wh-36px">
                <FrIcon
                  name="assignment_ind"
                  icon-class="md-15" />
              </div>
            </BMediaAside>
            <BMediaBody class="text-truncate">
              <h5 class="mb-0 text-truncate">
                {{ item.name }}
              </h5>
              <small class="text-muted text-truncate">
                {{ $t('governance.certificationTask.lineItemReviewersModal.role') }}
              </small>
            </BMediaBody>
          </BMedia>
        </template>
        <template #cell(permissions)="{ item }">
          <BBadge
            class="font-weight-normal pr-2 mr-lg-1 mb-1 mb-lg-0 d-block d-lg-inline-block"
            v-for="(permission, index) in getPermissionsMapped(item.permissions)"
            :key="index"
            variant="light">
            {{ $t(`governance.certificationTask.lineItemReviewersModal.editReviewerModal.permissionLabels.${permission}`) }}
          </BBadge>
        </template>
        <template #cell(actions)="{ item }">
          <BDropdown
            no-caret
            toggle-class="p-1"
            variant="link">
            <template #button-content>
              <FrIcon
                icon-class="text-dark md-24"
                name="more_horiz" />
            </template>
            <BDropdownItem @click="editReviewer(item)">
              <FrIcon
                icon-class="mr-2"
                name="edit">
                {{ $t('common.edit') }}
              </FrIcon>
            </BDropdownItem>
            <template v-if="reviewers.length > 1">
              <BDropdownDivider />
              <BDropdownItem @click="deleteReviewer(item.id)">
                <FrIcon
                  icon-class="mr-2"
                  name="delete">
                  {{ $t('common.remove') }}
                </FrIcon>
              </BDropdownItem>
            </template>
          </BDropdown>
        </template>
      </BTable>
    </div>
    <template #modal-footer="{ cancel }">
      <BButton
        v-if="!hideCreationButton"
        variant="outline-primary"
        @click="openAddReviewerModal()">
        <FrIcon
          name="add"
          icon-class="md-15">
          {{ $t('governance.certificationTask.lineItemReviewersModal.addReviewerButtonText') }}
        </FrIcon>
      </BButton>
      <BButton
        variant="outline-primary"
        @click="cancel()">
        {{ $t('common.done') }}
      </BButton>
    </template>
  </BModal>
</template>

<script>
import {
  BButtonClose,
  BModal,
  BTable,
  BButton,
  BMedia,
  BMediaAside,
  BMediaBody,
  BImg,
  BBadge,
  BDropdown,
  BDropdownItem,
  BDropdownDivider,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { ResourceType } from '@forgerock/platform-shared/src/utils/governance/types';

export default {
  name: 'ReviewersModal',
  components: {
    BButtonClose,
    BModal,
    BTable,
    FrIcon,
    BButton,
    BMedia,
    BMediaAside,
    BMediaBody,
    BImg,
    BBadge,
    BDropdown,
    BDropdownItem,
    BDropdownDivider,
  },
  props: {
    reviewers: {
      type: Array,
      default: () => [],
    },
    hideCreationButton: {
      type: Boolean,
      default: false,
    },
    modalId: {
      type: String,
      default: 'CertificationTaskReviewersAccountModal',
    },
  },
  data() {
    return {
      currentPage: 1,
      itemsPerPage: 10,
      fields: [
        {
          key: 'reviewer',
          label: this.$t('governance.certificationTask.lineItemReviewersModal.reviewersTable.reviewersColumnLabel'),
        },
        {
          key: 'permissions',
          label: this.$t('governance.certificationTask.lineItemReviewersModal.reviewersTable.permissionsColumnLabel'),
        },
        {
          key: 'actions',
          label: '',
          class: 'w-114px',
        },
      ],
      ResourceType,
    };
  },
  methods: {
    openAddReviewerModal() {
      this.$emit('open-edit-reviewer-modal');
    },
    editReviewer(reviewer) {
      this.$emit('open-edit-reviewer-modal', reviewer);
    },
    deleteReviewer(reviewerId) {
      this.$emit('delete-reviewer', reviewerId);
    },
    getPermissionsMapped(permissions) {
      const permissionsMap = {
        certify: 'decide',
        revoke: 'decide',
        exception: 'decide',
        reset: 'decide',
        comment: 'comment',
        reassign: 'forward',
        forward: 'forward',
        signoff: 'signoff',
      };
      return Object.entries(permissions).reduce((acc, [key, value]) => {
        if (value && permissionsMap[key] && !acc.includes(permissionsMap[key])) {
          acc.push(permissionsMap[key]);
        }
        return acc;
      }, []);
    },
  },
};
</script>

<style lang="scss" scoped>
.wh-36px {
  width: 36px;
  height: 36px;
}
:deep {
  .w-114px {
    width: 114px;
  }
}
</style>
