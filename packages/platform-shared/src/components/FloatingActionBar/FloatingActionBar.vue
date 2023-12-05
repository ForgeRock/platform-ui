<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <Transition
    name="slide-fade"
    duration="1000">
    <BRow
      v-if="count > 0"
      class="floating-action-bar bg-dark rounded position-fixed px-4 py-2">
      <BCol>
        <BRow
          class="justify-content-between"
          align-v="center">
          <div class="mr-3 d-flex">
            <div class="text-light mr-2 my-auto">
              {{ $t('common.selectedColon') }}
              <span
                class="font-weight-bold">
                {{ count }}
              </span>
            </div>
            <BButton
              variant="link"
              class="px-1"
              @click="$emit('deselect', $event)">
              {{ $t('common.deselect') }}
            </BButton>
          </div>
          <div>
            <template v-for="button in buttons">
              <BButton
                :key="button.event"
                class="ml-1"
                variant="dark"
                @click="$emit(button.event, $event)">
                <FrIcon
                  :name="button.icon"
                  :class="`${button.iconClass}`"
                /> {{ button.label }}
              </BButton>
            </template>
            <BDropdown
              class="ml-1"
              no-caret
              right
              boundary="window"
              variant="dark">
              <template #button-content>
                <FrIcon
                  class="md-24"
                  name="more_horiz" />
              </template>
              <template
                v-for="(item, index) in menuItems">
                <div :key="index">
                  <BDropdownDivider
                    v-if="item.divider" />
                  <BDropdownItem
                    v-else
                    @click="$emit('action', item.event, item)">
                    <FrIcon
                      class="mr-2"
                      :name="item.icon"
                    /> {{ item.label }}
                  </BDropdownItem>
                </div>
              </template>
            </BDropdown>
          </div>
        </BRow>
      </BCol>
    </BRow>
  </Transition>
</template>

<script setup>

import {
  BButton, BCol, BDropdown, BDropdownDivider, BDropdownItem, BRow,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { defineProps } from 'vue';

defineProps({
  count: {
    type: Number,
    default: 0,
  },
  buttons: {
    type: Array,
    default() {
      return [{
        event: 'certify',
        icon: 'check',
        iconClass: 'text-success',
        label: this.$t('governance.certificationTask.actions.certify'),
      },
      {
        event: 'revoke',
        icon: 'close',
        iconClass: 'text-danger',
        label: this.$t('governance.certificationTask.actions.revoke'),
      }];
    },
  },
  menuItems: {
    type: Array,
    default() {
      return [{
        event: 'exception',
        icon: 'schedule',
        label: this.$t('governance.certificationTask.actions.allowException'),
      },
      {
        event: 'reassign',
        icon: 'people',
        label: this.$t('governance.certificationTask.actions.reassign'),
      },
      {
        event: 'forward',
        icon: 'redo',
        label: this.$t('governance.certificationTask.actions.forward'),
      },
      {
        divider: true,
      },
      {
        event: 'clearDecisions',
        icon: 'close',
        label: this.$t('governance.certificationTask.actions.reset'),
      }];
    },
  },
});
</script>

<style lang="scss" scoped>
  .floating-action-bar {
      width: 700px;
      bottom: 1.5rem;
      left: 50%;
      margin-left: -350px;
      z-index: 501;

    &.slide-fade-enter-active {
      transition: all .2s ease;
    }
    &.slide-fade-leave-active {
      transition: all .2s ease;
    }
    &.slide-fade-enter, &.slide-fade-leave-to {
      transform: translateY(20px);
      opacity: 0;
    }
  }
</style>
