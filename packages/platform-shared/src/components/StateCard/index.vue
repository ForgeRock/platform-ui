<!-- Copyright (c) 2021-2024 ForgeRock. All rights reserved.

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
        :clickable="false">
        <template #list-item-header>
          <BRow class="w-100 align-items-center">
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
                  @click="changeState(key, false)"
                  variant="link">
                  {{ $t('common.deactivate') }}
                </BButton>
              </template>
              <template v-else>
                <BButton
                  @click="changeState(key, true)"
                  variant="link">
                  {{ $t('common.activate') }}
                </BButton>
              </template>
            </BCol>
          </BRow>
        </template>
      </FrListItem>
    </FrListGroup>
  </BCard>
</template>

<script>
import {
  BBadge,
  BButton,
  BCard,
  BCol,
  BRow,
} from 'bootstrap-vue';
import FrListGroup from '@forgerock/platform-shared/src/components/ListGroup';
import FrListItem from '@forgerock/platform-shared/src/components/ListItem';

/**
 * A card with a badge that shows the current state and a link to switch between active and inactive
 * If state is active, link text will be 'deactivate'
 * If inacvtive, link text will be 'activate'
 *
 * Multiple states can be provided to this component and will be presented for enable/disable each
 * flag as list items
 */
export default {
  name: 'StateCard',
  components: {
    BBadge,
    BButton,
    BCard,
    BCol,
    BRow,
    FrListGroup,
    FrListItem,
  },
  props: {
    /**
     * The list of states
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
  },
  methods: {
    /**
     * Emits the change event with the selected value
     * @param {String} key the key of the state to change
     * @param {Boolean} value true or false toggle value
     */
    changeState(key, value) {
      /**
       * Triggered whenever the link is clicked to change the state
       * @property {Boolean} newValue The new state value
       */
      this.$emit('change', { key, value });
    },
  },
};
</script>
