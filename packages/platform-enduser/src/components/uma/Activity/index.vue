<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <template v-for="(activityGroup, index) in activityGroups">
      <FrListGroup :key="`activityGroup-${index}`">
        <div
          class="card-body m-0 py-4"
          slot="list-group-header">
          <h6 class="card-title mb-0">
            {{ formatDateTitle(activityGroup.day) }}
          </h6>
        </div>
        <FrListItem
          v-for="activity in activityGroup.activities"
          :key="activity._id"
          :collapsible="false"
          :panel-shown="false"
          :hover-item="false">
          <template
            slot="list-item-header"
            class="d-inline-flex w-100">
            <div class="flex-grow-1 media-body">
              <span class="activity-type">
                {{ $t(`pages.uma.activity.${activity.type}`, {requestingParty: activity.requestingPartyName}) }}
              </span>
              <button
                class="m-0 p-0 btn btn-link text-capitalize"
                type="button"
                @click="$emit('resourceSetClick', activity._id)">
                {{ activity.resourceSetName }}
              </button>
              <small class="d-block text-muted subtext">
                {{ formatTime(activity.eventTime) }}
              </small>
            </div>
            <FrFallbackImage
              :src="activity.icon_uri"
              fallback="description" />
          </template>
        </FrListItem>
      </FrListGroup>
    </template>
  </div>
</template>

<script>
import {
  clone,
  groupBy,
  keys,
  sortBy,
} from 'lodash';
import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import DateMixin from '@forgerock/platform-components/src/mixins/DateMixin/';
import ListGroup from '@forgerock/platform-components/src/components/ListGroup/';
import ListItem from '@forgerock/platform-components/src/components/ListItem/';
import FallbackImage from '@/components/utils/FallbackImage';

dayjs.extend(LocalizedFormat);

/**
* @description Main component for UMA (AM/IDM) displays a list of resource activities
*
* */
export default {
  name: 'UmaActivity',
  components: {
    FrListGroup: ListGroup,
    FrListItem: ListItem,
    FrFallbackImage: FallbackImage,
  },
  mixins: [
    DateMixin,
  ],
  props: {
    umaHistory: {
      required: true,
      type: Array,
    },
  },
  data() {
    return {};
  },
  computed: {
    activityGroups() {
      const tempUmaHistory = clone(this.umaHistory);
      const sortedHistory = tempUmaHistory.sort((a, b) => a.eventTime - b.eventTime).reverse();
      const groups = groupBy(sortedHistory, (event) => dayjs(event.eventTime).format('YYYY-MM-DD'));
      const activityGroups = keys(groups).map((day) => ({ day, activities: groups[day] }));

      return sortBy(activityGroups, ({ day }) => dayjs(day)).reverse();
    },
  },
  methods: {
    formatDateTitle(dateString) {
      return dayjs(dateString).format('dddd, MMMM DD, YYYY');
    },
    formatTime(dateString) {
      const eventDate = dayjs(dateString);

      if (eventDate.isSame(dayjs(), 'day')) {
        return this.timeAgo(eventDate);
      }
      return eventDate.format('LT');
    },
  },
};
</script>
