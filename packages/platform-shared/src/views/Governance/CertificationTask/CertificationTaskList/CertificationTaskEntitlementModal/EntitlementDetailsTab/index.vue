<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="p-4">
    <dl class="row">
      <dt class="col-lg-4">
        {{ $t('common.owner') }}
      </dt>
      <dd
        class="col-lg-8 mb-4"
        data-testid="owner">
        {{ blankValueIndicator }}
      </dd>
      <dt class="col-lg-4">
        {{ $t('common.description') }}
      </dt>
      <dd
        class="col-lg-8 mb-4"
        data-testid="entDescription">
        {{ entitlement.description }}
      </dd>
      <dt class="col-lg-4">
        {{ $t('common.country') }}
      </dt>
      <dd
        class="col-lg-8 mb-4"
        data-testid="country">
        {{ blankValueIndicator }}
      </dd>
    </dl>
    <div class="p-4 bg-light rounded">
      <dl
        class="row"
        v-for="item in Object.keys(entitlement)"
        :key="item"
        :data-testid="item">
        <dt class="col-lg-4">
          {{ item }}
        </dt>
        <dd class="col-lg-8 mb-4">
          {{ !isNil(entitlement[item]) ? entitlement[item] : blankValueIndicator }}
        </dd>
      </dl>
    </div>
  </div>
</template>

<script>
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { isNil } from 'lodash';

/**
 * @description tab component to show entitlement details inside the parent BTabs component
 *
 * @param {object} entitlement - object with the entitlement details
 */
export default {
  name: 'EntitlementDetailsTab',
  props: {
    entitlement: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      blankValueIndicator,
      isNil,
    };
  },
};
</script>
