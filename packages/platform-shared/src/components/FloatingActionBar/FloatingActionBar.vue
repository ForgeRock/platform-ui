<!-- Copyright (c) 2023-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div role="alert">
    <Transition
      name="slide-fade"
      duration="1000">
      <div
        v-if="count > 0"
        :class="[barSize === 'sm' ? 'w-500px' : '', 'floating-action-bar bg-dark rounded position-fixed px-4 py-2']">
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
                ref="deselectButton"
                variant="link"
                class="px-1"
                @click="$emit('deselect')">
                {{ $t('common.deselect') }}
              </BButton>
            </div>
            <div class="d-flex">
              <template
                v-for="button in buttons"
                :key="button.event">
                <div
                  v-if="button.divider"
                  class="d-none d-md-inline-block vertical-divider" />
                <BButton
                  v-else
                  class="d-none d-md-inline-block"
                  variant="dark"
                  @click="$emit(button.event, $event.currentTarget)">
                  <FrIcon
                    :name="button.icon"
                    :icon-class="`mr-2 ${button.iconClass}`">
                    {{ button.label }}
                  </FrIcon>
                </BButton>
              </template>
              <div
                v-if="menuItems.length || (buttons.length && width < 768)"
                ref="moreMenuWrapper"
                class="ml-1"
                @focusout="handleMoreMenuFocusOut">
                <BDropdown
                  ref="moreDropdown"
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
                      @click="$emit(item.event, getMoreMenuToggle())">
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
                    <BDropdownDivider v-if="button.divider" />
                    <BDropdownItem
                      v-else
                      class="d-md-none d-block"
                      @click="$emit(button.event, getMoreMenuToggle())">
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
      </div>
    </Transition>
  </div>
</template>

<script setup>
/**
 * Shared component that appears when prop count is greater than 0, and offers
 * supplied actions to perform on selected items.
 */
import { ref } from 'vue';
import {
  BButton,
  BDropdown,
  BDropdownDivider,
  BDropdownItem,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { useWindowSize } from '@vueuse/core';

defineProps({
  count: {
    type: Number,
    required: true,
  },
  barSize: {
    type: String,
    default: 'lg',
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

// Track width of the window to determine if we need to show the dropdown even when there are no menu items
const { width } = useWindowSize();

const deselectButton = ref(null);
const moreDropdown = ref(null);
const moreMenuWrapper = ref(null);

/**
 * Close the more-actions dropdown when keyboard focus leaves its container.
 * This satisfies WCAG 2.4.3 – menus must close when focus moves outside them.
 * @param {FocusEvent} event
 */
function handleMoreMenuFocusOut(event) {
  if (!event.currentTarget.contains(event.relatedTarget) && moreDropdown.value) {
    moreDropdown.value.hide();
  }
}

/**
 * Returns the more-options toggle button element so parents can pass it to
 * $bvModal.show() as the return-focus target. We use a native DOM ref on the
 * wrapper div and querySelector for `.dropdown-toggle` — this avoids traversing
 * Vue 3 compat proxy $refs chains into a Vue 2 child (BDropdown) from a
 * <script setup> parent, which is unreliable in compat mode.
 *
 * Called from the template synchronously at click time, before BV's
 * requestAnimationFrame closes the dropdown and clears document.activeElement.
 */
function getMoreMenuToggle() {
  return moreMenuWrapper.value?.querySelector('.dropdown-toggle') || null;
}

function focusDeselectButton() {
  // BootstrapVue's BButton resolves the template ref to its rendered <button>
  // element directly, so we can call focus() on it without going through $el.
  const btn = deselectButton.value;
  if (btn && typeof btn.focus === 'function') btn.focus();
}

defineExpose({ focusDeselectButton });
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

.w-500px {
  width: 500px;
  margin-left: -250px;
}

.vertical-divider {
  width: 2px;
  height: 48px;
  background-color: $gray-700;
  margin: 0 8px;
}

@media (max-width: 767px) {
  .floating-action-bar {
    width: 400px;
    margin-left: -200px;
  }
}
</style>
