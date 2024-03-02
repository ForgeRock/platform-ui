<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <template>
      <div id="listView">
        <BCard
          no-body
          class="mt-4">
          <BListGroup flush>
            <BListGroupItem
              v-for="(request, index) in requests"
              :key="index">
              <div class="d-sm-flex">
                <div class="media-body align-self-center mb-2 mb-sm-0">
                  <div class="mb-2">
                    <small><strong>{{ request.user }}</strong> {{ $t('pages.uma.requests.requestedAccess') }}</small>
                  </div>
                  <div class="media mb-1">
                    <div class="d-flex mr-2 align-self-center">
                      <FrFallbackImage
                        v-if="request.icon_uri"
                        :src="request.icon_uri"
                        fallback="description" />
                    </div>
                    <div class="media-body align-self-center">
                      <div class="media-body align-self-center">
                        {{ request.resource }}
                      </div>
                    </div>
                  </div>
                  <small class="text-muted">
                    {{ formatTime(request.when) }}
                  </small>
                </div>
                <div
                  class="d-flex justify-content-start ml-sm-3 align-self-center"
                  v-if="!request.decision">
                  <a
                    href="#"
                    class="pr-3"
                    @click="finalizeAccess(request, index, 'approve')">
                    {{ $t('pages.uma.requests.allow') }}
                  </a>
                  <a
                    href="#"
                    class="px-2"
                    @click="finalizeAccess(request, index, 'deny')">
                    {{ $t('pages.uma.requests.deny') }}
                  </a>
                </div>
                <div
                  class="d-flex justify-content-start ml-sm-3 align-self-center"
                  v-if="request.decision">
                  <div
                    class="allow text-success"
                    v-if="request.allowed">
                    <FrIcon
                      icon-class="font-weight-bolder md-16 mb-1 mr-2"
                      name="check">
                      {{ $t('pages.uma.requests.allowed') }}
                    </FrIcon>
                  </div>
                  <div
                    class="deny text-danger"
                    v-if="!request.allowed">
                    <FrIcon
                      icon-class="font-weight-bolder md-16 mb-1 mr-2"
                      name="block">
                      {{ $t('pages.uma.requests.denied') }}
                    </FrIcon>
                  </div>
                </div>
              </div>
            </BListGroupItem>
          </BListGroup>
        </BCard>
      </div>
    </template>
  </div>
</template>

<script>
import { BCard, BListGroup, BListGroupItem } from 'bootstrap-vue';
import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import DateMixin from '@forgerock/platform-shared/src/mixins/DateMixin/';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrFallbackImage from '@/components/utils/FallbackImage';

dayjs.extend(LocalizedFormat);

/**
 * @description Allows user to request access to a resource
 * */
export default {
  name: 'Requests',
  components: {
    BCard,
    BListGroup,
    BListGroupItem,
    FrFallbackImage,
    FrIcon,
  },
  mixins: [
    DateMixin,
  ],
  props: {
    requests: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    formatTime(value) {
      const eventDate = dayjs(value);
      if (eventDate.isSame(dayjs(), 'day')) {
        return this.timeAgo(eventDate);
      }
      return eventDate.format('LT');
    },
    finalizeAccess(request, index, action) {
      this.$emit('finalize-resource-access', request._id, action, index, { scopes: request.permissions });
    },
  },
};
</script>
