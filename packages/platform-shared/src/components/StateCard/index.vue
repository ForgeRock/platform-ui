<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard
    no-body
    class="my-4">
    <FrListGroup
      no-margin
      class="list-group">
      <FrListItem
        :clickable="false">
        <template v-slot:list-item-header>
          <BRow class="w-100 align-items-center">
            <BCol>
              <h5 class="mb-0">
                {{ $t('common.status') }}
              </h5>
            </BCol>
            <BCol class="text-center">
              <span v-if="enabled">
                <BBadge variant="success">
                  {{ $t('common.activated') }}
                </BBadge>
              </span>
              <span v-else>
                <BBadge variant="danger">
                  {{ $t('common.deactivated') }}
                </BBadge>
              </span>
            </BCol>
            <BCol class="text-right">
              <span v-if="enabled">
                <BButton
                  @click="changeState(false)"
                  variant="link">
                  {{ $t('common.deactivate') }}
                </BButton>
              </span>
              <span v-else>
                <BButton
                  @click="changeState(true)"
                  variant="link">
                  {{ $t('common.activate') }}
                </BButton>
              </span>
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
import FrListGroup from '@forgerock/platform-shared/src/components/ListGroup/';
import FrListItem from '@forgerock/platform-shared/src/components/ListItem/';

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
    enabled: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    changeState(newValue) {
      this.$emit('change', newValue);
    },
  },
};
</script>
