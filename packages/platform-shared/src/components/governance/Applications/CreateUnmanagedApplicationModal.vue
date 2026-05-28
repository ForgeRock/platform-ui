<!-- Copyright 2026 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <VeeForm
    v-slot="{ meta: { valid, pending } }"
    as="span">
    <BModal
      id="createUnmanagedApplicationModal"
      no-close-on-backdrop
      size="lg"
      title-class="h5"
      title-tag="h2"
      :title="$t('governance.unmanagedApplications.addUnmanagedAppModal.title')"
      :static="isTesting"
      @show="initializeModal">
      <FrFormGenerator
        :schema="schema"
        :model="model"
        @update:model="updateModel">
        <template #application-owners="{ property }">
          <FrRelationshipEdit
            class="mb-4"
            parent-resource="managed/application"
            :relationship-property="relationshipProperty"
            :index="2"
            @setValue="updateModel({ value: $event, path: property.model })" />
        </template>
        <template #logo>
          <div class="border-right d-flex align-items-center justify-content-center h-100">
            <img
              :src="logoSrc"
              :alt="$t('applications.edit.applicationDetails.appLogoAltText')"
              height="54"
              width="54"
              :onerror="onImageError">
          </div>
        </template>
      </FrFormGenerator>

      <template #modal-footer="{ cancel }">
        <BButton
          variant="link"
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BButton>
        <FrButtonWithSpinner
          variant="primary"
          :button-text="$t('governance.unmanagedApplications.addUnmanagedAppModal.createApp')"
          :disabled="!valid || isSaving || pending"
          :show-spinner="isSaving || pending"
          :spinner-text="pending ? $t('common.validating') : $t('common.saving')"
          @click="saveForm" />
      </template>
    </BModal>
  </VeeForm>
</template>

<script setup>
import { computed, ref } from 'vue';
import { set } from 'lodash';
import {
  BButton,
  BModal,
} from 'bootstrap-vue';
import { Form as VeeForm } from 'vee-validate';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrFormGenerator from '@forgerock/platform-shared/src/components/FormGenerator';
import FrRelationshipEdit from '@forgerock/platform-shared/src/components/resource/RelationshipEdit';
import { onImageError, resolveImage } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import i18n from '@/i18n';

defineProps({
  isSaving: {
    type: Boolean,
    default: false,
  },
  relationshipProperty: {
    type: Object,
    default: () => ({}),
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['create']);

const model = ref({});

const schema = [
  [
    {
      model: 'name',
      label: i18n.global.t('governance.unmanagedApplications.addUnmanagedAppModal.nameLabel'),
      description: i18n.global.t('governance.unmanagedApplications.addUnmanagedAppModal.nameDescription'),
      type: 'string',
      validation: {
        required: true,
        alpha_dash_spaces: true,
        single_spaces: true,
      },
    },
  ],
  [
    {
      model: 'description',
      label: i18n.global.t('governance.unmanagedApplications.addUnmanagedAppModal.descriptionLabel'),
      description: '',
      type: 'string',
      autocomplete: 'off',
    },
  ],
  [
    {
      model: 'ownerIds',
      label: i18n.global.t('governance.unmanagedApplications.addUnmanagedAppModal.ownersLabel'),
      customSlot: 'application-owners',
      type: 'multiselect',
      validation: { required: true },
    },
  ],
  [
    {
      columns: 2,
      columnClass: 'mb-3 pr-0 border-left border-top border-bottom',
      customSlot: 'logo',
      model: 'custom',
    },
    {
      columns: 10,
      columnClass: 'mb-3 pt-3 pr-lg-3 border-right border-top border-bottom',
      label: i18n.global.t('governance.unmanagedApplications.addUnmanagedAppModal.logoUriLabel'),
      description: i18n.global.t('governance.unmanagedApplications.addUnmanagedAppModal.logoUriDescription'),
      model: 'icon',
      type: 'string',
    },
  ],
];

const logoSrc = computed(() => model.value.icon || resolveImage('custom.svg'));

function updateModel({ value, path }) {
  set(model.value, path, value);
}

function initializeModal() {
  model.value = {};
}

function saveForm() {
  const ownerIds = (model.value.ownerIds || []).map(({ _ref }) => _ref.split('/').slice(2).join('/'));
  emit('create', { ...model.value, ownerIds });
}
</script>
