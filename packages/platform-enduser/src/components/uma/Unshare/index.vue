<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BModal
    id="unshareModal"
    ref="fsModal"
    cancel-variant="outline-secondary"
    @keydown.enter.native.prevent="unshare">
    <template v-slot:modal-header>
      <div class="d-flex w-100 h-100">
        <h6 class="my-0">
          {{ $t('pages.uma.resources.unshareResource', {resourceName: resourceName}) }}
        </h6>
        <button
          type="button"
          aria-label="Close"
          class="close"
          @click="hideModal">
          <i class="material-icons-outlined font-weight-bolder md-24 mb-1">
            close
          </i>
        </button>
      </div>
    </template>
    {{ $t('pages.uma.resources.warningMessage') }}
    <template v-slot:modal-footer>
      <div class="float-right">
        <BBtn
          variant="outline-secondary mr-2"
          @click="hideModal">
          {{ $t('pages.uma.resources.cancel') }}
        </BBtn>
        <BBtn
          type="button"
          variant="danger"
          @click="unshare">
          {{ $t('pages.uma.resources.unshare') }}
        </BBtn>
      </div>
    </template>
  </BModal>
</template>

<script>
/**
 * @description Dialog for warning a user and confirming they want to stop sharing a resource
 *
 * */
export default {
  name: 'Unshare',
  components: {},
  data() {
    return {};
  },
  props: {
    resourceId: {
      type: String,
      default: () => '',
    },
    resourceName: {
      type: String,
      default: () => '',
    },
  },
  methods: {
    hideModal() {
      this.$refs.fsModal.hide();
    },
    unshare() {
      this.$emit('unshareResource', this.resourceId);
      this.hideModal();
    },
  },
};
</script>
