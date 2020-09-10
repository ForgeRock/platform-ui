<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BModal
    v-bind="$attrs"
    size="lg"
    :title="this.$t('pages.access.resetPassword')"
    @hidden="password.value=''; failures=[]">
    <p class="mb-4">
      {{ $t('common.helpText.resetPassword') }}
    </p>
    <FrField
      :field="password"
      :failed-policies="failures" />
    <template #modal-footer="{ ok, cancel }">
      <BButton
        variant="link"
        @click="cancel()">
        {{ $t('common.cancel') }}
      </BButton>
      <BButton
        variant="primary"
        @click="savePassword(ok)">
        {{ $t('pages.access.resetPassword') }}
      </BButton>
    </template>
  </BModal>
</template>

<script>
import {
  BButton,
  BModal,
} from 'bootstrap-vue';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import FrField from '@forgerock/platform-shared/src/components/Field';

/**
 * Modal used to reset a users password as an administrator. Used in EditResource component.
 */
export default {
  name: 'ResetPasswordModal',
  components: {
    BButton,
    BModal,
    FrField,
  },
  mixins: [
    NotificationMixin,
    RestMixin,
    ResourceMixin,
  ],
  props: {
    /**
     * Type of resource. Managed or internal.
     */
    resourceType: {
      type: String,
      required: true,
    },
    /**
     * Name of resource e.g. user
     */
    resourceName: {
      type: String,
      required: true,
    },
    /**
     * Id of resource e.g user Id
     */
    resourceId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      password: {
        value: '',
        type: 'password',
        title: this.$t('common.placeholders.password'),
        validation: 'required',
      },
      failures: [],
    };
  },
  methods: {
    /**
     * Attempt to update password. Failures related to policy will be displayed under the input
     * @param {Function} ok function used to close modal
     */
    savePassword(ok) {
      const idmInstance = this.getRequestService();
      const saveData = [{ operation: 'add', field: '/password', value: this.password.value }];
      idmInstance.patch(`${this.resourceType}/${this.resourceName}/${this.resourceId}`, saveData).then(() => {
        this.displayNotification('AdminMessage', 'success', this.$t('pages.access.successSavePassword'));
        ok();
      },
      (error) => {
        const err = this.findPolicyError(error.response);
        if (err.length) this.failures = [err[0].msg];
        this.displayNotification('AdminMessage', 'error', this.$t('pages.access.failedSavePassword'));
      });
    },
  },
};
</script>
