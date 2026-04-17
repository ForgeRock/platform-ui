<!-- Copyright (c) 2024-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    class="p-4 flex-grow-1 overflow-auto h-100"
    data-testid="event-details">
    <BContainer
      fluid
      class="mt-4">
      <h2 class="h4 mb-4">
        {{ $t('governance.events.edit.eventDetails') }}
      </h2>
      <div class="border rounded px-4 py-3 mb-4 d-flex justify-content-start align-items-center">
        <BMedia
          no-body
          class="py-1">
          <div
            class="rounded-circle d-flex align-items-center justify-content-center mr-3 bg-lightgreen"
            style="width: 34px; height: 34px;">
            <FrIcon name="person_add_alt" />
          </div>
          <BMediaBody>
            <small class="text-muted">
              {{ $t('governance.events.newEventModal.eventTrigger') }}
            </small>
            <h3
              class="h5 text-dark mb-0"
              data-testid="eventTriggerName">
              {{ eventTriggerName }}
            </h3>
          </BMediaBody>
        </BMedia>
      </div>
      <FrField
        v-model="formFields.eventName"
        class="mb-4"
        data-testid="eventName"
        :label="$t('governance.events.edit.eventName')"
        name="eventName"
        validation="required" />
      <FrField
        v-model="formFields.eventDescription"
        class="mb-4"
        data-testid="eventDescription"
        :label="$t('common.optionalFieldTitle', { fieldTitle: $t('governance.events.edit.eventDescription') })"
        name="eventDescription"
        type="textarea" />
      <FrResourceSelect
        v-model="formFields.eventOwners"
        class="mb-4"
        :fields="['givenName', 'sn', 'userName', 'profileImage']"
        :label="$t('governance.events.edit.eventOwners')"
        resource-path="alpha_user"
        type="multiselect"
        validation="required">
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
                alt=""
                aria-hidden="true"
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
      <BFormGroup>
        <label>
          {{ $t('governance.events.edit.triggerFor') }}
        </label>
        <BFormRadioGroup v-model="userFilterSelection">
          <BFormRadio
            :value="0"
            @change="formFields.filter = {}">
            {{ $t('governance.events.edit.allUsers') }}
          </BFormRadio>
          <BFormRadio
            :value="1">
            {{ $t('governance.events.edit.subsetUsers') }}
          </BFormRadio>
        </BFormRadioGroup>
      </BFormGroup>
      <BCollapse :visible="userFilterSelection === 1">
        <BFormGroup
          v-if="userFilterSelection === 1"
          class="bg-light p-4 rounded mb-0">
          <FrGovernanceFilterBuilder
            class="bg-light shadow-none border-none"
            hide-group
            :prefix-group-text="$t('governance.events.edit.filterTriggerPrefix')"
            :properties="filterProperties"
            :filter-value="formFields.filter"
            resource-name="user"
            :show-temporal-value-field="eventTriggerName === $t('governance.events.types.userUpdate')"
            @filter-update="formFields.filter = $event"
            @toggle-valid="$emit('toggle-valid', $event)" />
        </BFormGroup>
      </BCollapse>
    </BContainer>
  </div>
</template>

<script setup>
import {
  BCollapse,
  BContainer,
  BFormGroup,
  BFormRadio,
  BFormRadioGroup,
  BImg,
  BMedia,
  BMediaBody,
} from 'bootstrap-vue';
import { isEqual } from 'lodash';
import { reactive, ref, watch } from 'vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrGovernanceFilterBuilder from '@forgerock/platform-shared/src/components/filterBuilder/GovernanceFilterBuilder';
import FrResourceSelect from '@forgerock/platform-shared/src/components/Field/ResourceSelect';

const emit = defineEmits(['input', 'toggle-valid']);

// data
const formFields = reactive({
  eventDescription: '',
  eventName: '',
  eventOwners: [],
  filter: {},
});
const userFilterSelection = ref(0);

// props
const props = defineProps({
  eventTriggerName: {
    type: String,
    default: '',
  },
  filterProperties: {
    type: Array,
    default: () => [],
  },
  value: {
    type: Object,
    default: () => ({}),
  },
});

// watchers
watch(
  () => props.value,
  (val, oldVal) => {
    if (isEqual(val, oldVal)) return;
    Object.keys(val).forEach((field) => {
      formFields[field] = val[field];
    });
    userFilterSelection.value = Object.keys(formFields.filter).length;
  },
  { immediate: true, deep: true },
);

watch(
  () => formFields,
  (val) => emit('input', val),
  { deep: true },
);
</script>
