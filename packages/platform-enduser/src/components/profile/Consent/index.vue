<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrListGroup
    v-show="mappings.length"
    :title="$t('pages.profile.consent.title')"
    :subtitle="$t('pages.profile.consent.subtitle')">
    <FrListItem
      v-for="mapping in mappings"
      :key="mapping.name"
      :collapsible="mapping.consented"
      :panel-shown="false">
      <template #list-item-header>
        <div class="d-flex justify-content-between align-items-center w-100">
          <BMedia vertical-align="center">
            <template #aside>
              <FrFallbackImage
                :src="mapping.icon"
                class="mr-3"
                width="24"
                height="24"
                :alt="mapping.displayName"
                fallback="settings_applications" />
            </template>
            <div>
              <h3 class="h5 m-0">
                {{ mapping.displayName }}
              </h3>
            </div>
            <small class="text-muted">
              {{ mapping.subTitle }}
            </small>
          </BMedia>
          <div class="d-flex align-self-right">
            <BButton
              variant="link"
              @click.stop.prevent="showModal(mapping.name)">
              {{ $t(`pages.profile.consent.${mapping.consented ? 'deny' : 'allow'}`) }}
            </BButton>
            <div
              class="caret ml-2 my-auto list-group-item-action"
              v-if="mapping.consented">
              <FrIcon
                icon-class="font-weight-bolder md-24 mb-1 pr-0 caret-down align-self-center"
                name="keyboard_arrow_down" />
              <FrIcon
                icon-class="font-weight-bolder md-24 mb-1 pr-0 caret-up align-self-center"
                name="keyboard_arrow_up" />
            </div>
          </div>
        </div>
        <BModal
          :id="mapping.name"
          :ref="mapping.name"
          size="md"
          cancel-variant="outline-secondary">
          <template #modal-header>
            <div class="d-flex w-100 h-100">
              <h2 class="modal-title align-self-center text-center h5">
                {{ mapping.modalHeader }}
              </h2>
              <button
                type="button"
                :aria-label="$t('common.close')"
                class="close"
                @click.stop.prevent="hideModal(mapping.name)">
                <FrIcon
                  icon-class="font-weight-bolder md-24 mb-1"
                  name="close" />
              </button>
            </div>
          </template>
          <BContainer>
            <p
              v-if="mapping.consented"
              v-html="$t('pages.profile.consent.confirmDeny', {mappingName: mapping.displayName})" />
            <FrAccessLevel
              v-else
              :fields="mapping.fields" />
          </BContainer>

          <template #modal-footer>
            <div class="float-right">
              <BButton
                variant="outline-secondary mr-2"
                @click.stop.prevent="hideModal(mapping.name)">
                {{ $t('common.cancel') }}
              </BButton>
              <BButton
                :variant="mapping.consented ? 'danger' : 'primary'"
                @click.stop.prevent="toggleConsentAndHideModal(mapping)">
                {{ $t(`pages.profile.consent.${mapping.consented ? 'deny' : 'allow'}`) }}
              </BButton>
            </div>
          </template>
        </BModal>
      </template>

      <template #list-item-collapse-body>
        <FrAccessLevel :fields="mapping.fields" />
      </template>
    </FrListItem>
  </FrListGroup>
</template>

<script>
import {
  BButton,
  BContainer,
  BMedia,
  BModal,
} from 'bootstrap-vue';
import {
  cloneDeep,
  first,
  isUndefined,
} from 'lodash';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { mapState } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import ListGroup from '@forgerock/platform-shared/src/components/ListGroup/';
import ListItem from '@forgerock/platform-shared/src/components/ListItem/';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import AccessLevel from '@/components/profile/AccessLevel';
import FallbackImage from '@/components/utils/FallbackImage';

dayjs.extend(advancedFormat);

/**
 * @description Controls the display of a users currently consented mappings (where their data is sent).
 *
 * @fires POST consent?_action=getConsentMappings - Gets a list of available mappings for consent in conjunction with the consent portion of a users profile this is
 * used to display which mappings are consented to and can be consented out of.
 *
 */
export default {
  name: 'Consent',
  mixins: [
    RestMixin,
  ],
  components: {
    BButton,
    BContainer,
    BMedia,
    BModal,
    FrListGroup: ListGroup,
    FrListItem: ListItem,
    FrAccessLevel: AccessLevel,
    FrFallbackImage: FallbackImage,
    FrIcon,
  },
  props: {
    consentedMappings: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      consentableMappings: [],
    };
  },
  computed: {
    ...mapState(useUserStore, ['managedResource']),
    mappings() {
      return this.consentableMappings.map((mapping) => {
        const consentedMapping = this.consentedMappings.find((singleMapping) => singleMapping.mapping === mapping.name);
        const mappingCopy = cloneDeep(mapping);

        let modalHeaderPath = 'pages.profile.consent.';

        mappingCopy.showDetails = false;

        if (!isUndefined(consentedMapping)) {
          mappingCopy.consented = true;
          mappingCopy.consentDate = consentedMapping.consentDate;
          modalHeaderPath += 'denyConsentHeader';
          mappingCopy.subTitle = `${this.$t('pages.profile.consent.authorized')} ${dayjs(mapping.consentDate).format('MMMM Do YYYY')}`;
        } else {
          mappingCopy.consented = false;
          modalHeaderPath += 'allowConsentHeader';
          mappingCopy.subTitle = this.$t('pages.profile.consent.notAuthorized');
        }

        mappingCopy.modalHeader = this.$t(modalHeaderPath);
        return mappingCopy;
      });
    },
  },
  created() {
    this.loadConsent();
  },
  methods: {
    showModal(name) {
      first(this.$refs[name]).show();
    },
    loadConsent() {
      const urlParams = { queryFilter: `/source eq "${this.managedResource}"` };
      this.getRequestService()
        .get(`consent${encodeQueryString(urlParams)}`)
        .then(({ data }) => {
          this.consentableMappings = data.result;
        });
    },
    toggleConsentAndHideModal(mapping) {
      this.toggleConsent(mapping);
      this.hideModal(mapping.name);
    },
    hideModal(name) {
      first(this.$refs[name]).hide();
    },
    generatePatch(mapping) {
      const { consentDate, name } = mapping;
      const value = {
        consentDate,
        mapping: name,
      };

      let field = '/consentedMappings';
      let operation;

      if (!mapping.consented) {
        value.consentDate = new Date().toISOString();
        field += '/-';
        operation = 'add';
      } else {
        operation = 'remove';
      }

      return [{ field, operation, value }];
    },
    toggleConsent(mapping) {
      this.$emit('updateProfile', this.generatePatch(mapping), { onSuccess: this.loadConsent() });
    },
  },
};
</script>
<style lang="scss" scoped>
:deep {
  .card-body, .list-group-item {
    border-bottom: none !important;
    box-shadow: none !important;
  }
}
</style>
