<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BContainer fluid>
    <BRow v-if="widgets.length">
      <div
        v-for="(widget, index) in widgets"
        :class="{'col-sm-4': widget.size === 'small', 'col-sm-6': widget.size === 'medium', 'col-sm-12': widget.size === 'large', 'mt-4': true}"
        :key="widget.type + index">
        <Component
          :is="widget.type"
          :user-details="userDetails"
          :details="widget.details" />
      </div>
    </BRow>
    <BJumbotron
      v-else
      class="mt-4 text-center">
      <div class="d-flex justify-content-center mt-3">
        <i class="material-icons-outlined mr-4 md-64">
          donut_large
        </i>
        <div class="flex-fow-1">
          <h2>{{ $t('pages.dashboard.noWidget') }}</h2>
          <p v-html="$t('pages.dashboard.noWidgetSubText')" />
        </div>
      </div>
    </BJumbotron>
  </BContainer>
</template>

<script>
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import Welcome from '@/components/dashboard/widgets/WelcomeWidget';

/**
 * @description Controlling component for the dashboard, loads widgets set and configured in the ui-dashboard config file.
 *
 * @fires GET config/ui/dashboard - Read of the config file ui-dashboard.json
 */
export default {
  name: 'Dashboard',
  mixins: [
    RestMixin,
    NotificationMixin,
  ],
  components: {
    Welcome,
  },
  data() {
    return {
      widgets: [],
      userDetails: this.$store.getters['UserStore/getUserState'],
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      this.getRequestService().get('config/ui/dashboard')
        .then(({ data }) => {
          this.widgets = data.dashboard.widgets;
        })
        .catch((error) => {
          this.displayNotification('IDMMessages', 'error', error.response.data.message);
        });
    },
  },
};
</script>
