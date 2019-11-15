<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
/* eslint-disable no-underscore-dangle */
<template>
  <div>
    <FrListGroup
      :title="$t('pages.profile.accountControls.title')"
      :subtitle="$t('pages.profile.accountControls.subtitle')">
      <FrListItem
        :collapsible="false"
        :panel-shown="false"
        :hover-item="true"
        @row-click="downloadAccount">
        <div
          slot="list-item-header"
          class="d-inline-flex w-100">
          <div class="flex-grow-1">
            <div>
              {{ $t('pages.profile.accountControls.downloadTitle') }}
            </div>
            <small class="text-muted subtext">
              {{ $t('pages.profile.accountControls.downloadSubtitle') }}
            </small>
          </div>
          <a
            class="align-self-center flex-grow-2 text-right"
            @click.prevent
            href="#">
            {{ $t('pages.profile.accountControls.downloadLink') }}
          </a>
        </div>
      </FrListItem>
      <FrListItem
        :collapsible="false"
        :panel-shown="false"
        :hover-item="true"
        v-b-modal.deleteAccountModal>
        <div
          slot="list-item-header"
          class="d-inline-flex w-100">
          <div class="flex-grow-1">
            <div>
              {{ $t('pages.profile.accountControls.deleteTitle') }}
            </div>
            <small class="text-muted subtext">
              {{ $t('pages.profile.accountControls.deleteSubtitle') }}
            </small>
          </div>
          <a
            class="align-self-center flex-grow-2 text-right"
            @click.prevent
            href="#">
            {{ $t('pages.profile.accountControls.deleteAccount') }}
          </a>
        </div>
      </FrListItem>
    </FrListGroup>
    <BModal
      id="deleteAccountModal"
      modal-class="fr-full-screen"
      ref="deleteModal"
      cancel-variant="outline-secondary">
      <div
        slot="modal-header"
        class="d-flex w-100 h-100">
        <h5 class="modal-title align-self-center text-center">
          {{ $t('pages.profile.accountControls.deleteModalTitle') }}
        </h5>
        <button
          type="button"
          aria-label="Close"
          class="close"
          @click="hideModal">
          <i class="material-icons-outlined font-weight-bolder md-24">
            close
          </i>
        </button>
      </div>

      <BContainer>
        <h1 class="mb-4">
          {{ $t('pages.profile.accountControls.deleteModalHeader') }}
        </h1>
        <p>
          {{ $t('pages.profile.accountControls.deleteModalDetails') }}
        </p>
        <hr>
        <p>
          {{ $t('pages.profile.accountControls.deleteModalDownload1') }} <a
            @click.prevent="downloadAccount"
            href="#">
            {{ $t('pages.profile.accountControls.deleteModalDownload2') }}
          </a> {{ $t('pages.profile.accountControls.deleteModalDownload3') }}
        </p>
        <hr>
        <h5>{{ $t('pages.profile.accountControls.deleteModalContentList') }}</h5>
        <ul>
          <li>{{ $t('pages.profile.accountControls.deleteModalContentListItem') }}</li>
        </ul>
        <div class="custom-control custom-checkbox">
          <input
            type="checkbox"
            v-model="confirmDelete"
            class="custom-control-input"
            id="confirmDeleteCheck">
          <label
            class="custom-control-label"
            for="confirmDeleteCheck">
            {{ $t('pages.profile.accountControls.deleteModalAcceptMessage') }}
          </label>
        </div>
      </BContainer>

      <div
        slot="modal-footer"
        class="w-100">
        <div class="float-right">
          <BBtn
            variant="outline-secondary mr-2"
            @click="hideModal">
            {{ $t('common.cancel') }}
          </BBtn>
          <BBtn
            :disabled="!confirmDelete"
            type="button"
            variant="danger"
            @click="deleteAccount">
            {{ $t('pages.profile.accountControls.deleteModalButton') }}
          </BBtn>
        </div>
      </div>
    </BModal>
  </div>
</template>

<script>
import {
  each,
  isNull,
} from 'lodash';
import ListGroup from '@forgerock/platform-components/src/components/listGroup/';
import ListItem from '@forgerock/platform-components/src/components/listItem/';
import RestMixin from '@forgerock/platform-components/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-components/src/mixins/NotificationMixin';
import LoginMixin from '@forgerock/platform-components/src/mixins/LoginMixin';

/**
 * @description Handles displaying basic account controls (delete and download).
 *
 * @fires DELETE resource/name/id (e.g. managed/user/fakeid) - Deletes specific resource record
 * @fires GET resource/name/id?_fields=*,idps/*,_meta/createDate,_meta/lastChanged,_meta/termsAccepted,_meta/loginCount (e.g. managed/user/fakeid) - Gets JSON data on a resource including certain meta data,
 * this is used to generate a downloadable file.
 *
 */
export default {
  name: 'AccountControls',
  mixins: [
    RestMixin,
    NotificationMixin,
    LoginMixin,
  ],
  components: {
    FrListGroup: ListGroup,
    FrListItem: ListItem,
  },
  data() {
    return {
      confirmDelete: false,
    };
  },
  computed: {
    userId() {
      return this.$store.state.UserStore.userId;
    },
    managedResource() {
      return this.$store.state.UserStore.managedResource;
    },
  },
  mounted() {},
  methods: {
    deleteAccount() {
      const selfServiceInstance = this.getRequestService();

      selfServiceInstance.delete(`/${this.managedResource}/${this.userId}`).then(() => {
        this.$refs.deleteModal.hide();
        this.displayNotification('IDMMessages', 'success', this.$t('pages.profile.accountControls.deleteAccountSuccessful'));
        this.logoutUser();
      });
    },
    downloadAccount() {
      const selfServiceInstance = this.getRequestService();

      // eslint-disable-next-line consistent-return
      selfServiceInstance.get(`/${this.managedResource}/${this.userId}?_fields=*,idps/*,_meta/createDate,_meta/lastChanged,_meta/termsAccepted,_meta/loginCount`, []).then((result) => {
        const downloadName = '';

        /* eslint no-underscore-dangle: ["error", { "allow": ["_meta", "_rev"] }] */
        /* eslint no-param-reassign: ["error", { "ignorePropertyModificationsFor": ["result", "idp"] }] */
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
    hideModal() {
      this.$refs.deleteModal.hide();
    },
  },
};
</script>

<style lang="scss" scoped></style>
