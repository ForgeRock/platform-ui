<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="shareModal"
    cancel-variant="outline-secondary"
    ref="fsModal"
    @hide="resetModal">
    <template #modal-header>
      <div class="d-flex w-100 h-100">
        <div class="media">
          <div class="d-flex mr-3 align-self-center">
            <FrFallbackImage
              :src="resource.icon_uri"
              fallback="description" />
          </div>
          <div class="media-body align-self-center">
            <h2 class="my-0 h6">
              {{ resource.name }}
            </h2>
            <small
              class="text-muted"
              v-if="!resource.policy">
              {{ $t('pages.uma.resources.resourceNotShared') }}
            </small>
            <small
              class="text-muted"
              v-else-if="resource.policy.permissions.length > 1">
              {{ $t('pages.uma.resources.sharedWithPeople', {numberOf: resource.policy.permissions.length}) }}
            </small>
            <small
              class="text-muted"
              v-else>
              {{ $t('pages.uma.resources.sharedWithPerson') }}
            </small>
          </div>
        </div>
        <button
          type="button"
          :aria-label="$t('common.close')"
          class="close"
          @click="hideModal">
          <FrIcon
            icon-class="font-weight-bolder md-24 mb-1"
            name="close" />
        </button>
      </div>
    </template>

    <div
      class="form-group"
      @keydown.enter="validateResource">
      <BInputGroup>
        <BFormInput
          :placeholder="$t('pages.uma.resources.shareWith')"
          v-model="newShare" />
        <template #append>
          <BDropdown
            :text="text"
            variant="outline-secondary"
            size="sm">
            <form
              class="px-4 py-2"
              @click.stop>
              <template v-if="resource.scopes">
                <div
                  class="form-check mb-1"
                  v-for="(scope, index) in resource.scopes"
                  :key="index">
                  <input
                    type="checkbox"
                    class="form-check-input mr-1"
                    id="viewCheck"
                    :checked="newScopes[scope]"
                    @click="newScopes[scope] = !newScopes[scope]">
                  <label
                    class="form-check-label"
                    for="viewCheck">
                    {{ scope }}
                  </label>
                </div>
              </template>
            </form>
          </BDropdown>
        </template>
      </BInputGroup>
    </div>

    <div :class="[{'d-none': this.newShare}]">
      <ul
        class="list-unstyled"
        v-if="resource.policy && resource.policy.permissions">
        <li
          class="media py-2"
          v-for="(permission, index) of resource.policy.permissions"
          :key="index">
          <BImg
            :src="require('@forgerock/platform-shared/src/assets/images/avatar.png')"
            rounded="circle"
            width="34"
            height="34"
            :alt="$t('common.avatar')"
            class="mr-3" />
          <div class="media-body">
            <h2 class="mt-2 h6">
              {{ permission.subject }}
            </h2>
          </div>
          <div class="d-flex ml-3 align-self-center">
            <BDropdown
              id="ddown1"
              :text="text"
              variant="link"
              size="sm"
              right
              toggle-class="dropdown-toggle">
              <template #button-content>
                <span class="dropdown-toggle">
                  <span class="d-none d-sm-inline">
                    {{ $t('pages.uma.resources.permissions', { permissionScopes: permission.scopes.join(", ") }) }}
                  </span>
                </span>
              </template>
              <form
                class="px-4 py-2"
                @click.stop>
                <div
                  class="form-check mb-1"
                  v-for="(value, scope) in newScopes"
                  :key="scope">
                  <input
                    type="checkbox"
                    class="form-check-input mr-1"
                    id="viewCheck"
                    :checked="permission.scopes.includes(scope)"
                    @click="modifyResource(permission.subject, scope)">
                  <label
                    class="form-check-label"
                    for="viewCheck">
                    {{ scope }}
                  </label>
                </div>
              </form>
              <BDropdownDivider />
              <BDropdownItem>
                <span
                  role="button"
                  class="text-danger"
                  @click="unshareOne(permission.subject)">
                  {{ $t('pages.uma.resources.unshare') }}
                </span>
              </BDropdownItem>
            </BDropdown>
          </div>
        </li>
      </ul>
    </div>

    <template #modal-footer>
      <div class="w-100">
        <div>
          <BButton
            variant="link"
            @click="unshareAll">
            {{ $t('pages.uma.resources.unshareAll') }}
          </BButton>
          <div
            class="float-right"
            v-if="newShare">
            <BButton
              variant="outline-secondary mr-2"
              @click="hideModal">
              {{ $t('pages.uma.resources.cancel') }}
            </BButton>
            <BButton
              variant="primary"
              @click="validateResource">
              {{ $t('pages.uma.resources.share') }}
            </BButton>
          </div>
        </div>
      </div>
    </template>
  </BModal>
