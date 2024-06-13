<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="NewRequestModal"
    size="lg"
    no-close-on-backdrop
    no-close-on-esc
    cancel-variant="link"
    title-class="h5"
    title-tag="h2"
    :ok-title="$t('common.next')"
    :ok-disabled="invalid"
    :title="$t('governance.accessRequest.newRequest.title')"
    @ok="requestAccess">
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
              radio-value="self"
              name="requestOption"
              v-model="requestOption">
              <BMedia
                no-body
                class="align-items-center">
                <BImg
                  :src="profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')"
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
              v-if="hasIDMUsersViewPrivilege"
              class="mb-3"
              radio-value="others"
              name="requestOption"
              v-model="requestOption">
              <BMedia
                no-body
                class="align-items-center">
                <FrIcon
                  name="group_add"
                  icon-class="rounded-circle bg-lightblue mr-3 w-40 p-2 text-primary" />
                <h2
                  class="mb-0 h5"
                  :aria-label="$t('governance.accessRequest.newRequest.otherUsers')">
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
              :aria-label="$t('governance.accessRequest.newRequest.chooseUsers')">
              {{ $t('governance.accessRequest.newRequest.chooseUsers') }}
            </h2>
          </BCol>
          <BCol lg="8">
            <div class="pl-lg-4">
              <FrResourceSelect
                v-model="selectedUsers"
                :description="$t('governance.accessRequest.newRequest.maximumUsers')"
                :fields="['givenName', 'sn', 'userName']"
                :label="$t('common.users')"
                :resource-path="`${$store.state.realm}_user`"
                type="multiselect">
                <template #option="{ option }">
                  <BMedia
                    no-body
                    class="py-1">
                    <BImg
                      :src="option.value.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')"
                      :alt="$t('governance.accessRequest.newRequest.userImageAltText', { userName: option.value.userName })"
                      class="mr-2 align-self-center rounded rounded-circle"
                      width="24" />
                    <BMediaBody>
                      <div class="mb-1 text-dark">
                        {{ $t('common.userFullName', { givenName: option.value.givenName, sn: option.value.sn }) }}
                      </div>
                      <small class="text-muted">
                        {{ option.value.userName }}
                      </small>
                    </BMediaBody>
                  </BMedia>
                </template>
                <template #tag="{ option, remove }">
                  <span class="multiselect__tag">
                    <BMedia
                      no-body
                      class="py-1">
                      <BImg
                        :src="option.value.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')"
                        :alt="$t('governance.accessRequest.newRequest.userImageAltText', { userName: option.value.userName })"
                        class="mr-2 align-self-center rounded rounded-circle"
                        width="24" />
                      <BMediaBody>
                        <div class="mb-1 text-dark">
                          {{ $t('common.userFullName', { givenName: option.value.givenName, sn: option.value.sn }) }}
                        </div>
                        <div>
                          <small class="text-muted">
                            {{ option.value.userName }}
                          </small>
                        </div>
                      </BMediaBody>
                    </BMedia>
                    <span
                      class="multiselect__tag-icon"
                      tabindex="0"
                      :aria-label="$t('common.remove')"
                      @click.prevent="remove(option)"
                      @keydown.enter="remove(option)" />
                  </span>
                </template>
              </FrResourceSelect>
            </div>
          </BCol>
        </BRow>
      </BCollapse>
    </div>
  </BModal>
</template>

<script>
import { mapState } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { useEnduserStore } from '@forgerock/platform-shared/src/stores/enduser';
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
import FrResourceSelect from '@forgerock/platform-shared/src/components/Field/ResourceSelect';
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
    FrIcon,
    FrResourceSelect,
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
    ...mapState(useUserStore, ['givenName', 'sn', 'userName', 'userId', 'hasIDMUsersViewPrivilege']),
    ...mapState(useEnduserStore, ['profileImage']),
    userFullName() {
      return this.$t('common.userFullName', {
        givenName: this.givenName,
        sn: this.sn,
      });
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
        id: this.userId,
        name: this.userFullName,
        profileImage: this.profileImage,
        userName: this.userName,
      };
      const usersToRequest = this.requestOption === 'self'
        ? [currentUser]
        : this.selectedUsers.map((selectedUser) => ({
          id: selectedUser._id,
          name: this.$t('common.userFullName', {
            givenName: selectedUser.givenName,
            sn: selectedUser.sn,
          }),
          profileImage: selectedUser.profileImage,
          userName: selectedUser.userName,
        }));

      this.$store.commit('setRequestCartUsers', usersToRequest);
      this.$router.push({ name: 'AccessRequestNew' });
    },
  },
};
</script>
