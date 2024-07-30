<!-- Copyright (c) 2022-2024 ForgeRock. All rights reserved.

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
                  <img
                    width="50"
                    height="50"
                    :src="getLogo(app.icon)"
                    :alt="app.name"
                    :onerror="onImageError">
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
import { mapState } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { BContainer } from 'bootstrap-vue';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import { onImageError, resolveImage } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { getDefinedDashboards } from '@forgerock/platform-shared/src/api/DashboardApi';
import { getManagedResource } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { getUserSamlApplications } from '@/api/ProfileApi';

export default {
  name: 'WorkforceApplications',
  components: {
    BContainer,
    FrHeader,
    FrSearchInput,
  },
  data() {
    return {
      applications: {},
      searchString: '',
      userData: {},
      userSamlApplications: [],
    };
  },
  mixins: [
    NotificationMixin,
  ],
  computed: {
    ...mapState(useUserStore, ['userId']),
    filteredApplications() {
      if (!this.userData.effectiveApplications) {
        return [];
      }
      const BookmarkApps = this.userData.effectiveApplications.filter((application) => {
        const lowerCaseAppName = application.name.toLowerCase();
        return Object.values(this.applications).find((app) => app.dashboardDisplayName[0].toLowerCase() === lowerCaseAppName) && lowerCaseAppName.includes(this.searchString.toLowerCase());
      });

      const filteredApps = BookmarkApps.map((application) => {
        const app = Object.values(this.applications).find((a) => a.dashboardDisplayName[0].toLowerCase() === application.name.toLowerCase());
        return {
          name: app.dashboardDisplayName[0],
          icon: app.dashboardIcon[0],
          url: app.dashboardLogin[0],
        };
      });

      this.userSamlApplications.forEach((samlApp) => {
        filteredApps.push({
          name: samlApp.name,
          icon: samlApp.icon || 'saml.svg',
          url: samlApp.ssoEntities.idpLoginUrl,
        });
      });

      return filteredApps;
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
      const userManagedObject = this.$store.state.isFraas ? `${this.$store.state.realm}_user` : 'user';
      Promise.all([
        getManagedResource(userManagedObject, this.userId),
        getUserSamlApplications(userManagedObject, this.userId),
      ]).then(([userResult, userSamlApplicationsResult]) => {
        this.userData = userResult.data;
        this.userSamlApplications = userSamlApplicationsResult.data.result;
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
    onImageError,
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
