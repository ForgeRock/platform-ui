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
import ListGroup from '@forgerock/platform-components/src/components/listGroup/';
import EditKBA from '@/components/profile/EditKBA';
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
		const selfServiceInstance = this.getRequestService({
			headers: this.getAnonymousHeaders(),
		});

		// TODO - replace this with call to 'Liveness Service'
		selfServiceInstance.get('selfservice/kba').then((response) => {
			this.isOnKBA = true;
			this.kbaData = response.data;
		})
			.catch(() => {
				this.isOnKBA = false;
			});
	},
};
</script>
