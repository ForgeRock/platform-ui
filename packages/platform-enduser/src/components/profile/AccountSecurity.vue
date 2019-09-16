<template>
  <FrListGroup
    :title="$t('pages.profile.accountSecurity.title')"
    :subtitle="$t('pages.profile.accountSecurity.subtitle')">
    <FrEditKba
      v-if="isOnKBA && internalUser === false"
      :kba-data="kbaData"
      @updateKBA="sendUpdateKBA" />
  </FrListGroup>
</template>

<script>
import { mapState } from 'vuex';
import EditKBA from '@/components/profile/EditKBA';
import ListGroup from '@forgerock/platform-components/src/components/listGroup/';
/**
 * @description Handles displaying account security controls (KBA change and password change)
 *
 */
export default {
	name: 'AccountSecurity',
	data() {
		return {
			isOnKBA: false,
			kbaData: {},
		};
	},
	computed: {
		...mapState({
			internalUser: state => state.UserStore.internalUser,
		}),
	},
	components: {
		FrListGroup: ListGroup,
		FrEditKba: EditKBA,
	},
	methods: {
		sendUpdateKBA(payload, config) {
			this.$emit('updateKBA', payload, config);
		},
		sendUpdateProfile(payload, config) {
			this.$emit('updateProfile', payload, config);
		},
	},
	mounted() {
		/* istanbul ignore next */
		const selfServiceInstance = this.getRequestService({
			headers: this.getAnonymousHeaders(),
		});

		// TODO - replace this with call to 'Liveness Service'
		/* istanbul ignore next */
		selfServiceInstance.get('selfservice/kba').then((response) => {
			this.isOnKBA = true;
			this.kbaData = response.data;
		})
		/* istanbul ignore next */
			.catch(() => {
				this.isOnKBA = false;
			});
	},
};
</script>
