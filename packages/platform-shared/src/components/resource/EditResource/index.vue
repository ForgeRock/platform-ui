<!-- Copyright (c) 2019-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer
    v-if="!isLoading"
    class="my-5">
    <div
      class="mb-4 media">
      <BImg
        v-if="resourceIsUser"
        class="mr-4"
        width="104"
        :src="require('@forgerock/platform-shared/src/assets/images/avatar.png')"
        fluid
        :alt="$t('common.avatar')" />
      <FrIcon
        v-else
        class="mr-4 md-48"
        :name="setIcon"
      />
      <div class="media-body align-self-center">
        <h5 class="text-muted">
          {{ getTranslation(resourceTitle) }}
        </h5>
        <h1>{{ displayName }}</h1>
        <span
          v-if="displaySecondaryTitleField === 'description'"
          class="text-muted">
          {{ secondaryTitle }}
        </span>
        <code v-else>
          {{ secondaryTitle }}
        </code>
      </div>
    </div>
    <BButton
      v-if="canChangePassword"
      class="mb-4"
      variant="outline-secondary"
      v-b-modal.resetModal>
      <FrIcon
        class="mr-md-2 text-nowrap"
        name="cached"
      />
      {{ $t('pages.access.resetPassword') }}
    </BButton>
    <BButton
      v-if="canClearSessions && hasActiveSessions"
      class="mb-4"
      variant="outline-secondary"
      @click="showClearSessionsModal = true">
      <FrIcon
        class="mr-md-2 text-nowrap"
        name="clear_all"
      />
      {{ $t('common.endSessions') }}
    </BButton>
    <slot
      :relationshipProperties="relationshipProperties"
      :displayProperties="displayProperties"
      :revision="revision"
      :refreshData="refreshData"
      :resourceDetails="resourceDetails">
      <BCard class="card-tabs-vertical mb-5">
        <BDropdown
          v-if="mobileDropdownTabs.length && !hideNav"
          :text="mobileDropdownTabs[currentTab]"
          variant="white"
          block
          menu-class="w-100"
          class="d-md-none border-bottom mobile-dropdown-menu">
          <BDropdownItem
            v-for="(item, index) in mobileDropdownTabs"
            :key="index"
            :active="index === currentTab"
            @click="currentTab = index">
            {{ item }}
          </BDropdownItem>
        </BDropdown>
        <BTabs
          ref="resourceTabs"
          v-model="currentTab"
          @changed="populateMobileDropdownTabs"
          :nav-wrapper-class="hideNav ? 'd-none': 'd-none d-md-block'"
          flex-column
          flex-sm-row
          vertical
          pills>
          <BTab
            :title="this.$t('pages.access.details')">
            <FrObjectTypeEditor
              v-if="displayProperties.length > 0"
              @refresh-data="refreshData"
              :revision="revision"
              :form-fields="formFields"
              :display-properties="displayProperties"
              :resource-path="`${resourceType}/${resourceName}/${id}`"
              :resource-title="getTranslation(resourceTitle)"
              :is-openidm-admin="isOpenidmAdmin"
              :disable-save-button="disableSaveButton"
              @disable-save-button="disableSaveButton = $event" />
            <span v-else>
              {{ $t('pages.access.noAvailableProperties') }}
            </span>
          </BTab>
          <!-- Add a tab for each viewable/editable object type property -->
          <template v-for="(objectTypeProperty) in objectTypeProperties">
            <BTab
              :title="getTranslation(objectTypeProperty.title)"
              :key="`${objectTypeProperty.propName}_tab`">
              <FrObjectTypeEditor
                @refresh-data="refreshData"
                :revision="revision"
                :form-fields="formFields[objectTypeProperty.propName] || {}"
                :sub-property-name="objectTypeProperty.propName"
                :display-properties="getObjectTypeProperyDisplayProperties(objectTypeProperty)"
                :disable-save-button="objectTypeProperty.readOnly"
                :resource-path="`${resourceType}/${resourceName}/${id}`"
                :resource-title="getTranslation(resourceTitle)"
                :is-openidm-admin="isOpenidmAdmin" />
            </BTab>
          </template>
          <FrPrivilegesTab
            v-if="internalRolePrivilegesField"
            :disabled="disableSaveButton"
            :privileges-field="internalRolePrivilegesField"
            :resource-path="`${resourceType}/${resourceName}/${id}`"
            :resource-name="resourceName"
            :revision="revision"
            @refresh-data="refreshData" />
          <!-- Add a tab for each viewable/editable relationship array property -->
          <template v-for="(relationshipProperty) in relationshipProperties">
            <BTab
              v-if="relationshipProperty.type === 'array'"
              :title="getTranslation(relationshipProperty.title)"
              :key="`${relationshipProperty.propName}_tab`">
              <FrRelationshipArray
                :parent-resource="`${resourceType}/${resourceName}`"
                :parent-id="id"
                :relationship-array-property="relationshipProperty"
                :revision="revision"
                @refresh-data="refreshData" />
            </BTab>
          </template>
          <FrSettingsTab
            v-if="Object.keys(settingsProperties).length > 0"
            :properties="settingsProperties"
            :resource-name="resourceName"
            :resource-path="`${resourceType}/${resourceName}/${id}`"
            :revision="revision"
            @refresh-data="refreshData" />
          <LinkedApplicationsTab
            v-if="isOpenidmAdmin"
            :linked-applications="linkedApplications" />
          <FrJsonTab
            v-if="isOpenidmAdmin && jsonString"
            :json-string="jsonString" />
        </BTabs>
      </BCard>
    </slot>
    <FrDeletePanel
      v-if="canDelete"
      class="mb-5"
      :is-deleting="isDeleting"
      :translated-item-type="getTranslation(resourceTitle)"
      @delete-item="deleteResource" />
    <FrResetPasswordModal
      v-if="canChangePassword"
      id="resetModal"
      :resource-type="resourceType"
      :resource-name="resourceName"
      :resource-id="id"
      @refresh-data="refreshData" />
    <FrClearResourceSessions
      :show="showClearSessionsModal"
      :resource-name="clearSessionsName"
      @clear-sessions="clearSessionsAndCloseModal"
      @close-modal="showClearSessionsModal = false" />
  </BContainer>
