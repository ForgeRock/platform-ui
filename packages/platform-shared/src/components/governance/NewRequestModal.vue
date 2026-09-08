<!-- Copyright (c) 2023-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="NewRequestModal"
    size="lg"
    no-close-on-backdrop
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
                  alt=""
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
                      alt=""
                      aria-hidden="true"
                      class="mr-2 align-self-center rounded rounded-circle"
                      width="24" />
                    <BMediaBody>
                      <div class="mb-1 text-dark">
                        {{ $t('common.userFullName', { givenName: option.value.givenName, sn: option.value.sn }) }}
                      </div>
                      <small class="fr-tag-secondary-text">
                        {{ option.value.userName }}
                      </small>
                    </BMediaBody>
                  </BMedia>
                </template>
                <template #tag="{ option, remove }">
                  <span
                    class="multiselect__tag"
                    tabindex="-1">
                    <BMedia
                      no-body
                      class="py-1">
                      <BImg
                        :src="option.value.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')"
                        alt=""
                        aria-hidden="true"
                        class="mr-2 align-self-center rounded rounded-circle"
                        width="24" />
                      <BMediaBody>
                        <div class="mb-1 text-dark">
                          {{ $t('common.userFullName', { givenName: option.value.givenName, sn: option.value.sn }) }}
                        </div>
                        <div>
                          <small class="fr-tag-secondary-text">
                            {{ option.value.userName }}
                          </small>
                        </div>
                      </BMediaBody>
                    </BMedia>
                    <!-- mousedown.prevent mirrors MultiselectBase's default tag icon: the click never moves focus onto the icon,
                      so removing a tag cannot drop focus to <body> when the icon is unmounted with its tag -->
                    <span
                      role="button"
                      class="multiselect__tag-icon"
                      tabindex="-1"
                      :aria-label="$t('common.removeObject', { object: $t('common.userFullName', { givenName: option.value.givenName, sn: option.value.sn }) })"
                      @mousedown.prevent.stop="removeUser(option, remove)" />
                  </span>
                </template>
              </FrResourceSelect>
            </div>
          </BCol>
        </BRow>
      </BCollapse>
      <!-- Removal announcements; the region stays mounted so screen readers register it once -->
      <div
        ref="announcer"
        aria-atomic="true"
        aria-live="assertive"
        class="sr-only">
        <span data-testid="removal-announcement">{{ removalAnnouncement }}</span>
      </div>
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
      removalAnnouncement: '',
      // Suppresses the removal announcement while the radio-option switch clears the selection
      isResettingSelection: false,
    };
  },
  watch: {
    requestOption() {
      this.isResettingSelection = true;
      this.selectedUsers = [];
      this.removalAnnouncement = '';
    },
    /**
     * Announces removed users for every removal path (tag X click, Backspace, programmatic) by diffing the previous selection
     * and updating the in-modal live region. Skipped while the radio-option switch clears the selection (isResettingSelection).
     *
     * @param {Array} newUsers the users selected after the change
     * @param {Array} oldUsers the users selected before the change
     */
    selectedUsers(newUsers, oldUsers = []) {
      const removed = oldUsers.filter((user) => !newUsers.includes(user));
      if (this.isResettingSelection) {
        this.isResettingSelection = false;
        return;
      }
      removed.forEach((user) => {
        const userName = this.$t('common.userFullName', {
          givenName: user.givenName,
          sn: user.sn,
        });
        this.removalAnnouncement = this.$t('governance.accessRequest.newRequest.userRemoved', { user: userName });
      });
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
     * Removes a user tag via the multiselect's own remove callback and restores focus.
     * Announcements are handled by the selectedUsers watcher so every removal path is covered.
     *
     * @param {Object} option the multiselect's internal option object (raw user record under .value)
     * @param {Function} remove the multiselect's own remove callback
     */
    removeUser(option, remove) {
      const removedIndex = this.selectedUsers.indexOf(option.value);
      const preRemovalIconCount = (this.$refs.announcer?.closest('.modal-body')
        || [...document.querySelectorAll('.modal')].find((modal) => modal.classList.contains('show')))
        ?.querySelectorAll('.multiselect__tag-icon').length ?? 0;
      remove(option);
      // Vue patches asynchronously, so query and focus the surviving icons in the post-patch tick
      this.$nextTick(() => this.restoreFocusAfterRemoval(removedIndex, preRemovalIconCount));
    },
    /**
     * Restores focus after a tag removal so focus is not dropped to <body> when the activated remove icon is unmounted with its tag.
     * Targets the removed tag's neighbouring remove icon(previous tag, or the new first tag after a first-tag removal),
     * falling back to the search input when no tags remain.
     *
     * @param {Number} removedIndex index of the removed user in the pre-removal selection
     * @param {Number} preRemovalIconCount number of tag icons in the DOM before the removal
     */
    restoreFocusAfterRemoval(removedIndex, preRemovalIconCount) {
      const modalBody = this.$refs.announcer?.closest('.modal-body')
        || [...document.querySelectorAll('.modal')].find((modal) => modal.classList.contains('show'));
      const removeIcons = modalBody ? [...modalBody.querySelectorAll('.multiselect__tag-icon')] : [];
      if (removeIcons.length >= preRemovalIconCount && preRemovalIconCount > 0) return;
      // Previous tag's icon; after a first-tag removal (-1) fall forward to the new first tag
      const targetIndex = removedIndex === 0 ? 0 : removedIndex - 1;
      // Located by type because the search input's class is state-dependent in MultiselectBase
      const target = removeIcons[targetIndex] || modalBody?.querySelector('input[type="search"]');
      if (target) target.focus();
    },
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
