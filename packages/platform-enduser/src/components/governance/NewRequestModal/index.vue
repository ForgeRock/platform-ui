<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="NewRequestModal"
    size="lg"
    no-close-on-backdrop
    no-close-on-esc
    cancel-variant="link"
    :ok-title="$t('common.next')"
    :ok-disabled="invalid"
    :title="$t('governance.accessRequest.newRequest.title')"
    @ok="requestAccess"
  >
    <div>
      <BRow class="mb-4">
        <BCol lg="4">
          <h1 class="h5">
            {{ $t('governance.accessRequest.newRequest.addAccessFor') }}
          </h1>
        </BCol>
        <BCol lg="8">
          <div class="pl-lg-4">
            <!-- Self -->
            <FrCardRadioInput
              class="mb-3"
              value="self"
              name="requestOption"
              v-model="requestOption">
              <BMedia
                no-body
                class="align-items-center">
                <BImg
                  :src="userDetails.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')"
                  alt="profile-picture"
                  class="mr-3 rounded-circle"
                  width="36" />
                <BMediaBody>
                  <h2
                    class="mb-0 h5"
                    aria-label="user-given-name">
                    {{ userFullName }} (Myself)
                  </h2>
                  <small class="d-block">
                    {{ userName }}
                  </small>
                </BMediaBody>
              </BMedia>
            </FrCardRadioInput>
            <!-- Other users -->
            <FrCardRadioInput
              class="mb-3"
              value="others"
              name="requestOption"
              v-model="requestOption">
              <BMedia
                no-body
                class="align-items-center">
                <FrIcon
                  name="group_add"
                  class="rounded rounded-circle bg-lightblue mr-3 w-40 p-2 text-primary" />
                <h2
                  class="mb-0 h5"
                  :aria-label="$t('governance.accessRequest.newRequest.otherUsers')"
                >
                  {{ $t('governance.accessRequest.newRequest.otherUsers') }}
                </h2>
              </BMedia>
            </FrCardRadioInput>
          </div>
        </BCol>
      </BRow>
      <BCollapse :visible="otherUsersVisible">
        <BRow v-if="otherUsersVisible">
          <BCol lg="4">
            <h2
              class="h5"
              :aria-label="$t('governance.accessRequest.newRequest.chooseUsers')"
            >
              {{ $t('governance.accessRequest.newRequest.chooseUsers') }}
            </h2>
          </BCol>
          <BCol lg="8">
            <div class="pl-lg-4">
              <FrGovUsersMultiSelect
                v-model="selectedUsers"
                :description="$t('governance.accessRequest.newRequest.maximumUsers')"
                :label="$t('common.users')"
              />
            </div>
          </BCol>
        </BRow>
      </BCollapse>
    </div>
  </BModal>
</template>

<script>
import { mapState } from 'vuex';
import { isEmpty } from 'lodash';
import {
  BCol,
  BCollapse,
  BImg,
  BMedia,
  BMediaBody,
  BModal,
  BRow,
} from 'bootstrap-vue';
import FrCardRadioInput from '@forgerock/platform-shared/src/components/CardRadioInput';
import FrGovUsersMultiSelect from '@forgerock/platform-shared/src/components/governance/GovUsersMultiSelect';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

/**
 * @description Modal that allows select one or more users and redirect to a New Request to make
 * Can select the logged user (Myself)
 * Can select multiple users with a limit of 10
 */
export default {
  name: 'NewRequestModal',
  components: {
    BCol,
    BCollapse,
    BImg,
    BMedia,
    BMediaBody,
    BModal,
    BRow,
    FrCardRadioInput,
    FrGovUsersMultiSelect,
    FrIcon,
  },
  data() {
    return {
      requestOption: 'self',
      selectedUsers: [],
    };
  },
  watch: {
    requestOption() {
      this.selectedUsers = [];
    },
  },
  computed: {
    ...mapState({
      userDetails: (state) => state.UserStore,
    }),
    userFullName() {
      const { givenName, sn } = this.userDetails;
      return this.$t('common.userFullName', {
        givenName,
        sn,
      });
    },
    userName() {
      return this.userDetails.userName;
    },
    otherUsersVisible() {
      return this.requestOption === 'others';
    },
    invalid() {
      if (this.requestOption === 'others') {
        return isEmpty(this.selectedUsers) || this.selectedUsers.length > 10;
      }
      return false;
    },
  },
  methods: {
    /**
     * Redirect to 'AccessRequestNew' component sending as route param the user array for the new request
     */
    requestAccess() {
      const currentUser = {
        id: this.userDetails.userId,
        name: this.userFullName,
        profileImage: this.userDetails.profileImage,
        userName: this.userName,
      };
      const usersToRequest = this.requestOption === 'self'
        ? [currentUser]
        : this.selectedUsers;
      this.$router.push({
        name: 'AccessRequestNew',
        params: {
          requestingFor: usersToRequest,
        },
      });
    },
  },
};
</script>
