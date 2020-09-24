<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
  <div v-if="socialProviders.length">
    <FrAccordion
      accordion-group="social"
      :items="socialProviders">
      <template #accordionHeader>
        <div class="p-4">
          <h4>
            {{ $t('pages.profile.social.title') }}
          </h4>
          <p class="m-0">
            {{ $t('pages.profile.social.subtitle') }}
          </p>
        </div>
      </template>
      <template #header="slotData">
        <BRow>
          <BCol cols="10">
            <BRow>
              <BCol md="6">
                <BImg
                  :width="24"
                  class="mr-4"
                  v-if="slotData.uiConfig.buttonImage"
                  :src="slotData.uiConfig.buttonImage" />
                <h5 class="mb-0 d-inline">
                  {{ slotData.uiConfig.buttonDisplayName }}
                </h5>
              </BCol>
              <BCol md="6">
                <span>
                  <template v-if="slotData.connected">
                    <i class="material-icons mr-2 text-success">
                      check_circle
                    </i>
                    {{ $t("common.connected") }}
                  </template>
                  <template v-else>
                    <i class="material-icons mr-2 text-muted">
                      remove_circle
                    </i>
                    {{ $t('pages.profile.social.notConnected') }}
                  </template>
                </span>
              </BCol>
            </BRow>
          </BCol>
        </BRow>
      </template>
      <template #body="slotData">
        <template v-if="slotData.connected">
          <template v-if="slotData.scopes">
            <small class="d-block">
              {{ $t('pages.profile.social.sharedWith', { providerName: slotData.uiConfig.buttonDisplayName }) }}
            </small>
            <div class="mb-4">
              <div
                v-for="scope in slotData.scopes"
                :key="slotData.provider + scope"
                class="mt-2">
                <i class="material-icons-outlined mr-2 text-success">
                  check
                </i>
                <span class="text-dark">
                  {{ scope }}
                </span>
              </div>
            </div>
          </template>
          <BButton
            @click="showModal(slotData.provider)"
            variant="outline-danger"
            block>
            <i class="material-icons-outlined mr-2">
              block
            </i>
            {{ $t('pages.profile.social.disconnect') }}
          </BButton>
        </template>
        <BButton
          v-else
          :disabled="!connectSocialTree"
          @click="connectSocial()"
          variant="outline-primary"
          block>
          {{ $t('pages.profile.social.connect') }}
        </BButton>
      </template>
    </FrAccordion>
    <BModal
      dialog-class="fr-modal"
      id="confirmDisconnectModal"
      :title="$t('pages.profile.social.deleteModalTitle', { providerName: selectedProvider })">
      {{ $t('pages.profile.social.deleteModalBody', { providerName: selectedProvider }) }}
      <template #modal-footer>
        <BButton
          variant="link"
          class="text-danger"
          @click="closeModal()">
          {{ $t('common.cancel') }}
        </BButton>
        <BButton
          variant="danger"
          @click="removeSocial(selectedProvider)">
          {{ $t('pages.profile.social.disconnect') }}
        </BButton>
      </template>
    </BModal>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import {
  BButton,
  BCol,
  BImg,
  BModal,
  BRow,
} from 'bootstrap-vue';
import {
  clone,
  map,
} from 'lodash';
import store from '@forgerock/platform-shared/src/store';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import Accordion from '@forgerock/platform-shared/src/components/Accordion';

export default {
  name: 'Social',
  components: {
    BButton,
    BCol,
    BImg,
    BModal,
    BRow,
    FrAccordion: Accordion,
  },
  mixins: [
    NotificationMixin,
    RestMixin,
  ],
  data() {
    return {
      socialProviders: [],
      connectSocialTree: undefined,
      selectedProvider: '',
    };
  },
  computed: {
    ...mapState({
      aliasList: (state) => state.UserStore.aliasList,
      userId: (state) => state.UserStore.userId,
    }),
  },
  mounted() {
    this.getAllSocialAccounts();
    this.getSocialJourney();
  },
  methods: {
    /**
     * Get the name of the journey used to connect social accounts
     */
    getSocialJourney() {
      this.getRequestService({ context: 'AM' }).get('/selfservice/trees').then((res) => {
        this.connectSocialTree = res.data.mapping.connectSocial;
      }, (error) => {
        this.showErrorMessage(error, this.$t('pages.profile.social.journeyServiceError'));
      });
    },
    /**
     * Get list of social providers connected to the user object
     */
    getAllSocialAccounts() {
      // get all social providers
      this.getRequestService({ context: 'AM' }).get('/selfservice/socialIdentityProviders').then((res) => {
        this.socialProviders = clone(res.data.providers);
        this.setActiveSocial(this.aliasList);
      }, (error) => {
        this.showErrorMessage(error, this.$t('pages.profile.social.identityProviderError'));
      });
    },
    /**
     * For each configured social provider set a flag to mark the provider as active for the user
     */
    setActiveSocial(providers) {
      map(providers, (activeProvider) => {
        const providerName = activeProvider.split('-')[0];
        this.socialProviders.forEach((provider) => {
          if (providerName === provider.provider) {
            this.$set(provider, 'connected', true);
          }
        });
      });
    },
    closeModal() {
      this.$bvModal.hide('confirmDisconnectModal');
      this.selectedProvider = '';
    },
    showModal(provider) {
      this.selectedProvider = provider;
      this.$bvModal.show('confirmDisconnectModal');
    },
    /**
     * Remove a linked social provider from user object
     */
    removeSocial(provider) {
      const newProviderList = [];
      map(this.aliasList, (activeProvider) => {
        const providerName = activeProvider.split('-')[0];
        if (provider !== providerName) {
          newProviderList.push(activeProvider);
        }
      });

      // patch user object
      const patch = [{ operation: 'add', field: '/aliasList', value: newProviderList }];
      this.getRequestService().patch(`managed/user/${this.userId}`, patch).then(() => {
        // update store
        store.commit('UserStore/setAliasListAction', newProviderList);

        const removed = this.socialProviders.find((element) => (element.provider === provider));
        this.$set(removed, 'connected', false);
        this.closeModal();
        this.collapseAccordion(this.socialProviders);
        this.displayNotification('', 'success', this.$t('pages.profile.social.disconnectSuccess', { providerName: provider }));
      }, () => {
        this.showErrorMessage('', this.$t('pages.profile.social.disconnectError', { providerName: provider }));
      });
    },
    connectSocial() {
      window.location.href = `${store.state.amBaseURL}/UI/Login?realm=${(new URLSearchParams(window.location.search)).get('realm') || '/'}&authIndexType=service&authIndexValue=${this.connectSocialTree}&goto=${encodeURIComponent(window.location.href)}`;
    },
    collapseAccordion(items) {
      items.forEach((item) => {
        item.open$ = false;
      });
    },
  },
};
</script>