</template>

<script>
import {
  BButton,
  BDropdown,
  BDropdownDivider,
  BDropdownItem,
  BImg,
  BInputGroup,
  BModal,
} from 'bootstrap-vue';
import {
  cloneDeep, filter, findIndex, each, keys, map, pickBy,
} from 'lodash';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FallbackImage from '@/components/utils/FallbackImage';

/**
 * @description Dialog for sharing a resource with users
 *
 * */
export default {
  name: 'Share',
  mixins: [
    NotificationMixin,
  ],
  components: {
    BButton,
    BDropdown,
    BDropdownDivider,
    BDropdownItem,
    BImg,
    BInputGroup,
    BModal,
    FrFallbackImage: FallbackImage,
    FrIcon,
  },
  props: {
    resource: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      newShare: '',
      text: `Can ${this.resource.scopes[0]}`,
      newScopes: {},
    };
  },
  created() {
    this.setNewScopes();
  },
  watch: {
    resource() {
      this.setNewScopes();
    },
  },
  methods: {
    setNewScopes() {
      each(this.resource.scopes, (scope) => {
        this.newScopes[scope] = true;
      });
    },
    hideModal() {
      this.$refs.fsModal.hide();
      this.resetModal();
    },
    resetModal() {
      this.newShare = '';
      this.setNewScopes();
    },
    unshareOne(subject) {
      const onSuccess = this.resetModal.bind(this);

      // filter subject out of current permissions array
      const permissions = this.resource.policy.permissions.filter((obj) => obj.subject !== subject);

      const payload = {
        policyId: this.resource._id,
        permissions,
      };

      this.$emit('modifyResource', this.resource._id, payload, { onSuccess, unshare: true });
      this.hideModal();
    },
    unshareAll() {
      this.$emit('renderUnshareModal', this.resource.name, this.resource._id);
      this.hideModal();
    },
    validateResource() {
      // resource has already been shared
      if (this.resource.policy && this.resource.policy.permissions) {
        const index = findIndex(this.resource.policy.permissions, (perm) => perm.subject === this.newShare);

        if (index === -1) {
          if (this.newShare) {
            this.shareResource();
          } else {
            this.showErrorMessage('error', this.$t('pages.uma.resources.noRequestingParty'));
          }
          // attempting to share with user who already has access to resource
        } else {
          this.showErrorMessage('error', this.$t('pages.uma.resources.sameShareError', { requestingParty: this.newShare }));
          this.resetModal();
        }
        // shared for first time
      } else if (!this.resource.policy && this.newShare) {
        this.shareResource();
      }
    },
    shareResource() {
      const onSuccess = this.resetModal.bind(this);
      const subject = this.newShare;
      const newScopes = keys(pickBy(this.newScopes));
      const newPermissions = { subject, scopes: newScopes };
      const payload = {
        policyId: this.resource._id,
        permissions: [],
      };

      // resource has previously been shared
      if (this.resource.policy) {
        payload.permissions = this.resource.policy.permissions.filter((obj) => obj.subject !== subject);
        payload.permissions.push(newPermissions);

        this.$emit('modifyResource', this.resource._id, payload, { onSuccess });
      } else {
        payload.permissions.push(newPermissions);

        this.$emit('shareResource', payload, { onSuccess });
      }

      this.hideModal();
    },
    modifyResource(subject, changedScope) {
      const newPermissions = map(this.resource.policy.permissions,
        (permission) => {
          const processedPermission = cloneDeep(permission);
          if (permission.subject === subject) {
            const scopesLength = permission.scopes.length;

            processedPermission.scopes = filter(processedPermission.scopes, (scope) => scope !== changedScope);

            if (scopesLength === processedPermission.scopes.length) {
              processedPermission.scopes.push(changedScope);
            }
          }

          return processedPermission;
        });

      const payload = {
        policyId: this.resource._id,
        permissions: newPermissions,
      };

      this.$emit('modifyResource', this.resource._id, payload);
    },
  },
};
</script>

<style lang="scss" scoped>
span {
  display: block;
  text-align: center;
}
</style>
