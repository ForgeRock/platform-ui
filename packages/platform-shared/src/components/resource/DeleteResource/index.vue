<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BModal
    :id="modalId"
    ref="resourceDeleteModal"
    :static="isTesting">
    <template #modal-title>
      <h5
        class="fr-modal-title mb-0">
        {{ $t(`pages.identities.deleteResource.title`, { resource: resourceTitle }) }}
      </h5>
    </template>
    <p>{{ $t(`pages.identities.deleteResource.body`, { resource: nameDisplayed }) }}</p>
    <template v-slot:modal-footer="{ cancel }">
      <BButton
        variant="link"
        class="text-danger"
        data-test-id="cancelButton"
        @click="cancel()">
        {{ $t('common.cancel') }}
      </BButton>
      <BButton
        @click="deleteResource()"
        data-test-id="deleteButton"
        variant="danger">
        {{ $t(`pages.identities.deleteResource.primaryButton`, { resource: nameDisplayed }) }}
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

export default {
  name: 'DeleteResource',
  mixins: [
    NotificationMixin,
  ],
  components: {
    BButton,
    BModal,
  },
  computed: {
    resourceTitle() {
      return this.nameDisplayed.charAt(0).toUpperCase() + this.nameDisplayed.slice(1);
    },
    nameDisplayed() {
      return this.displayName || this.resourceName;
    },
  },
  props: {
    modalId: {
      type: String,
      default: 'deleteResource',
    },
    deleteManagedResource: {
      type: Function,
      default: () => {
        const retv = {
          then: () => {},
        };
        return retv;
      },
    },
    deleteInternalResource: {
      type: Function,
      default: () => {
        const retv = {
          then: () => {},
        };
        return retv;
      },
    },
    displayName: {
      type: String,
      default: '',
    },
    resourceToDeleteId: {
      type: String,
      default: '',
    },
    resourceName: {
      type: String,
      default: '',
    },
    resourceType: {
      type: String,
      default: '',
    },
    // Required to render modal for integration testing
    isTesting: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    deleteResource() {
      let resourceFunction;
      // TODO: unify the below endpoints for "managed" and "internal"
      if (this.resourceType === 'managed') {
        resourceFunction = this.deleteManagedResource(this.resourceName, this.resourceToDeleteId);
      } else {
        resourceFunction = this.deleteInternalResource(this.resourceName, this.resourceToDeleteId);
      }
      resourceFunction
        .then(() => {
          this.$refs.resourceDeleteModal.hide();
          this.$emit('resource-deleted');
        })
        .catch((err) => {
          this.showErrorMessage(
            err,
            this.$t('application.errors.errorDeletingResource'),
          );
        });
    },
  },
  mounted() {
    /**
     * Trigger cancel event for parent.
     */
    this.$root.$on('bv::modal::hide', (bvEvent) => {
      /**
       * `bvEvent.trigger` for programmatic modal hiding is `null`.
       * Programmatic `hide` is only used when a resource is successfully deleted,
       * and this (below) is only used when the delete action is *cancelled*.
       */
      if (bvEvent.trigger) {
        this.$emit('cancel-resource-deletion');
      }
    });
  },
  watch: {
    resourceToDeleteId(value) {
      /**
       * Don't open if "clearing" value
       */
      if (value) { this.$refs.resourceDeleteModal.show(); }
    },
  },
};
</script>
