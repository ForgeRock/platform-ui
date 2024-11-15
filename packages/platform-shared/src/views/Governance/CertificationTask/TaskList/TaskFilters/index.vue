<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="d-flex flex-column certification-task-filter">
    <BFormGroup class="mb-0">
      <div class="d-flex justify-content-start m-10 p-4 align-items-center">
        <div class="d-flex justify-content-start mr-4">
          <FrField
            v-model="formFields.certified"
            testid="cert-filter-certify"
            class="mr-2"
            aria-labelledby="label-certified"
            name="certifiedColumnSelected"
            type="checkbox" />
          <FrIcon
            icon-class="color-green mr-2"
            name="check">
            <span id="label-certified">
              {{ $t('governance.certificationTask.certified') }}
            </span>
          </FrIcon>
        </div>
        <div class="d-flex justify-content-start mr-4">
          <FrField
            v-model="formFields.revoked"
            class="mr-2"
            aria-labelledby="label-revoke"
            name="revokedColumnSelected"
            type="checkbox" />
          <FrIcon
            icon-class="color-red mr-2"
            name="block">
            <span id="label-revoke">
              {{ $t('governance.certificationTask.revoked') }}
            </span>
          </FrIcon>
        </div>
        <div class="d-flex justify-content-start mr-4">
          <FrField
            v-model="formFields.exceptionAllowed"
            class="mr-2"
            aria-labelledby="label-exception"
            name="exceptionAllowedColumnSelected"
            type="checkbox" />
          <FrIcon
            icon-class="color-gray mr-2"
            name="schedule">
            <span id="label-exception">
              {{ $t('governance.certificationTask.exceptionAllowed') }}
            </span>
          </FrIcon>
        </div>
        <div class="d-flex justify-content-start">
          <FrField
            v-model="formFields.noDecision"
            class="mr-2"
            aria-labelledby="label-no-decision"
            name="noDecisionColumnSelected"
            type="checkbox" />
          <span id="label-no-decision">
            {{ $t('governance.certificationTask.noDecision') }}
          </span>
        </div>
      </div>
      <div class="d-flex justify-content-between">
        <div class="w-100 m-4">
          <FrField
            v-model="formFields.user"
            class="text-muted w-100 certification-task-filter-dropdown certification-task-filter-list"
            id="certificationTaskUser"
            type="select"
            :label="$t('governance.certificationTask.user')"
            :options="users">
            <template #singleLabel="{ option }">
              <div
                v-if="option.givenName"
                class="d-flex justify-content-start align-items-center p-2">
                <BMedia>
                  <template #aside>
                    <BImg
                      height="24"
                      width="24"
                      :alt="option.text"
                      :aria-hidden="true"
                      :src="option.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
                  </template>
                  <div
                    class="media-body d-flex flex-column">
                    <div
                      class="mb-0 text-dark text-truncate">
                      {{ option.givenName }}
                    </div>
                    <small class="text-truncate">
                      {{ option.userName }}
                    </small>
                  </div>
                </BMedia>
              </div>
              <div
                class="certification-task-filter-default"
                v-else>
                {{ $t('governance.certificationTask.allUsers') }}
              </div>
            </template>
            <template #option="{ option }">
              <div v-if="!option.value">
                {{ option.text }}
              </div>
              <div
                v-else
                class="d-flex justify-content-start align-items-center">
                <BMedia>
                  <template #aside>
                    <BImg
                      height="24"
                      width="24"
                      :alt="option.text"
                      :aria-hidden="true"
                      :src="option.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
                  </template>
                  <div
                    class="media-body d-flex flex-column">
                    <div
                      class="mb-0 text-dark text-truncate">
                      {{ option.givenName }}
                    </div>
                    <small class="text-truncate">
                      {{ option.userName }}
                    </small>
                  </div>
                </BMedia>
              </div>
            </template>
          </FrField>
        </div>
        <div class="w-100 m-4">
          <FrField
            v-model="formFields.application"
            class="text-muted w-100 certification-task-filter-dropdown certification-task-filter-list"
            variant="outline-secondary"
            type="select"
            :label="$t('governance.certificationTask.application')"
            :options="applications">
            <template #singleLabel="{ option }">
              <div
                class="certification-task-filter-default"
                v-if="!option.value">
                {{ $t('governance.certificationTask.allApplications') }}
              </div>
              <div
                v-else-if="option"
                class="d-flex justify-content-start align-items-center p-2">
                <BMedia
                  class="align-items-center"
                  no-body>
                  <img
                    class="mr-4 size-28"
                    :onerror="onImageError"
                    :src="getLogo(option)"
                    :alt="$t('common.logo')">
                  <div class="media-body align-self-center overflow-hidden text-nowrap">
                    <span class="text-dark">
                      {{ option.text }}
                    </span>
                  </div>
                </BMedia>
              </div>
            </template>
            <template #option="{ option }">
              <div v-if="!option.value">
                {{ option.text }}
              </div>
              <div
                v-else
                class="d-flex justify-content-start align-items-center">
                <BMedia
                  class="align-items-center"
                  no-body>
                  <img
                    class="mr-4 size-28"
                    :onerror="onImageError"
                    :src="getLogo(option)"
                    :alt="$t('common.logo')">
                  <div class="media-body align-self-center overflow-hidden text-nowrap">
                    <span class="text-dark">
                      {{ option.name }}
                    </span>
                  </div>
                </BMedia>
              </div>
            </template>
          </FrField>
        </div>
      </div>
    </BFormGroup>
  </div>
