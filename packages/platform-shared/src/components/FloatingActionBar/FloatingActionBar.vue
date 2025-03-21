<!-- Copyright (c) 2023-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <Transition
    name="slide-fade"
    duration="1000">
    <div
      v-if="count > 0"
      role="alert"
      class="floating-action-bar bg-dark rounded position-fixed px-4 py-2">
      <div class="w-100">
        <div class="d-flex justify-content-between align-items-center">
          <div class="mr-3 d-flex">
            <div class="text-light mr-2 my-auto">
              {{ $t('common.selectedColon') }}
              <span class="font-weight-bold">
                {{ count }}
              </span>
            </div>
            <BButton
              variant="link"
              class="px-1"
              @click="$emit('deselect')">
              {{ $t('common.deselect') }}
            </BButton>
          </div>
          <div>
            <template
              v-for="button in buttons"
              :key="button.event">
              <BButton
                class="d-none d-md-inline-block"
                variant="dark"
                @click="$emit(button.event, $event)">
                <FrIcon
                  :name="button.icon"
                  :icon-class="`mr-2 ${button.iconClass}`">
                  {{ button.label }}
                </FrIcon>
              </BButton>
            </template>
            <BDropdown
              v-if="menuItems.length"
              class="ml-1"
              no-caret
              right
              boundary="window"
              variant="dark">
              <template #button-content>
                <FrIcon
                  icon-class="md-24"
                  name="more_horiz" />
              </template>
              <template
                v-for="(item, index) in menuItems"
                :key="index">
                <BDropdownDivider v-if="item.divider" />
                <BDropdownItem
                  v-else
                  @click="$emit(item.event, item)">
                  <FrIcon
                    icon-class="mr-2"
                    :name="item.icon">
                    {{ item.label }}
                  </FrIcon>
                </BDropdownItem>
              </template>
              <template
                v-for="button in buttons"
                :key="button.event">
                <BDropdownItem
                  class="d-md-none d-block"
                  @click="$emit(button.event, $event)">
                  <FrIcon
                    :name="button.icon"
                    :icon-class="`mr-2 ${button.iconClass}`">
                    {{ button.label }}
                  </FrIcon>
                </BDropdownItem>
              </template>
            </BDropdown>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
/**
 * Shared component that appears when prop count is greater than 0, and offers
 * supplied actions to perform on selected items.
 */
import {
  BButton,
  BDropdown,
  BDropdownDivider,
  BDropdownItem,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

defineProps({
  count: {
    type: Number,
    required: true,
  },
  buttons: {
    type: Array,
    default: () => [],
  },
  menuItems: {
    type: Array,
    default: () => [],
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

  &.slide-fade-enter-active,
  &.slide-fade-leave-active {
    transition: all .2s ease;
  }

  &.slide-fade-enter,
  &.slide-fade-leave-to {
    transform: translateY(20px);
    opacity: 0;
  }
}

@media (max-width: 767px) {
  .floating-action-bar {
    width: 400px;
    margin-left: -200px;
  }
}
</style>
