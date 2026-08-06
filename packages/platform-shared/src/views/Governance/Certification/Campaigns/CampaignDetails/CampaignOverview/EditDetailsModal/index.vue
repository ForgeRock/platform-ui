<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="EditDetailsModal"
    no-close-on-backdrop
    size="lg"
    title-class="h5"
    title-tag="h2"
    :static="isTesting"
    :title="$t('governance.certificationDetails.editDetailsModal.title')"
    @show="resetModal"
    @hidden="resetModal">
    <FrField
      v-model="titleDraft"
      class="mb-3"
      data-testid="edit-details-title-input"
      name="campaignTitle"
      type="string"
      :label="$t('governance.certificationDetails.editDetailsModal.titleLabel')"
    />
    <FrGovResourceSelect
      :key="ownerSelectKey"
      name="ownerSelect"
      resource-path="managed/user"
      :initial-data="ownerInitialData"
      :label="$t('governance.certificationDetails.campaignOwnerLabel')"
      :set-initial-value="false"
      @get-user-info="handleOwnerInfo"
    />
    <template #modal-footer="{ cancel }">
      <BButton
        variant="link"
        @click="cancel">
        {{ $t('common.cancel') }}
      </BButton>
      <FrButtonWithSpinner
        data-testid="edit-details-save-button"
        variant="primary"
        :disabled="loading || !hasChanges"
        :show-spinner="loading"
        :button-text="$t('common.save')"
        :spinner-text="$t('common.saving')"
        @click="save"
      />
    </template>
  </BModal>
</template>

<script setup>
import { computed, ref } from 'vue';
import {
  BButton,
  BModal,
} from 'bootstrap-vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
  currentTitle: {
    type: String,
    default: '',
  },
  currentOwner: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['save']);

const titleDraft = ref('');
const ownerInfo = ref(null);
const ownerChanged = ref(false);
const ownerSelectKey = ref(0);

const currentOwnerId = computed(() => props.currentOwner && (props.currentOwner.id || props.currentOwner._id));

const ownerInitialData = computed(() => {
  if (!props.currentOwner) return {};
  const ownerId = props.currentOwner.id || props.currentOwner._id;
  return ownerId ? { ...props.currentOwner, id: ownerId } : {};
});

const hasChanges = computed(() => {
  const titleChanged = titleDraft.value && titleDraft.value !== props.currentTitle;
  return titleChanged || ownerChanged.value;
});

function handleOwnerInfo(userInfo) {
  ownerInfo.value = userInfo || null;
  const newId = userInfo && (userInfo.id || userInfo._id);
  ownerChanged.value = !!(newId && newId !== currentOwnerId.value);
}

function resetModal() {
  titleDraft.value = props.currentTitle || '';
  ownerInfo.value = null;
  ownerChanged.value = false;
  ownerSelectKey.value += 1;
}

function save() {
  emit('save', {
    title: titleDraft.value !== props.currentTitle ? titleDraft.value : null,
    ownerInfo: ownerChanged.value ? ownerInfo.value : null,
  });
}

defineExpose({
  titleDraft,
  ownerInfo,
  ownerChanged,
  ownerSelectKey,
  hasChanges,
  ownerInitialData,
  handleOwnerInfo,
  resetModal,
  save,
});
</script>
