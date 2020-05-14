<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BTab :title="$t('pages.access.privileges')">
    <div class="px-4 py-2 card-header">
      <BRow>
        <BCol
          md="7"
          class="my-1">
          <BButton
            type="button"
            variant="primary"
            class="mr-1"
            @click="showModal"
            id="add_privilege">
            {{ $t("common.new") }} {{ $t("pages.access.privilege") }}
          </BButton>
          <BButton
            v-show="selected.length > 0"
            variant="outline-primary"
            @click="$refs.removePrivilege.show()"
            id="delete_privilege">
            {{ $t("common.remove") }}
          </BButton>
        </BCol>
      </BRow>
    </div>

    <div class="m-4">
      <!-- TODO: INJECT PRIVILEGES TABLE HERE -->
    </div>
    <BModal
      id="privilegeModal"
      ref="privilegeModal"
      :title="modalTitle"
      size="lg">
      <!-- TODO: INJECT PRIVILEGE EDITOR HERE -->

      <template v-slot:modal-footer="{ cancel }">
        <BButton
          variant="link"
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BButton>
        <BButton
          variant="primary"
          @click="savePrivilege">
          {{ $t('common.save') }}
        </BButton>
      </template>
    </BModal>

    <BModal
      id="removePrivilege"
      ref="removePrivilege"
      :title="$t('pages.access.removeModalTitle')">
      <div>
        {{ $t('pages.access.removeConfirm') }} {{ $t("pages.access.privilege") }}?
      </div>
      <div
        slot="modal-footer"
        class="w-100">
        <div class="float-right">
          <BButton
            variant="btn-link text-danger mr-2"
            @click="$refs.removePrivilege.hide()">
            {{ $t('common.cancel') }}
          </BButton>
          <BButton
            type="button"
            variant="danger"
            @click="removePrivileges">
            {{ $t('common.remove') }}
          </BButton>
        </div>
      </div>
    </BModal>
  </BTab>
</template>

<script>
import {
  BButton,
  BCol,
  BModal,
  BRow,
  BTab,
} from 'bootstrap-vue';

export default {
  name: 'PrivilegesTab',
  components: {
    BButton,
    BCol,
    BModal,
    BRow,
    BTab,
  },
  data() {
    return {
      modalTitle: `${this.$t('common.edit')} ${this.$t('pages.access.privilege')}`,
      selected: [],
    };
  },
  methods: {
    showModal() {
      this.$refs.privilegeModal.show();
    },
    removePrivileges() {
      this.$refs.removePrivilege.hide();
    },
  },
  mounted() {},
};
</script>
