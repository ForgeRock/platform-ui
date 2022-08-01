<!-- Copyright (c) 2020-2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    v-bind="$attrs"
    size="lg"
    :title="this.$t('pages.access.resetPassword')"
    @hidden="password=''; failures=[]">
    <p class="mb-4">
      {{ $t('common.helpText.resetPassword') }}
    </p>
    <FrPolicyPasswordInput
      @is-valid="isValid=$event"
      v-model="password"
      :resource-type="resourceType"
      :resource-name="resourceName"
      :failures-on-submit="failures"
      validation="required" />
    <template #modal-footer="{ ok, cancel }">
      <BButton
        variant="link"
        @click="cancel()">
        {{ $t('common.cancel') }}
      </BButton>
      <BButton
        :disabled="!isValid || !password.length"
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
import PasswordPolicyMixin from '@forgerock/platform-shared/src/mixins/PasswordPolicyMixin';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import FrPolicyPasswordInput from '@forgerock/platform-shared/src/components/PolicyPasswordInput';

/**
 * Modal used to reset a users password as an administrator. Used in EditResource component.
 */
export default {
  name: 'ResetPasswordModal',
  components: {
    BButton,
    BModal,
    FrPolicyPasswordInput,
  },
  mixins: [
    NotificationMixin,
    PasswordPolicyMixin,
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
      password: '',
      failures: [],
      isValid: false,
    };
  },
  methods: {
    /**
     * Attempt to update password. Failures related to policy will be displayed under the input
     * @param {Function} ok function used to close modal
     */
    savePassword(ok) {
      const idmInstance = this.getRequestService();
      const saveData = [{ operation: 'add', field: '/password', value: this.password }];
      idmInstance.patch(`${this.resourceType}/${this.resourceName}/${this.resourceId}`, saveData).then(() => {
        this.displayNotification('success', this.$t('pages.access.successSavePassword'));
        this.$emit('refresh-data');
        ok();
      },
      (error) => {
        const err = this.findPolicyError(error.response).map((message) => message.msg);
        if (err.length) this.failures = err;
        this.showErrorMessage(error, this.$t('pages.access.failedSavePassword'));
      });
    },
  },
};
</script>