</template>

<script>
import {
  each,
  filter,
  find,
  indexOf,
  isUndefined,
  isArray,
  map,
  pick,
  pickBy,
  keys,
} from 'lodash';
import {
  BButton,
  BCard,
  BContainer,
  BDropdown,
  BDropdownItem,
  BImg,
  BTab,
  BTabs,
  VBModal,
} from 'bootstrap-vue';
import axios from 'axios';
import FrResetPasswordModal from '@forgerock/platform-shared/src/components/resource/EditResource/ResetPasswordModal';
import FrRelationshipArray from '@forgerock/platform-shared/src/components/resource/RelationshipArray';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import FrDeletePanel from '@forgerock/platform-shared/src/components/DeletePanel';
// eslint-disable-next-line import/no-extraneous-dependencies
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import { clearSessions, getSessionInfo } from '@forgerock/platform-shared/src/api/SessionsApi';
import ClearResourceSessions from '@forgerock/platform-shared/src/components/resource/ClearResourceSessions';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { getLinkedApplications } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import LinkedApplicationsTab from '@forgerock/platform-shared/src/components/resource/EditResource/CustomTabs/LinkedApplicationsTab';
import FrObjectTypeEditor from './ObjectTypeEditor';
import FrSettingsTab from './CustomTabs/SettingsTab';
import FrPrivilegesTab from './CustomTabs/PrivilegesTab';
import FrJsonTab from './CustomTabs/JsonTab';

