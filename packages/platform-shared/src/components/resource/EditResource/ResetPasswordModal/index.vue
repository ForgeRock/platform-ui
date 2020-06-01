<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BModal
    v-bind="$attrs"
    size="lg"
    :title="this.$t('pages.access.resetPassword')"
    @hidden="passwordValue=''; failures=[]">
    <p class="mb-4">
      {{ $t('common.helpText.resetPassword') }}
    </p>
    <FrPolicyPasswordInput
      v-model="passwordValue"
      :policy-api="`${resourceType}/${resourceName}/policy`"
      :failed="failures"
      @valid="passwordValid = $event" />
    <template #modal-footer="{ ok, cancel }">
      <BButton
        variant="link"
        @click="cancel()">
        {{ $t('common.cancel') }}
      </BButton>
      <BButton
        type="button"
        variant="primary"
        :disabled="!passwordValid"
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
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import PolicyPasswordInput from '@forgerock/platform-shared/src/components/PolicyPasswordInput/';

/**
 * Modal used to reset a users password as an administrator. Used in EditResource component.
 */
export default {
  name: 'ResetPasswordModal',
  components: {
    BButton,
    BModal,
    FrPolicyPasswordInput: PolicyPasswordInput,
  },
  mixins: [
    NotificationMixin,
    RestMixin,
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
      passwordValue: '',
      passwordValid: false,
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
      const saveData = [{ operation: 'add', field: '/password', value: this.passwordValue }];
      idmInstance.patch(`${this.resourceType}/${this.resourceName}/${this.resourceId}`, saveData).then(() => {
        this.displayNotification('AdminMessage', 'success', this.$t('pages.access.successSavePassword'));
        this.passwordValue = '';
        ok();
      },
      (error) => {
        if (error.response.data.code === 403 && error.response.data.message === 'Failed policy validation') {
          this.failures = error.response.data.detail.failedPolicyRequirements;
        }
        this.displayNotification('AdminMessage', 'error', this.$t('pages.access.failedSavePassword'));
      });
    },
  },
};
</script>
