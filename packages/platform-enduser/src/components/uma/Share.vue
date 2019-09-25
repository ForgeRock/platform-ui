/* eslint-disable no-underscore-dangle */
<template>
  <BModal
    id="shareModal"
    class=""
    ref="fsModal"
    cancel-variant="outline-secondary"
    @keydown.enter.native.prevent="validateResource"
    @hide="resetModal">
    <div
      slot="modal-header"
      class="d-flex w-100 h-100">
      <div class="media">
        <div class="d-flex mr-3 align-self-center">
          <FrFallbackImage
            :src="resource.icon_uri"
            :height="40"
            :width="40"
            fallback="fa-file-alt" />
        </div>
        <div class="media-body align-self-center">
          <h6 class="my-0">
            {{ resource.name }}
          </h6>
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
        aria-label="Close"
        class="close"
        @click="hideModal">
        <i class="fa fa-times" />
      </button>
    </div>

    <div class="form-group">
      <BInputGroup>
        <BFormInput
          :placeholder="$t('pages.uma.resources.shareWith')"
          v-model="newShare" />
        <BDropdown
          :text="text"
          variant="outline-secondary"
          size="sm"
          slot="append">
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
            :src="require('@/assets/images/profile-default.png')"
            rounded="circle"
            width="34"
            height="34"
            alt="avatar"
            class="mr-3" />
          <div class="media-body">
            <h6 class="mt-2">
              {{ permission.subject }}
            </h6>
          </div>
          <div class="d-flex ml-3 align-self-center">
            <BDropdown
              id="ddown1"
              :text="text"
              variant="link"
              size="sm"
              right
              toggle-class="dropdown-toggle">
              <template
                slot="button-content"
                class="dropdown-toggle">
                <span class="d-none d-sm-inline">
                  Can {{ permission.scopes.join(", ") }}
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

    <div
      slot="modal-footer"
      class="w-100">
      <div>
        <BButton
          type="button"
          variant="link"
          @click="unshareAll">
          {{ $t('pages.uma.resources.unshareAll') }}
        </BButton>
        <div
          class="float-right"
          v-if="newShare">
          <BButton
            type="button"
            variant="outline-secondary mr-2"
            @click="hideModal">
            {{ $t('pages.uma.resources.cancel') }}
          </BButton>
          <BButton
            type="button"
            variant="primary"
            @click="validateResource">
            {{ $t('pages.uma.resources.share') }}
          </BButton>
        </div>
      </div>
    </div>
  </BModal>
</template>

<script>
import _ from 'lodash';
import FallbackImage from '@/components/utils/FallbackImage';

/**
 * @description Dialog for sharing a resource with users
 *
 * */
export default {
  name: 'Share',
  components: {
    FrFallbackImage: FallbackImage,
  },
  props: {
    resource: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      newShare: false,
      text: `Can ${this.resource.scopes[0]}`,
      newScopes: {},
    };
  },
  created() {
    this.setNewScopes();
  },
  watch: {
    resource() {
      // istanbul ignore next
      this.setNewScopes();
    },
  },
  methods: {
    setNewScopes() {
      _.each(this.resource.scopes, (scope) => {
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
      const permissions = this.resource.policy.permissions.filter(obj => obj.subject !== subject);


      const payload = {
        /* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
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
        const index = _.findIndex(this.resource.policy.permissions, perm => perm.subject === this.newShare);

        if (index === -1) {
          if (this.newShare) {
            this.shareResource();
          } else {
            this.displayNotification('error', this.$t('pages.uma.resources.noRequestingParty'));
          }
          // attempting to share with user who already has access to resource
        } else {
          this.displayNotification('error', this.$t('pages.uma.resources.sameShareError', { requestingParty: this.newShare }));
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


      const newScopes = _.keys(_.pickBy(this.newScopes));


      const newPermissions = { subject, scopes: newScopes };


      const payload = {
        policyId: this.resource._id,
        permissions: [],
      };

      // resource has previously been shared
      if (this.resource.policy) {
        payload.permissions = this.resource.policy.permissions.filter(obj => obj.subject !== subject);
        payload.permissions.push(newPermissions);

        this.$emit('modifyResource', this.resource._id, payload, { onSuccess });
      } else {
        payload.permissions.push(newPermissions);

        this.$emit('shareResource', payload, { onSuccess });
      }

      this.hideModal();
    },
    modifyResource(subject, changedScope) {
      const newPermissions = _.map(this.resource.policy.permissions,
        (permission) => {
          const processedPermission = _.cloneDeep(permission);
          if (permission.subject === subject) {
            const scopesLength = permission.scopes.length;

            processedPermission.scopes = _.filter(processedPermission.scopes, scope => scope !== changedScope);

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
