<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="fr-applications">
    <BContainer class="my-5">
      <FrHeader
        class="mb-4"
        :title="$t('pages.applications.title')" />
      <div class="mb-4">
        <BRow>
          <BCol lg="6">
            <FrSearchInput
              v-model="searchString"
              :placeholder="$t('pages.applications.search')"
            />
          </BCol>
        </BRow>
      </div>
      <BRow>
        <BCol
          v-for="app in filteredApplications"
          :key="app.name"
          class="mb-4"
          lg="3"
          cols="6">
          <a
            :href="app.url"
            class="card h-100 cursor-pointer"
            target="_blank">
            <BCardBody class="d-flex justify-content-center align-items-center">
              <div class="d-flex flex-column align-items-center justify-content-center">
                <div class="d-flex align-items-center justify-content-center mb-3 app-image">
                  <BImg
                    width="50"
                    height="50"
                    :src="getLogo(app.icon)"
                    :alt="app.name" />
                </div>
                <h5 class="card-title mb-0">
                  {{ app.name }}
                </h5>
              </div>
            </BCardBody>
          </a>
        </BCol>
      </BRow>
    </BContainer>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { BContainer, BImg } from 'bootstrap-vue';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import resolveImage from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { getDefinedDashboards } from '@forgerock/platform-shared/src/api/DashboardApi';

export default {
  name: 'WorkforceApplications',
  components: {
    BContainer,
    BImg,
    FrHeader,
    FrSearchInput,
  },
  data() {
    return {
      applications: {},
      searchString: '',
      userData: {},
    };
  },
  mixins: [
    NotificationMixin,
    RestMixin,
  ],
  computed: {
    ...mapState({
      userId: (state) => state.UserStore.userId,
    }),
    filteredApplications() {
      if (!this.userData.effectiveApplications) {
        return [];
      }
      const visibleApplications = this.userData.effectiveApplications.filter((application) => {
        const lowerCaseAppName = application.name.toLowerCase();
        return Object.values(this.applications).find((app) => app.dashboardDisplayName[0].toLowerCase() === lowerCaseAppName) && lowerCaseAppName.includes(this.searchString.toLowerCase());
      });

      return visibleApplications.map((application) => {
        const app = Object.values(this.applications).find((a) => a.dashboardDisplayName[0].toLowerCase() === application.name.toLowerCase());
        return {
          name: app.dashboardDisplayName[0],
          icon: app.dashboardIcon[0],
          url: app.dashboardLogin[0],
        };
      });
    },
  },
  mounted() {
    getDefinedDashboards(this.$store.state.realm).then(({ data }) => {
      this.applications = data;
    });
    this.getUserProfile();
  },
  methods: {
    getUserProfile() {
      const isRootRealm = this.$store.state.realm === 'root' || this.$store.state.realm === '/';
      const userManagedObject = isRootRealm ? 'user' : `${this.$store.state.realm}_user`;
      this.getRequestService().get(`managed/${userManagedObject}/${this.userId}`).then(({ data }) => {
        this.userData = data;
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('pages.profile.failedGettingProfile'));
      });
    },
    getLogo(logoUrl) {
      if (logoUrl && (logoUrl.split('.').length !== 2 || !logoUrl.includes('.svg'))) {
        return logoUrl;
      }
      return resolveImage(logoUrl);
    },
  },
};
</script>

<style lang="scss" scoped>
.card:hover {
  text-decoration: none;
  border-color: $blue !important;
}

.app-image {
  height: 50px;
  width: 50px;
}
</style>
