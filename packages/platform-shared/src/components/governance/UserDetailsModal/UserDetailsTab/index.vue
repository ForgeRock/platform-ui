<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="p-4">
    <dl
      class="row"
      v-for="(detail, name) in user"
      :key="name"
      :data-testid="name">
      <dt class="col-lg-4">
        {{ $t(`common.user.${name}`) }}
      </dt>
      <dd class="col-lg-8 mb-4">
        <template v-if="name === 'manager' && !isEmpty(manager)">
          <BMedia>
            <template #aside>
              <BImg
                class="mt-2"
                height="24"
                width="24"
                :alt="manager.givenName"
                aria-hidden
                :src="manager.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
            </template>
            <div
              class="media-body">
              <h5
                class="mb-0 text-dark text-truncate">
                {{ $t('common.userFullName', { givenName: manager.givenName, sn: manager.sn }) }}
              </h5>
              <small class="text-truncate d-block">
                {{ manager.userName }}
              </small>
              <small class="text-truncate d-block">
                {{ manager.mail }}
              </small>
            </div>
          </BMedia>
        </template>
        <template v-else>
          {{ detail || blankValueIndicator }}
        </template>
      </dd>
    </dl>
  </div>
</template>

<script>
import { isEmpty } from 'lodash';
import { BImg, BMedia } from 'bootstrap-vue';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';

export default {
  name: 'UserDetailsTab',
  components: {
    BImg,
    BMedia,
  },
  props: {
    manager: {
      type: Object,
      default: () => ({}),
    },
    user: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      blankValueIndicator,
    };
  },
  methods: {
    isEmpty,
  },
};
</script>
