<!-- Copyright 2024 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BRow class="mb-3">
    <BCol lg="3">
      <h2 class="h5 mb-4">
        {{ $t('governance.events.edit.eventDetails') }}
      </h2>
    </BCol>
    <BCol lg="9">
      <BRow>
        <BCol lg="6">
          <small class="mb-1 d-block">
            {{ $t('common.name') }}
          </small>
          <dd
            class="mb-3"
            data-testid="eventName">
            {{ summary.eventName || blankValueIndicator }}
          </dd>
          <small class="mb-1 d-block">
            {{ $t('common.description') }}
          </small>
          <dd
            class="mb-3"
            data-testid="description">
            {{ summary.description || blankValueIndicator }}
          </dd>
          <small class="mb-1 d-block">
            {{ $t('governance.events.listView.eventType') }}
          </small>
          <dd
            class="mb-3"
            data-testid="eventTriggerName">
            {{ eventTriggerName || blankValueIndicator }}
          </dd>
        </BCol>
        <BCol lg="6">
          <small class="mb-1 d-block">
            {{ $t('common.owners') }}
          </small>
          <dd v-if="summary.eventOwners?.length">
            <BMedia
              v-for="owner in summary.eventOwners"
              :key="owner._id"
              no-body
              class="mb-3">
              <BImg
                :src="owner.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')"
                :alt="$t('governance.accessRequest.newRequest.userImageAltText', { userName: owner.userName })"
                class="mr-3 align-self-center rounded-circle"
                width="24" />
              <BMediaBody>
                <div class="mb-1 text-dark">
                  {{ $t('common.userFullName', { givenName: owner.givenName, sn: owner.sn }) }}
                </div>
                <div>
                  <small class="text-muted">
                    {{ owner.userName }}
                  </small>
                </div>
              </BMediaBody>
            </BMedia>
          </dd>
          <dd v-else>
            {{ blankValueIndicator }}
          </dd>
        </BCol>
      </BRow>
    </BCol>
  </BRow>
</template>

<script setup>
import {
  BCol,
  BImg,
  BMedia,
  BMediaBody,
  BRow,
} from 'bootstrap-vue';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';

defineProps({
  eventTriggerName: {
    type: String,
    default: '',
  },
  summary: {
    type: Object,
    default: () => ({}),
  },
});
</script>
