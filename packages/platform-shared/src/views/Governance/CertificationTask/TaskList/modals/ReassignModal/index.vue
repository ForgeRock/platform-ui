<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    v-slot="{ meta: { valid } }"
    ref="observer"
    as="span">
    <BModal
      cancel-variant="link"
      no-close-on-backdrop
      no-close-on-esc
      ok-variant="primary"
      size="lg"
      :id="modalId"
      :ok-disabled="!valid"
      :ok-title="$t('governance.certificationTask.actions.reassign')"
      :title="$t('governance.certificationTask.actionsModal.reassignItems')"
      @ok="saveReassignBulkAction">
      <FrForwardModalContent
        :description-text="$t('governance.certificationTask.actionsModal.reassignDescription')"
        :show-comment-field="false"
        @request-update-actors="reassignToResource = $event" />
      <p class="mb-2">
        {{ $t('governance.certificationTask.permissions.title') }}
      </p>
      <div
        v-for="permission of permissions"
        class="d-flex flex-row mb-1"
        :key="permission.key">
        <FrField
          v-model="permission.selected"
          class="mr-2"
          :name="`columnSelected_${permission.key}`"
          type="checkbox" />
        <span>
          {{ $t(permission.label) }}
        </span>
      </div>
    </BModal>
  </VeeForm>
</template>

<script>
import { BModal } from 'bootstrap-vue';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrForwardModalContent from '@forgerock/platform-shared/src/views/Governance/ForwardModalContent';
import { reassignCertificationTasks, reassignAllCertificationTasks } from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import { Form as VeeForm } from 'vee-validate';

export default {
  name: 'CertificationTaskReassignModal',
  components: {
    BModal,
    VeeForm,
    FrField,
    FrForwardModalContent,
  },
  mixins: [
    NotificationMixin,
  ],
  data() {
    return {
      reassignToResource: '',
      permissions: [
        {
          selected: true,
          label: 'governance.certificationTask.permissions.view',
          key: 'view',
        },
        {
          selected: true,
          label: 'governance.certificationTask.permissions.comment',
          key: 'comment',
        },
        {
          selected: true,
          label: 'governance.certificationTask.permissions.decide',
          key: 'decide',
        },
        {
          selected: true,
          label: 'governance.certificationTask.permissions.assignForward',
          key: 'assignForward',
        },
        {
          selected: true,
          label: 'governance.certificationTask.permissions.signOff',
          key: 'signOff',
        },
      ],
    };
  },
  props: {
    actorId: {
      type: String,
      default: '',
    },
    allSelected: {
      type: Boolean,
      default: false,
    },
    campaignId: {
      type: String,
      default: null,
    },
    selectedTasks: {
      type: Array,
      default: () => ([]),
    },
    modalId: {
      type: String,
      default: 'CertificationTaskReassignAccountModal',
    },
  },
  methods: {
    toggleSaving() {
      this.$emit('change-saving');
    },
    saveReassignBulkAction() {
      // Making the permissions object to be stored
      const getPermissionValue = (key) => this.permissions.find((permission) => permission.key === key).selected;
      const decide = getPermissionValue('decide');
      const forward = getPermissionValue('assignForward');
      this.toggleSaving();
      const permissions = {
        certify: decide,
        revoke: decide,
        exception: decide,
        reset: decide,
        comment: getPermissionValue('comment'),
        view: getPermissionValue('view'),
        forward,
        reassign: forward,
        signoff: getPermissionValue('signOff'),
      };
      const payload = {
        permissions,
        ids: this.selectedTasks.map((task) => (task.id)),
        newActorId: this.reassignToResource,
      };
      if (this.allSelected) {
        delete payload.ids;
        reassignAllCertificationTasks(this.campaignId, this.actorId, payload).catch((error) => {
          this.showErrorMessage(error, this.$t('governance.certificationTask.errors.reassignError'));
        }).finally(() => {
          this.toggleSaving();
          this.$emit('refresh-data');
        });
      } else {
        reassignCertificationTasks(this.campaignId, payload).catch((error) => {
          this.showErrorMessage(error, this.$t('governance.certificationTask.errors.reassignError'));
        }).finally(() => {
          this.toggleSaving();
          this.$emit('refresh-data');
        });
      }
    },
  },
};
</script>
