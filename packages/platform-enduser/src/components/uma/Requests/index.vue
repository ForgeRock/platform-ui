<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
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
                    {{ request.when | formatTime }}
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
                    <i class="material-icons-outlined font-weight-bolder md-16 mb-1">
                      check
                    </i>
                    {{ $t('pages.uma.requests.allowed') }}
                  </div>
                  <div
                    class="deny text-danger"
                    v-if="!request.allowed">
                    <i class="material-icons-outlined font-weight-bolder md-16 mb-1">
                      block
                    </i>
                    {{ $t('pages.uma.requests.denied') }}
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
import moment from 'moment';
import FallbackImage from '@/components/utils/FallbackImage';

/**
 * @description Allows user to request access to a resource
 * */
export default {
  name: 'Requests',
  components: {
    FrFallbackImage: FallbackImage,
  },
  props: {
    requests: {
      type: Array,
      default: () => [],
    },
  },
  filters: {
    formatTime(dateString) {
      const eventDate = moment(dateString);

      if (eventDate.isSame(moment(), 'day')) {
        return eventDate.fromNow();
      }
      return eventDate.format('LT');
    },
  },
  methods: {
    finalizeAccess(request, index, action) {
      this.requests[index].decision = true;

      // eslint-disable-next-line no-underscore-dangle
      this.$emit('finalizeResourceAccess', request._id, action, {
        scopes: request.permissions,
        onSuccess: () => {
          if (action === 'approve') {
            this.requests[index].allowed = true;
          }
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
