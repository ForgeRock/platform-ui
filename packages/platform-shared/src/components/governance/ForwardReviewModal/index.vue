<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    v-slot="{ meta: { valid } }"
    ref="observer"
    as="span">
    <BModal
      :ok-disabled="!valid"
      :ok-title="$t('common.forward')"
      :title="$t('governance.forwardReviewModal.title')"
      @ok="handleForward"
      cancel-variant="link"
      id="forward-review-modal"
      ok-variant="info"
      size="lg">
      <p>
        {{ $t( 'governance.forwardReviewModal.description' ) }}
      </p>
      <div>
        <div class="mb-4">
          <BFormRadioGroup
            class="mb-4"
            stacked
            v-model="forwardToType"
            :options="forwardToOptions"
          />
          <FrGovResourceSelect
            v-model="forwardToResource"
            name="forwardToResource"
            :resource-path="isUserSelected ? 'user' : 'role'"
            :label="$t('governance.certificationTask.actionsModal.forwardTo')"
            validation="required"
          />
        </div>
        <FrField
          v-model="comment"
          type="textarea"
          name="comment"
          :label="$t('common.comment')" />
      </div>
    </BModal>
  </VeeForm>
</template>

<script>
import {
  BFormRadioGroup,
  BModal,
} from 'bootstrap-vue';
import { Form as VeeForm } from 'vee-validate';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import { ResourceType } from '@forgerock/platform-shared/src/utils/governance/types';

export default {
  name: 'ForwardReviewModal',
  components: {
    BFormRadioGroup,
    BModal,
    FrField,
    FrGovResourceSelect,
    VeeForm,
  },
  props: {
    certId: {
      type: String,
      default: '',
    },
  },
  watch: {
    certId(certId) {
      this.localCertId = certId;
    },
  },
  data() {
    return {
      comment: '',
      forwardToUser: '',
      forwardToRole: '',
      forwardToType: ResourceType.USER,
      forwardToOptions: [
        { text: this.$t('governance.forwardReviewModal.toUser'), value: ResourceType.USER },
        { text: this.$t('governance.forwardReviewModal.toRole'), value: ResourceType.ROLE },
      ],
      error: '',
      options: [],
      localCertId: this.certId,
    };
  },
  methods: {
    handleForward() {
      const payload = {
        certId: this.localCertId,
        comment: this.comment,
        newActorId: this.forwardToResource,
      };
      this.$emit('forward', payload);
    },
  },
  computed: {
    isUserSelected() {
      return this.forwardToType === 'user';
    },
    forwardToResource: {
      get() {
        return this.isUserSelected ? this.forwardToUser : this.forwardToRole;
      },
      set(value) {
        if (this.isUserSelected) {
          this.forwardToUser = value;
        } else {
          this.forwardToRole = value;
        }
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.input-line-height {
  line-height: 1.2;
}
</style>
