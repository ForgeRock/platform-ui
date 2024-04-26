<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrAccordion
      id="account-controls"
      accordion-group="accountControls"
      :items="items">
      <template #accordionHeader>
        <div class="p-4">
          <h2 class="h4">
            {{ $t('pages.profile.accountControls.title') }}
          </h2>
          <p class="m-0">
            {{ $t('pages.profile.accountControls.subtitle') }}
          </p>
        </div>
      </template>
      <template #header="slotData">
        <h3 class="h5 mb-0">
          {{ slotData.header }}
        </h3>
      </template>
      <template #body="slotData">
        <p>
          {{ slotData.description }}
        </p>
        <BButton
          block
          :variant="slotData.buttonVariant"
          @click="slotData.buttonMethod">
          <FrIcon
            icon-class="mr-2"
            :name="slotData.buttonIcon ? slotData.buttonIcon : 'check_box_outline_blank'">
            {{ slotData.buttonText }}
          </FrIcon>
        </BButton>
      </template>
    </FrAccordion>
    <BModal
      dialog-class="fr-modal"
      id="deleteModal"
      title-class="h5"
      title-tag="h2"
      :title="$t('pages.profile.accountControls.deleteModalTitle')">
      {{ $t('pages.profile.accountControls.deleteModalBody') }}
      <strong>
        {{ $t('pages.profile.accountControls.deleteModalWarning') }}
      </strong>
      <template #modal-footer="{ cancel }">
        <BButton
          variant="link"
          class="text-danger"
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BButton>
        <BButton
          type="button"
          variant="danger"
          @click="deleteAccount()">
          {{ $t('pages.profile.accountControls.deleteModalButton') }}
        </BButton>
      </template>
    </BModal>
  </div>
</template>

<script>
import { BButton, BModal } from 'bootstrap-vue';
import {
  each,
  isNull,
} from 'lodash';
import { mapState } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import Accordion from '@forgerock/platform-shared/src/components/Accordion';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import LoginMixin from '@forgerock/platform-shared/src/mixins/LoginMixin';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

export default {
  name: 'AccountControls',
  mixins: [
    RestMixin,
    NotificationMixin,
    LoginMixin,
  ],
  components: {
    BButton,
    BModal,
    FrAccordion: Accordion,
    FrIcon,
  },
  data() {
    return {
      items: [
        {
          name: 'download',
          header: this.$t('pages.profile.accountControls.downloadTitle'),
          description: this.$t('pages.profile.accountControls.downloadSubtitle'),
          buttonText: this.$t('common.download'),
          buttonIcon: 'download',
          buttonVariant: 'primary',
          buttonMethod: this.downloadAccount,
        },
        {
          name: 'delete',
          header: this.$t('pages.profile.accountControls.deleteTitle'),
          description: this.$t('pages.profile.accountControls.deleteSubtitle'),
          buttonText: this.$t('pages.profile.accountControls.deleteTitle'),
          buttonIcon: 'delete',
          buttonVariant: 'danger',
          buttonMethod: this.showDeleteModal,
        },
      ],
    };
  },
  computed: {
    ...mapState(useUserStore, ['userId', 'managedResource']),
  },
  methods: {
    downloadAccount() {
      const selfServiceInstance = this.getRequestService();

      // eslint-disable-next-line consistent-return
      selfServiceInstance.get(`/${this.managedResource}/${this.userId}?_fields=*,idps/*,_meta/createDate,_meta/lastChanged,_meta/termsAccepted,_meta/loginCount`, []).then((result) => {
        const downloadName = '';

        if (result.data._meta) {
          each(result._meta, (value, key) => {
            if (key.match('_')) {
              delete result._meta[key];
            }
          });
        }

        if (result.data.idps) {
          each(result.idps, (idp) => {
            each(idp, (value, key) => {
              if (key.match('_') && isNull(key.match('_meta'))) {
                delete idp[key];
              }
            });
          });
        }

        delete result.data._rev;
        delete result.data.kbaInfo;

        const data = JSON.stringify(result.data, null, 4);

        if (navigator.msSaveBlob) {
          return navigator.msSaveBlob(new Blob([data], { type: 'data:application/json' }), downloadName);
        }
        const blob = new Blob([data], { type: 'data:application/json' });
        const e = document.createEvent('MouseEvents');
        const a = document.createElement('a');

        a.download = 'userProfile.json';
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ['data:application/json', a.download, a.href].join(':');
        e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
      });
    },
    showDeleteModal() {
      this.$bvModal.show('deleteModal');
    },
    deleteAccount() {
      const selfServiceInstance = this.getRequestService();

      selfServiceInstance.delete(`/${this.managedResource}/${this.userId}`).then(() => {
        this.$bvModal.hide('deleteModal');
        this.displayNotification('success', this.$t('pages.profile.accountControls.deleteAccountSuccessful'));
        this.logoutUser();
      });
    },
  },
};
</script>
