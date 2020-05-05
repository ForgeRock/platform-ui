<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BTab :title="$t('pages.access.settings')">
    <table class="table">
      <tbody>
        <tr
          v-for="(property) in properties"
          :key="property.propName"
          class="border-bottom">
          <td class="border-top-0 font-weight-bold">
            {{ property.title }}
          </td>
          <td class="border-top-0 text-muted">
            {{ property.description }}
          </td>
          <td class="border-top-0 text-right">
            <BButton
              type="button"
              variant="outline-primary"
              @click="showModal(property)">
              {{ $t('pages.access.setUp') }}
            </BButton>
          </td>
        </tr>
      </tbody>
    </table>
    <BModal
      id="settingsModal"
      ref="settingsModal"
      :title="editProperty.description"
      size="lg">
      <div>
        <div v-if="editProperty.isConditional">
          <!-- TODO: INJECT QUERY FILTER EDITOR COMPONENT HERE -->
          <div class="mt-2">
            {{ editProperty.title }}
          </div>
          <BFormInput v-model="editProperty.value" />
          <div class="mt-2">
            queryFilter dropdown options =>
          </div>
          <pre class="bg-light p-3">{{ JSON.stringify(conditionOptions, null, 4) }}</pre>
        </div>
        <div v-else>
          <!-- TODO: INJECT TEMPORAL CONSTRAINTS COMPONENT HERE -->
          <div class="mt-2">
            {{ editProperty.title }}
          </div>
          <BFormInput v-model="editProperty.value" />
        </div>
      </div>

      <template v-slot:modal-footer>
        <div class="w-100">
          <div class="float-right">
            <BButton
              variant="link"
              @click="hideModal">
              {{ $t('common.cancel') }}
            </BButton>
            <BButton
              variant="primary"
              @click="saveSetting">
              {{ $t('common.save') }}
            </BButton>
          </div>
        </div>
      </template>
    </BModal>
  </BTab>
</template>

<script>
import {
  capitalize,
} from 'lodash';
import {
  BButton,
  BFormInput,
  BModal,
  BTab,
} from 'bootstrap-vue';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';

export default {
  name: 'SettingsTab',
  mixins: [
    NotificationMixin,
    RestMixin,
  ],
  components: {
    BButton,
    BFormInput,
    BModal,
    BTab,
  },
  props: {
    properties: {
      type: Object,
      default: () => {},
    },
    resourcePath: {
      type: String,
      default: '',
    },
    resourceName: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      editProperty: {},
      conditionOptions: [],
    };
  },
  methods: {
    showModal(property) {
      this.editProperty = property;
      if (property.isConditional) {
        this.setConditionOptions();
      }

      this.$refs.settingsModal.show();
    },
    hideModal() {
      this.$refs.settingsModal.hide();
    },
    saveSetting() {
      const idmInstance = this.getRequestService();
      const propValue = (this.editProperty.isTemporalConstraint) ? [{ duration: this.editProperty.value }] : this.editProperty.value;

      let patch = [{ operation: 'add', field: `/${this.editProperty.propName}`, value: propValue }];

      if (this.editProperty.value === '' || this.editProperty.value === null) {
        patch = { operation: 'remove', field: `/${this.editProperty.propName}` };
      }

      idmInstance.patch(this.resourcePath, patch).then(() => {
        this.displayNotification('IDMMessages', 'success', this.$t('pages.access.successEdited', { resource: capitalize(this.resourceName) }));
      },
      () => {
        this.displayNotification('IDMMessages', 'error', this.$t('pages.access.invalidEdit'));
      });
    },
    setConditionOptions() {
      this.conditionOptions = [];
      const idmInstance = this.getRequestService();

      // TODO: replace hard coded "managed/user" with "conditionObject" schema property value
      idmInstance.get('schema/managed/user').then((schema) => {
        const filteredProperties = [];

        schema.data.order.forEach((key) => {
          const property = schema.data.properties[key];
          if (key !== '_id' && property.type !== 'array' && property.type !== 'relationship' && property.viewable) {
            property.propName = key;
            filteredProperties.push(property);
          }
        });

        filteredProperties.forEach((property) => {
          if (property.type === 'object') {
            property.order.forEach((subProp) => {
              this.conditionOptions.push({
                label: `${property.title}/${subProp}`,
                value: `${property.propName}/${subProp}`,
                type: property.properties[subProp].type,
              });
            });
          } else {
            this.conditionOptions.push({
              label: property.title,
              value: property.propName,
              type: property.type,
            });
          }
        });
      },
      () => {
        this.displayNotification('IDMMessages', 'error', this.$t('pages.access.invalidEdit'));
      });
    },
  },
  mounted() {},
};
</script>
