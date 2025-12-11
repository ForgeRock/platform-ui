<!-- Copyright (c) 2021-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard
    no-body
    class="my-4 shadow-none">
    <FrListGroup no-margin>
      <FrListItem
        v-for="(listItem, key) in listItems"
        :key="key"
        :clickable="clickable">
        <template #list-item-header>
          <BRow
            class="w-100 align-items-center"
            @click="handleRowClick($event, key, listItem)">
            <BCol>
              <h5 class="mb-0">
                {{ listItem.title }}
              </h5>
            </BCol>
            <BCol class="text-center">
              <template v-if="listItem.value">
                <BBadge variant="success">
                  {{ $t('common.active') }}
                </BBadge>
              </template>
              <template v-else>
                <BBadge variant="light">
                  {{ $t('common.inactive') }}
                </BBadge>
              </template>
            </BCol>
            <BCol class="text-right">
              <template v-if="listItem.value">
                <BButton
                  @click="changeState(key, false, listItem.route)"
                  variant="link">
                  {{ listItem.disableText || $t('common.deactivate') }}
                </BButton>
              </template>
              <template v-else>
                <BButton
                  @click="changeState(key, true, listItem.route)"
                  variant="link">
                  {{ listItem.enableText || $t('common.activate') }}
                </BButton>
              </template>
            </BCol>
          </BRow>
        </template>
      </FrListItem>
    </FrListGroup>
  </BCard>
</template>

<script setup>
/**
 * A card with a badge that shows the current state and a configurable link t
 * Optionally an event can also be triggered by clicking on the card itself
 *
 * Multiple items can be provided to this component and will each be presented
 * as an individual card with individually configurable enable/disable links
 */
import {
  BBadge,
  BButton,
  BCard,
  BCol,
  BRow,
} from 'bootstrap-vue';
import FrListGroup from '@forgerock/platform-shared/src/components/ListGroup';
import FrListItem from '@forgerock/platform-shared/src/components/ListItem';

const emit = defineEmits(['change']);
const props = defineProps({
  /**
     * The list of cards to display
     * e.g., {
        hostedPages: {
          title: 'Status',
          value: true,
        },
      }
     */
  listItems: {
    default: () => ({}),
    type: Object,
  },
  /**
     A boolean indicating whether a change event should be emitted on row-click
     */
  clickable: {
    default: false,
    type: Boolean,
  },
});

/**
 * Emits the change event with the selected value
 * @param {String} key the key of the state to change
 * @param {Boolean} value true or false toggle value
 * @param {String} route optional page to route to following interaction
 */
function changeState(key, value, route) {
  /**
   * Triggered whenever the enable/disable link is clicked
   * @property {Boolean} value The new value
  */
  emit('change', {
    key,
    value,
    ...(route ? { route } : {}),
  });
}

/**
 * Emits the change event with the selected value
 * @param {Object} event the click event triggering this function
 * @param {String} key the key of the item in the list
 * @param {Object} listItem object containing list item information
 */
function handleRowClick(event, key, listItem) {
  // We want to ignore clicks directly on the button as the elements have independent handlers
  if (props.clickable && event.target.tagName?.toLowerCase() !== 'button') {
    this.changeState(key, listItem.value, listItem.route);
  }
}

</script>