/**
 * @description Full page that provides view/edit of a specific resource for delegated admin. Auto generates fields based on backend return.
 * Currently generates string, number, boolean and password (not based on type, but on field name being passsword).
 *
 * @fires GET schema/resourceType/resourceName/ (e.g. schema/managed/user) - Schema for a resource
 * @fires GET privilege/resourceType/resourceName/id (e.g. privilege/managed/user/_id) - Privileges for a specific record of a resource
 * @fires GET resourceType/resourceName/id (e.g. managed/user/_id) - Resource details, in this context privileges will restrict the data return
 * @fires DELETE resourceType/resourceName/id (e.g. managed/user/_id) - Deletes resource record
 * @fires PATCH resourceType/resourceName/id (e.g. managed/user/_id) - Submits a patch object of changes for the provided resource record
 */
export default {
  name: 'EditResource',
  components: {
    FrDeletePanel,
    FrObjectTypeEditor,
    FrResetPasswordModal,
    FrRelationshipArray,
    FrSettingsTab,
    FrPrivilegesTab,
    FrJsonTab,
    FrIcon,
    BButton,
    BImg,
    BContainer,
    BTabs,
    BTab,
    BCard,
    BDropdown,
    BDropdownItem,
    FrClearResourceSessions: ClearResourceSessions,
    LinkedApplicationsTab,
  },
  mixins: [
    ResourceMixin,
    RestMixin,
    NotificationMixin,
    TranslationMixin,
  ],
  directives: {
    'b-modal': VBModal,
  },
  props: {
    canClearSessions: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      resourceTitle: '',
      resourceName: this.$route.params.resourceName,
      resourceType: this.$route.params.resourceType,
      resourceIsUser: this.$route.params.resourceName && this.$route.params.resourceName.endsWith('user'),
      resourceDetails: null,
      resourceSchema: null,
      resourcePrivilege: null,
      id: this.$route.params.resourceId,
      displayProperties: [],
      canDelete: false,
      canChangePassword: false,
      disableSaveButton: false,
      icon: '',
      displayNameField: '',
      displaySecondaryTitleField: '',
      formFields: {},
      isOpenidmAdmin: this.$store.state.UserStore.adminUser,
      objectTypeProperties: {},
      relationshipProperties: {},
      settingsProperties: {},
      isLoading: true,
      isDeleting: false,
      passwordField: {},
      jsonString: '',
      revision: '',
      currentTab: 0,
      mobileDropdownTabs: [],
      hasActiveSessions: false,
      showClearSessionsModal: false,
      clearSessionsName: '',
      linkedApplications: [],
      linkedAppImgMap: {
        default: 'database.svg',
        'org.forgerock.openicf.csvfile.CSVFileConnector': 'csv.svg',
        'org.forgerock.openicf.connectors.kerberos.KerberosConnector': 'kerberos.svg',
        'org.identityconnectors.ldap.LdapConnector': 'ldap.svg',
        'org.forgerock.openicf.connectors.salesforce.SalesforceConnector': 'salesforce.svg',
        'org.forgerock.openicf.connectors.scim.ScimConnector': 'scim.svg',
        'org.forgerock.openicf.connectors.scriptedrest.ScriptedRESTConnector': 'scripted.svg',
        'org.forgerock.openicf.connectors.scriptedsql.ScriptedSQLConnector': 'scripted.svg',
        'org.forgerock.openicf.connectors.ssh.SSHConnector': 'ssh.svg',
      },
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      const idmInstance = this.getRequestService();
      axios.all([
        getSchema(`${this.resourceType}/${this.resourceName}`),
        idmInstance.get(`privilege/${this.resourceType}/${this.resourceName}/${this.id}`),
      ]).then(axios.spread((schema, privilege) => {
        this.resourceTitle = schema.data.title;
        this.resourceSchema = schema.data;
        this.resourcePrivilege = privilege.data;

        this.$emit('breadcrumb-data-changed', { route: `/${this.$route.meta.listRoute}/${this.resourceType}/${this.resourceName}`, routeName: this.$t('pages.access.list', { resource: this.getTranslation(this.resourceTitle) }) });

        this.objectTypeProperties = this.getObjectTypeProperties(schema.data, privilege.data);
        this.relationshipProperties = this.getRelationshipProperties(schema.data, privilege.data);

        idmInstance.get(this.buildResourceUrl()).then((resourceDetails) => {
          this.revision = resourceDetails.data._rev;
          this.resourceDetails = resourceDetails.data;

          if (this.canClearSessions && this.$store.state.SharedStore.hasAmUrl) {
            // only get session info if canClearSessions and am url is present
            getSessionInfo(this.id).then((sessionInfo) => {
              this.hasActiveSessions = sessionInfo.data.resultCount > 0;
              this.clearSessionsName = `${this.resourceDetails.givenName} ${this.resourceDetails.sn}`;
              this.generateDisplay();
              this.settingsProperties = this.getSettingsProperties(schema.data, privilege.data);
            }).catch((error) => {
              this.displayNotification('IDMMessages', 'error', error.response.data.message);
            });
          } else {
            this.generateDisplay();
            this.settingsProperties = this.getSettingsProperties(schema.data, privilege.data);
          }
        }).catch((error) => {
          this.displayNotification('IDMMessages', 'error', error.response.data.message);
        });

        this.loadLinkedApplicationsData();
      }))
        .catch((error) => {
          this.displayNotification('IDMMessages', 'error', error.response.data.message);
        });
    },
    loadLinkedApplicationsData() {
      // Only get linked applications for users with openidm-admin permissions
      if (this.isOpenidmAdmin) {
        return getLinkedApplications(this.resourceName, this.id).then((result) => {
          this.formatLinkedApplications(result.data);
        })
          .catch((error) => {
            this.showErrorMessage(error, this.$t('errors.errorRetrievingLinkedApplications'));
          });
      }
      return Promise.resolve();
    },
    formatLinkedApplications(applications) {
      this.linkedApplications = [];
      const promises = [];
      applications.forEach((app) => {
        promises.push(getSchema(app.resourceName));
      });

      return Promise.all(promises).then((responses) => {
        responses.forEach((result, index) => {
          const app = applications[index];
          // app.resourceName looks like system/ConnectorName/__ACCOUNT__/user.
          // Get the connectors name from between the first and second '/'.
          app.name = app.resourceName.split('/')[1]; // eslint-disable-line
          app.schema = result.data.properties;
          const ref = result.data.connectorRef;
          // Name here refers to the connectors type, not it's name.
          // Display name is nicely formatted but it doesn't exist on all
          // connectors so fall back to using connectorName
          if (ref.displayName) {
            app.connectorType = ref.displayName;
          } else if (ref.connectorName) {
            const split = ref.connectorName.split('.');
            app.connectorType = split[split.length - 1];
          }
          app.image = this.getLinkedAppImg(ref.connectorName);
          // Build an array of the connectors data by combining each of it's
          // properties names, types and values from app.content and app.schema.
          app.data = [];
          Object.keys(app.content).forEach((key) => {
            if (app.schema[key]
                && app.schema[key].nativeName
                && app.content[key]
                && (app.content[key].length !== 0)
                && app.schema[key].type) {
              const prop = {};
              prop.name = app.schema[key].nativeName;
              prop.value = app.content[key];
              prop.type = app.schema[key].type;
              prop.itemsType = app.schema[key].items ? app.schema[key].items.type : null;
              // VuePrismEditor expects a json string so if the property is an
              // object stringify it before passing it along
              if (prop.type === 'object' || (prop.type === 'array' && prop.itemsType === 'object')) {
                prop.value = JSON.stringify(prop.value, null, 2);
              }
              app.data.push(prop);
            }
          });
          this.linkedApplications.push(app);
        });
      });
    },
    getLinkedAppImg(connectorType) {
      return this.linkedAppImgMap[connectorType] ? this.linkedAppImgMap[connectorType] : this.linkedAppImgMap.default;
    },
    buildResourceUrl() {
      let url = `${this.resourceType}/${this.resourceName}/${this.id}?_fields=*`;
      const singletons = filter(this.relationshipProperties, { type: 'relationship' });

      if (singletons.length) {
        url += `,${map(singletons, (prop) => `${prop.propName}/*`).join(',')}`;
      }

      return url;
    },
    getObjectTypeProperties(schema, privilege) {
      return pickBy(schema.properties, (property, key) => {
        const hasPermission = privilege.VIEW.properties.includes(key) || privilege.UPDATE.properties.includes(key) || this.isOpenidmAdmin;
        const isObjectTypeProperty = property.type === 'object' && property.viewable;

        property.propName = key;
        property.readOnly = !privilege.UPDATE.properties.includes(key) && !this.isOpenidmAdmin;

        return isObjectTypeProperty && hasPermission;
      });
    },
    getObjectTypeProperyDisplayProperties(obj) {
      return map(obj.order, (propName) => {
        const property = obj.properties[propName];
        property.key = propName;
        property.value = this.formFields[obj.propName] ? this.formFields[obj.propName][propName] || null : null;
        if (obj.readOnly && !this.isOpenidmAdmin) {
          property.disabled = true;
        } else {
          property.disabled = false;
        }

        return obj.properties[propName];
      });
    },
    getRelationshipProperties(schema, privilege) {
      return pickBy(schema.properties, (property, key) => {
        const isInPropertyOrder = schema.order.includes(key);
        const hasPermission = privilege.VIEW.properties.includes(key) || privilege.UPDATE.properties.includes(key) || this.isOpenidmAdmin;
        const isRelationship = property.type === 'relationship' || (property.type === 'array' && (property.items.type === 'relationship' || property.items.isRelationship));

        property.propName = key;

        if (isRelationship) {
          property.readOnly = !privilege.UPDATE.properties.includes(key) && !this.isOpenidmAdmin;
        }

        return isInPropertyOrder && isRelationship && hasPermission;
      });
    },
    getSettingsProperties(schema, privilege) {
      return pickBy(schema.properties, (property, key) => {
        const hasPermission = privilege.VIEW.properties.includes(key) || privilege.UPDATE.properties.includes(key) || this.isOpenidmAdmin;
        const isSettingsPropery = property.isConditional || property.isTemporalConstraint;

        property.propName = key;
        if (property.isTemporalConstraint) {
          property.disabled = !privilege.UPDATE.properties.includes(key) && !this.isOpenidmAdmin;
          if (isArray(this.formFields[key]) && this.formFields[key].length > 0) {
            property.value = this.formFields[key][0].duration;
          }
        } else if (property.isConditional) {
          property.disabled = !privilege.UPDATE.properties.includes(key) && !this.isOpenidmAdmin;
          property.value = this.formFields[key];
        }

        return isSettingsPropery && hasPermission;
      });
    },
    generateDisplay() {
      const schema = this.resourceSchema;
      const privilege = this.resourcePrivilege;

      if (this.isOpenidmAdmin) {
        const filteredFields = [];

        keys(this.resourceDetails).forEach((key) => {
          const prop = schema.properties[key];

          if (prop) {
            filteredFields.push(key);
          }
        });

        this.formFields = pick(this.resourceDetails, filteredFields);
      } else {
        this.formFields = pick(this.resourceDetails, privilege.VIEW.properties);
      }
      // save string used for JSON tab
      this.jsonString = JSON.stringify(this.formFields, null, 2);

      if (privilege.DELETE.allowed || this.isOpenidmAdmin) {
        this.canDelete = true;
      }

      if (schema['mat-icon'] && schema['mat-icon'].length > 0) {
        this.icon = schema['mat-icon'];
      } else {
        this.icon = 'check_box_outline_blank';
      }

      if (privilege.VIEW.allowed || this.isOpenidmAdmin) {
        // if there are no update properties disable the save button
        if (privilege.UPDATE.properties.length === 0 && !this.isOpenidmAdmin) {
          this.disableSaveButton = true;
          this.$emit('button-state-change', this.disableSaveButton);
        }
        each(this.mergePrivilegeProperties(privilege, schema), (createPriv) => {
          const tempProp = schema.properties[createPriv.attribute];

          if (createPriv.attribute === 'password' && !createPriv.readOnly) {
            this.canChangePassword = true;
          }

          tempProp.key = createPriv.attribute;

          if (!tempProp.isConditional && !tempProp.isTemporalConstraint && tempProp.type !== 'array') {
            delete tempProp.description;
          }

          if (indexOf(schema.required, createPriv.attribute) !== -1) {
            tempProp.validation = 'required';
          }
          if (tempProp.policies && tempProp.policies[0] && tempProp.policies[0].policyId === 'valid-email-address-format') {
            if (tempProp.validation && tempProp.validation.length) {
              tempProp.validation += '|email';
            } else {
              tempProp.validation = 'email';
            }
          }

          // Try and do some primary detection for a display name
          if (createPriv.attrubute !== '_id' && this.displayNameField.length === 0) {
            this.displayNameField = createPriv.attribute;
          }

          // Try and do some primary detection for a secondary title
          const attribute = createPriv.attribute.toLowerCase();
          if ((attribute === 'title' || attribute === 'email' || attribute === 'type' || attribute === 'username' || attribute === 'mail' || attribute === 'description')
              && this.displaySecondaryTitleField.length === 0) {
            this.displaySecondaryTitleField = createPriv.attribute;
          }

          // Add fields that may not be set yet from reading the resource
          if (isUndefined(this.formFields[createPriv.attribute])) {
            if (tempProp.type === 'boolean') {
              this.$set(this.formFields, createPriv.attribute, false);
            } else {
              this.$set(this.formFields, createPriv.attribute, '');
            }
          }
          tempProp.value = this.formFields[createPriv.attribute];
          if ((createPriv.readOnly && !this.isOpenidmAdmin) || tempProp.isVirtual) {
            tempProp.disabled = true;
          } else {
            tempProp.disabled = false;
          }

          if (createPriv.attribute !== 'password' && tempProp.viewable && !tempProp.isConditional) {
            this.displayProperties.push(tempProp);
          } else {
            tempProp.type = 'password';
            tempProp.validation = 'required|policy';
            this.passwordField = tempProp;
          }
        });
      }

      this.isLoading = false;
      this.$emit('loading-state-change', this.isLoading);
    },
    deleteResource() {
      this.isDeleting = true;
      const idmInstance = this.getRequestService();

      idmInstance.delete(`${this.resourceType}/${this.resourceName}/${this.id}`)
        .then(() => {
          this.displayNotification('IDMMessages', 'success', this.$t('pages.access.deleteResource', { resource: this.resourceName }));

          this.$router.push({
            path: `/${this.$route.meta.listRoute}/${this.resourceType}/${this.resourceName}`,
          });
        }).catch((error) => {
          this.displayNotification('IDMMessages', 'error', error.response.data.message);
        }).finally(() => {
          this.isDeleting = false;
          this.$root.$emit('bv::hide::modal', 'deleteModal');
        });
    },
    mergePrivilegeProperties(privilege, schema) {
      const properties = [];

      each(schema.order, (schemaPropName) => {
        const canView = this.isOpenidmAdmin || privilege.VIEW.properties.includes(schemaPropName);
        const canUpdate = this.isOpenidmAdmin || privilege.UPDATE.properties.includes(schemaPropName);
        const property = { attribute: schemaPropName };

        if (canUpdate && schemaPropName !== '_id') {
          properties.push(property);
        } else if (canView && schemaPropName !== '_id') {
          property.readOnly = true;
          properties.push(property);
        }
      });

      return properties;
    },
    refreshData() {
      this.isLoading = true;
      // set the currentTab so we know which tab to return to after data is refreshed
      this.currentTab = (this.$refs.resourceTabs) ? this.$refs.resourceTabs.currentTab : 0;
      // clear out existing data and reload everything
      this.displayProperties = [];
      this.objectTypeProperties = {};
      this.relationshipProperties = {};
      this.settingsProperties = {};
      this.jsonString = '';
      this.loadData();
    },
    /**
     * Triggers clearing sessions for the resource, shows a notification based on the result,
     * closes the modal and refreshes resource data
     *
     * @returns {Promise} a promise which resolves when the session has been cleared
     */
    clearSessionsAndCloseModal() {
      return clearSessions(this.id)
        .then(() => {
          this.displayNotification('AdminMessage', 'success', this.$t('clearSessionsModal.successClearingSessions'));
        }, (err) => {
          this.showErrorMessage(
            err,
            this.$t('clearSessionsModal.errorClearingSessions'),
          );
        })
        .finally(() => {
          this.showClearSessionsModal = false;
          this.refreshData();
        });
    },
    /**
     * Populate tabs dropdown for mobile sizes.
     *
     * @param {Array} tabs array of objects received by BTabs component on load.
     */
    populateMobileDropdownTabs(tabs) {
      const tabTitles = [];

      if (tabs.length) {
        each(tabs, (tab) => {
          tabTitles.push(tab.title);
        });
      }

      this.mobileDropdownTabs = tabTitles;
    },
  },
  computed: {
    secondaryTitle() {
      let tempDisplayName = `${this.resourceType} - ${this.resourceName}`;

      if (this.displaySecondaryTitleField.length > 0) {
        tempDisplayName = this.formFields[this.displaySecondaryTitleField];
      }

      return tempDisplayName;
    },
    displayName() {
      let tempDisplayName = this.id;

      if (this.resourceIsUser && this.formFields.givenName && this.formFields.sn) {
        tempDisplayName = `${this.formFields.givenName} ${this.formFields.sn}`;
      } else if (this.displayNameField.length > 0) {
        tempDisplayName = this.formFields[this.displayNameField];
      } else {
        tempDisplayName = this.formFields[keys(this.formFields)[0]];
      }

      return tempDisplayName;
    },
    setIcon() {
      let tempIcon = 'check_box_outline_blank';

      if (this.icon.length > 0) {
        tempIcon = this.icon;
      }

      return `${tempIcon}`;
    },
    hideNav() {
      const relationshipArrayProps = pickBy(this.relationshipProperties, { type: 'array' });
      if (keys(relationshipArrayProps).length === 0
        && keys(this.objectTypeProperties).length === 0
        && keys(this.settingsProperties).length === 0
        && !this.internalRolePrivilegesField) {
        return true;
      }

      return false;
    },
    internalRolePrivilegesField() {
      if (this.resourceType === 'internal' && this.resourceName === 'role') {
        const privs = find(this.displayProperties, { key: 'privileges' });
        return privs;
      }

      return null;
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .card-tabs-vertical {
  .card-body {
    padding: 0;
  }

  .tab-content.col {
    padding: 0;
  }
}

::v-deep .fr-tag {
  max-width: 230px;
}

// search icon in content was overlaying
// on dropdown, increased z-index.
.mobile-dropdown-menu {
  z-index: 1020;
}

::v-deep .dropdown-item.active {
  position: relative;

  &::after {
    border: none;
    content: 'check';
    position: absolute;
    right: 10px;
    top: 14px;
    font-family: 'Material Icons Outlined', Serif;
    font-size: 1rem;
    line-height: 1;
    color: $green;
    vertical-align: middle;
  }
}
</style>
