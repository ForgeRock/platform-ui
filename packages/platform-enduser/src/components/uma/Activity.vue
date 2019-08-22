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
              height="30"
              width="30"
              fallback="fa-file-alt" />
          </template>
        </FrListItem>
      </FrListGroup>
    </template>
  </div>
</template>

<script>
import _ from 'lodash';
import moment from 'moment';
import FallbackImage from '@/components/utils/FallbackImage';
import ListGroup from '@/components/utils/ListGroup';
import ListItem from '@/components/utils/ListItem';

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
			const tempUmaHistory = _.clone(this.umaHistory);
			const sortedHistory = tempUmaHistory.sort((a, b) => a.eventTime - b.eventTime).reverse();
			const groups = _.groupBy(sortedHistory, event => moment(event.eventTime).format('YYYY-MM-DD'));
			const activityGroups = _.keys(groups).map(day => ({ day, activities: groups[day] }));

			return _.sortBy(activityGroups, ({ day }) => moment(day)).reverse();
		},
	},
	methods: {
		formatDateTitle(dateString) {
			return moment(dateString).format('dddd, MMMM DD, YYYY');
		},
		formatTime(dateString) {
			const eventDate = moment(dateString);

			if (eventDate.isSame(moment(), 'day')) {
				return eventDate.fromNow();
			}
			return eventDate.format('LT');
		},
	},
};
</script>