</template>

<script>
import {
  BImg,
  BMedia,
  BFormGroup,
} from 'bootstrap-vue';
import { getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrField from '@forgerock/platform-shared/src/components/Field';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import {
  getCertificationUserFilter,
  getCertificationApplicationFilter,
} from '@forgerock/platform-shared/src/api/governance/CertificationApi';

export default {
  name: 'TaskFilters',
  components: {
    FrIcon,
    FrField,
    BFormGroup,
    BMedia,
    BImg,
  },
  mixins: [
    NotificationMixin,
  ],
  data() {
    const defaultApplicationValue = {
      value: '',
      text: this.$t('governance.certificationTask.allApplications'),
    };
    const defaultUserValue = {
      value: '',
      text: this.$t('governance.certificationTask.allUsers'),
    };
    return {
      defaultUserValue,
      defaultApplicationValue,
      users: [],
      applications: [],
      formFields: {
        noDecision: true,
        exceptionAllowed: true,
        revoked: true,
        certified: true,
        user: defaultUserValue.value,
        application: defaultApplicationValue.value,
      },
    };
  },
  props: {
    certId: {
      type: String,
      default: '',
    },
    actorId: {
      type: String,
      default: '',
    },
  },
  methods: {
    getUserSelected() {
      return this.formFields?.user?.name || this.$t('governance.certificationTask.allUsers');
    },
    getUserInfoFilter() {
      getCertificationUserFilter(this.certId, this.actorId)
        .then(({ data }) => {
          this.users = data.map((user) => ({
            ...user,
            value: user?.id,
            text: `${user?.givenName}`,
          }));
          this.users = [this.defaultUserValue, ...this.users];
        }).catch((error) => {
          this.showErrorMessage(error, this.$t('governance.certificationTask.errors.filterError'));
        });
    },
    getApplicationInfoFilter() {
      getCertificationApplicationFilter(this.certId, this.actorId)
        .then(({ data }) => {
          this.applications = data.map((application) => ({
            ...application,
            value: application?.id,
            text: application?.name,
          }));
          this.applications = [this.defaultApplicationValue, ...this.applications];
        }).catch((error) => {
          this.showErrorMessage(error, this.$t('governance.certificationTask.errors.filterError'));
        });
    },
    getLogo(item) {
      return getApplicationLogo(item);
    },
    onImageError,
  },
  mounted() {
    if (this.actorId) {
      this.getUserInfoFilter();
      this.getApplicationInfoFilter();
    }
  },
  watch: {
    actorId() {
      this.getUserInfoFilter();
      this.getApplicationInfoFilter();
    },
    formFields: {
      deep: true,
      handler() {
        const decisions = {
          certify: this.formFields?.certified,
          revoke: this.formFields?.revoked,
          exception: this.formFields?.exceptionAllowed,
          noDecision: this.formFields?.noDecision,
        };
        const decisionsFilter = Object.keys(decisions).filter((key) => (decisions[key] === true));
        const params = {
          decision: decisionsFilter,
          user: this.formFields?.user,
          application: this.formFields?.application,
        };
        Object.keys(params).forEach((key) => (!params[key] && delete params[key]));
        this.$emit('filter-certification-items', params);
      },
    },
  },
};
</script>
<style lang="scss" scoped>
:deep(.certification-task-filter) {
  border: 1px solid $gray-200;

  .certification-task-filter-selected {
    width: 95%;
  }

}
:deep(.certification-task-filter-dropdown) {
  .multiselect__tags {
    min-height: 85px;
  }

  .multiselect__single > .certification-task-filter-default {
    margin-top: 32px;
  }
}

:deep(.certification-task-filter-list ul) {
  width: 100%;
}
</style>
