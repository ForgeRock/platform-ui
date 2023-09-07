<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="accessRequestItemModal"
    size="lg"
    cancel-variant="link"
    :visible="visible"
    :static="visible"
    @hidden="$emit('modal-closed')"
    @ok="$emit('toggle-item', item)">
    <!-- Modal Header -->
    <template #modal-header="{ close }">
      <BMedia
        class="align-items-center"
        no-body>
        <div>
          <BImg
            v-if="!modalProps.isRole"
            height="36"
            width="36"
            class="mr-4"
            :alt="item.appType || $t('governance.accessRequest.newRequest.role')"
            :src="item.icon"
            fluid />
          <div
            v-else
            class="rounded-circle bg-lightblue color-blue d-flex align-items-center justify-content-center mr-4"
            style="width: 36px; height: 36px;">
            <FrIcon name="assignment_ind" />
          </div>
        </div>
        <BMediaBody>
          <small
            class="text-muted"
            data-testid="modal-title"
          >
            {{ modalProps.modalTitle }}
          </small>
          <h2
            class="m-0 h5 modal-title"
            data-testid="item-name"
          >
            {{ item.name }}
          </h2>
        </BMediaBody>
      </BMedia>
      <BButtonClose
        variant="link"
        class="ml-auto"
        @click="close">
        <FrIcon
          name="close"
          class="md-24" />
      </BButtonClose>
    </template>

    <!-- Modal Body -->
    <!-- Description field (for all types) -->
    <BRow>
      <BCol>
        <small class="mb-1">{{ $t('common.description') }}</small>
        <p
          class="mb-4"
          data-testid="description"
        >
          {{ item.description || blankValueIndicator }}
        </p>
      </BCol>
    </BRow>

    <!-- Dynamic glossary fields -->
    <BRow data-testid="glossary-fields">
      <BCol
        md="6"
        class="mb-4"
        v-for="(glossary, key) in glossarySchema"
        :key="key">
        <small
          class="mb-1"
          :data-testid="`glossary-title${glossary.id}`"
        >
          {{ glossary.displayName }}
        </small>
        <p :data-testid="`glossary-item${glossary.id}`">
          {{ translateGlossaryAttribute(glossary.name) }}
        </p>
      </BCol>
    </BRow>

    <!-- Modal Footer -->
    <template #modal-footer="{ ok, cancel }">
      <div
        class="d-flex w-100"
        :class="modalProps.footerClass"
      >
        <BButton
          :variant="modalProps.okVariant"
          @click="ok()">
          <FrIcon
            v-if="modalProps.isRequested"
            class="mr-2"
            :outlined="true"
            name="remove" />
          {{ modalProps.okTitle }}
        </BButton>
        <BButton
          :variant="modalProps.cancelVariant"
          @click="cancel()">
          {{ modalProps.cancelTitle }}
        </BButton>
      </div>
    </template>
  </BModal>
</template>

<script setup>
/**
 * Modal component to show glossary atributes of access request catalog items
 */
import {
  capitalize,
  get,
  includes,
  split,
} from 'lodash';
import {
  BButton,
  BButtonClose,
  BCol,
  BImg,
  BMedia,
  BMediaBody,
  BModal,
  BRow,
} from 'bootstrap-vue';
import { computed, ref } from 'vue';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { getUserDetails } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import i18n from '@/i18n';

const props = defineProps({
  glossarySchema: {
    type: Array,
    default: () => [],
  },
  item: {
    type: Object,
    default: () => ({}),
  },
  itemType: {
    type: String,
    default: '',
  },
  visible: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['toggle-item', 'modal-closed']);

// Data
const ownerName = ref(blankValueIndicator);

// Computed
const modalProps = computed(() => {
  const type = capitalize(props.itemType);
  const isRequested = props.item.requested;
  const okTitle = isRequested
    ? i18n.global.t('governance.accessRequest.newRequest.removeFromRequest')
    : i18n.global.t('governance.accessRequest.newRequest.addToRequest');
  const okVariant = isRequested ? 'outline-danger' : 'primary';
  const cancelVariant = isRequested ? 'outline-primary' : 'link';
  const cancelTitle = isRequested ? i18n.global.t('common.done') : i18n.global.t('common.cancel');
  const footerClass = isRequested ? 'justify-content-between' : 'flex-row-reverse';
  return {
    cancelTitle,
    cancelVariant,
    footerClass,
    isRequested,
    isRole: props.itemType === 'role',
    modalTitle: i18n.global.t('governance.accessRequest.newRequest.requestTypeAccess', { type }),
    okTitle,
    okVariant,
  };
});

/**
 * Get and parse user full name by ID
 * @param {String} rawId user id in the format returned by the backend
 */
function getUserFullName(rawId) {
  if (!rawId) {
    ownerName.value = blankValueIndicator;
    return;
  }
  const id = split(rawId, '/')[2];
  getUserDetails(id)
    .then(({ data }) => {
      const userData = get(data, 'result[0]', {});
      ownerName.value = i18n.global.t('common.userFullName', {
        givenName: userData?.givenName,
        sn: userData?.sn,
      });
    })
    .catch(() => {
      ownerName.value = blankValueIndicator;
    });
}

/**
 * Gets the value of the glossary attribute according to the name
 * @param {String} glossaryName glossary attribute name
 */
function translateGlossaryAttribute(glossaryName) {
  // If it is not an 'owner' attribute it is translated directly from the value in the item.
  if (!includes(glossaryName, 'Owner')) {
    return props.item.glossary?.[glossaryName] || blankValueIndicator;
  }
  // If it is an owner tribute we search for the user's name
  const rawId = props.item.glossary?.[`${props.itemType}Owner`];
  getUserFullName(rawId);
  return ownerName.value;
}
</script>
