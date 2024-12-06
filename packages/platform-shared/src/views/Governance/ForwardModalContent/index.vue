<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <p>
      {{ descriptionText }}
    </p>
    <div class="mb-4">
      <BFormRadioGroup
        v-model="forwardToType"
        class="mb-4"
        stacked
        :options="forwardToOptions" />
      <FrGovResourceSelect
        v-model="forwardToResource"
        name="forwardToResource"
        validation="required"
        :option-function="optionFunction"
        :query-param-function="queryParamFunction"
        :resource-function="getManagedResourceList"
        :resource-path="resourcePath"
        :label="$t('governance.certificationTask.actionsModal.forwardTo')"
        @get-user-info="$emit('resource-info', $event)"
        @get-role-info="$emit('resource-info', $event)" />
    </div>

    <!-- comment -->
    <FrField
      v-if="showCommentField"
      class="mb-4"
      type="textarea"
      validation="required"
      :label="commentLabel"
      @input="$emit('request-comment', $event);" />
  </div>
</template>

<script>
import { BFormRadioGroup } from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import { getManagedResourceList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import {
  getResourcePath,
  getValuePath,
  optionFunction,
  queryParamFunction,
} from '@forgerock/platform-shared/src/components/FormEditor/utils/govObjectSelect';

/**
 * @constant {Object}
 * @default
 */
const FORWARD_TO_TYPES = {
  role: 'role',
  user: 'user',
};

export default {
  name: 'ForwardModalContent',
  components: {
    BFormRadioGroup,
    FrField,
    FrGovResourceSelect,
  },
  props: {
    descriptionText: {
      type: String,
      default: '',
    },
    commentLabel: {
      type: String,
      default: '',
    },
    showCommentField: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      comment: '',
      forwardToUser: '',
      forwardToRole: '',
      forwardToType: FORWARD_TO_TYPES.user,
      forwardToOptions: [
        { text: this.$t('governance.certificationTask.actionsModal.toUser'), value: FORWARD_TO_TYPES.user },
        { text: this.$t('governance.certificationTask.actionsModal.toRole'), value: FORWARD_TO_TYPES.role },
      ],
    };
  },
  computed: {
    resourcePath() {
      return getResourcePath(this.forwardToType);
    },
    isUserSelected() {
      return this.forwardToType === 'user';
    },
    forwardToResource: {
      get() {
        return this.isUserSelected ? this.forwardToUser : this.forwardToRole;
      },
      set(value) {
        if (this.isUserSelected) {
          this.forwardToUser = getValuePath('user', value.split('/').pop());
        } else {
          this.forwardToRole = getValuePath('role', value.split('/').pop());
        }
      },
    },
  },
  methods: {
    optionFunction,
    queryParamFunction,
    getManagedResourceList,
  },
  watch: {
    forwardToResource(forwardTo) {
      this.$emit('request-update-actors', forwardTo);
    },
  },
};
</script>
