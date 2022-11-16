<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
import {
  capitalize,
  cloneDeep,
  has,
  pick,
  uniq,
} from 'lodash';
import { getMappings, putMappings } from '@forgerock/platform-shared/src/api/MappingApi';
import PolicyConstants from './utils/PolicyPatterns.json';

export default {
  name: 'MappingMixin',
  methods: {
    deleteMappings(mappingsToDelete) {
      return new Promise((resolve, reject) => {
        getMappings().then(({ data }) => {
          const mappings = data.mappings.filter((mapping) => !mappingsToDelete.includes(mapping.name));
          putMappings({ mappings }).then(() => resolve(), (error) => reject(error));
        }).catch((error) => {
          reject(error);
        });
      });
    },
    getTemplateMappings(appTemplate, connectorId, authoritative, configManagedObjects) {
      const mappings = [];
      if (!appTemplate.objectTypes) return mappings;

      appTemplate.objectTypes.forEach((objectType) => {
        if (!objectType.mappings) return;

        const resourceName = objectType.managedResource || 'user';

        const managedResource = configManagedObjects.find((object) => (!this.$store.state.isFraas || object.name.startsWith(this.$store.state.realm)) && object.name.endsWith(resourceName.toLowerCase())).name;
        const outboundProps = has(objectType.mappings, 'provisioning.properties') && !authoritative
          ? this.parseProperties(objectType.mappings.provisioning.properties)
          : null;
        const inboundProps = has(objectType.mappings, 'recon.properties') && authoritative
          ? this.parseProperties(objectType.mappings.recon.properties)
          : null;
        mappings.push({
          types: { outbound: has(objectType, 'mappings.provisioning') && !authoritative, inbound: has(objectType, 'mappings.recon') },
          properties: { outbound: outboundProps, inbound: inboundProps },
          connectorId,
          objectType: objectType.name,
          managedResource,
        });
      });
      return mappings;
    },
    parseProperties(templateProperties) {
      const properties = [];
      templateProperties.forEach((property) => {
        const newProp = cloneDeep(property);
        if (newProp.transform) {
          newProp.source = '';
          newProp.transform = {
            source: newProp.transform,
            type: 'text/javascript',
          };
        }

        if (newProp.condition) {
          const condition = {
            globals: {},
            source: newProp.condition,
            type: 'text/javascript',
          };
          newProp.condition = condition;
        }

        properties.push(newProp);
      });

      return properties;
    },
    /**
     * Add mappings for an application
     *
     * @param {Object[]} mappings mapping information used to create mappings
     * @param {String} mappings[].connectorId id of connector
     * @param {String} mappings[].objectType name of object type
     * @param {String} mappings[].managedResource name of managed resource
     * @param {Object} mappings[].types mapping types to create
     * @param {Boolean} mappings[].types.inbound create an inbound mapping
     * @param {Boolean} mappings[].types.outbound create an outbound mapping
     * @param {Object} mappings[].properties mapping properties for each mapping type
     * @param {Object[]} mappings[].inbound mapping properties for inbound mapping
     * @param {Object[]} mappings[].outbound mapping properties for outbount mapping
     * @returns {Promise}
     */
    addApplicationMappings(mappings, existingMappings, authoritative, correlationQuery, assignmentResourceName) {
      return new Promise((resolve, reject) => {
        const newMappings = [];
        const allMappingNames = [];
        mappings.forEach((mapping) => {
          const mappingNames = this.getMappingNames(mapping.connectorId, mapping.objectType, mapping.managedResource);
          const systemResourcePath = `system/${mapping.connectorId}/${mapping.objectType}`;
          const managedResourcePath = `managed/${mapping.managedResource}`;

          if (mapping.types.inbound && !existingMappings?.includes(mappingNames.inbound)) {
            newMappings.push(this.getMappingDefaults(
              mappingNames,
              systemResourcePath,
              managedResourcePath,
              mapping.properties.inbound,
              authoritative,
              false,
              correlationQuery,
              assignmentResourceName,
            ));
            allMappingNames.push(mappingNames.inbound);
          }

          if (mapping.types.outbound && !existingMappings?.includes(mappingNames.outbound)) {
            newMappings.push(this.getMappingDefaults(
              mappingNames,
              managedResourcePath,
              systemResourcePath,
              mapping.properties.outbound,
              authoritative,
              true,
            ));
            allMappingNames.push(mappingNames.outbound);
          }
        });

        getMappings().then(({ data }) => {
          putMappings({ mappings: [...data.mappings, ...newMappings] }).then(() => resolve(allMappingNames), (error) => reject(error));
        });
      });
    },
    /**
     * Given two arrays of unique mappings, return a single array of unique values
     * @param {*} newMappingNames names of added mappings
     * @param {*} oldMappingNames names of existing mappings
     * @returns {Array} single array of unique mapping names
     */
    getNewMappingNameProperty(newMappingNames, oldMappingNames) {
      const uniqueMappings = oldMappingNames
        ? uniq([...newMappingNames, ...oldMappingNames])
        : newMappingNames;
      return uniqueMappings;
    },
    /**
     * Get mapping names for an application
     *
     * @param {String} connectorId id of connector
     * @param {String} objectType name of object type
     * @param {String} managedResource name of managed resource
     * @returns {Object} generated outbound and inbound mapping names
     */
    getMappingNames(connectorId, objectType, managedResource) {
      if (!connectorId || !objectType || !managedResource) {
        throw new Error('connector id, object type, and managed resource are required');
      }
      return {
        outbound: `managed${capitalize(managedResource)}_system${capitalize(connectorId)}${capitalize(objectType)}`,
        inbound: `system${capitalize(connectorId)}${capitalize(objectType)}_managed${capitalize(managedResource)}`,
      };
    },
    /**
     * Get default policies (rules) for a mapping
     *
     * @returns {Object[]} Default mapping policies
     */
    getMappingPolicyDefaults(authoritative, isOutbound, applicationId) {
      const managedUserResourceName = this.configManagedObjects.find((object) => (!this.$store.state.isFraas || object.name.startsWith(this.$store.state.realm)) && object.name.endsWith('user')).name;
      const managedApplicationResourceName = this.configManagedObjects.find((object) => (!this.$store.state.isFraas || object.name.startsWith(this.$store.state.realm)) && object.name.endsWith('application')).name;
      return PolicyConstants.defaultActions.policies.map((defaultPolicy) => {
        const policy = { situation: defaultPolicy.situation };

        if (authoritative) {
          policy.action = defaultPolicy.defaults.authoritative.inbound;
        } else if (isOutbound) {
          policy.action = defaultPolicy.defaults.target.outbound;
        } else {
          policy.action = defaultPolicy.defaults.target.inbound;
          if (defaultPolicy.defaults.postAction?.inbound) {
            const source = defaultPolicy.defaults.postAction.inbound
              .replace('applicationId', applicationId)
              .replace('managedUserResourceName', managedUserResourceName)
              .replace('managedApplicationResourceName', managedApplicationResourceName);
            policy.postAction = {
              globals: {},
              source,
              type: 'text/javascript',
            };
          }
        }

        return policy;
      });
    },
    /**
     *  Get a default mapping object
     *
     * @param {Object} mappingNames names of inbound and outbound mappings
     * @param {String} source mapping source resource
     * @param {String} target mapping target resource
     * @param {Object[]} defaultProps source and target properties to include in mapping
     * @param {Boolean} isOutbound flag for signifying this is an outbound mapping
     * @returns {Object} mapping object with the function arguments as values
     */
    getMappingDefaults(mappingNames, source, target, defaultProps, authoritative, isOutbound, correlationQuery, assignmentResourceName) {
      const name = isOutbound ? mappingNames.outbound : mappingNames.inbound;
      const mappingDefaults = {
        name,
        displayName: name,
        source,
        target,
        consentRequired: false,
        icon: null,
        policies: this.getMappingPolicyDefaults(authoritative, isOutbound, this.managedApplication._id),
        properties: defaultProps || [],
        runTargetPhase: authoritative,
      };
      // If this is an outbound mapping add sourceCondition and sourceQuery
      if (isOutbound) {
        mappingDefaults.sourceCondition = `/source/effectiveApplications[_id eq "${this.managedApplication._id}"]`;
        mappingDefaults.sourceQuery = {
          _queryFilter: `effectiveApplications[_id eq "${this.managedApplication._id}"] or lastSync/${name} pr`,
        };
        mappingDefaults.optimizeAssignmentSync = true;
      } else if (authoritative) {
        // authoritative will default to username correlatioQuery
        mappingDefaults.correlationQuery = [{
          linkQualifier: 'default',
          expressionTree: {
            all: ['userName'],
          },
          mapping: mappingNames.inbound,
          type: 'text/javascript',
          file: 'ui/correlateTreeToQueryFilter.js',
        }];
      } else {
        // inbound target apps need to have their correlationQuery set
        mappingDefaults.correlationQuery = [{
          linkQualifier: 'default',
          source: correlationQuery,
          type: 'text/javascript',
        }];
        mappingDefaults.links = mappingNames.outbound;

        // Preservation system to ensure that changes made to target app account object are replicated on IDM user object
        const preservationSystemSource = 'function javaIsEqual(old, other) {\n  var JsonPatch = org.forgerock.json.JsonPatch;\n  var JsonValue = org.forgerock.json.JsonValue;\n  return JsonPatch.diff(JsonValue(old), JsonValue(other)).asList().size() === 0;\n}\n\nif (situation === "FOUND") {\n  var params = {\n    "resourceId": targetId, \n    "mapping": mappingConfig.links,\n    "linkQualifier": linkQualifier\n  };\n\n  // get the preview of the target object from the outbound mapping\n  var targetPreview = openidm.action("sync", "getTargetPreview", {}, params);\n  var attributes = [];\n\n  // find all values where target app user has different values from the correlated IDM user\n  Object.keys(source).filter(function (key) {\n    if (key in targetPreview) {\n      return !javaIsEqual(source[key], targetPreview[key]); \n    } else {\n      return false\n    }\n  }).forEach(function (key) {\n    var attribute = {\n      "name": key,\n      "value": source[key]\n    };\n    attributes.push(attribute);\n  })\n\n  // create override assignment if any diff was found\n  if (attributes.length > 0) {\n    var assignment = {\n      "name": targetId + "-overrideAssignment",\n      "description": targetId + "override assignment",\n      "mapping": mappingConfig.links,\n      "attributes": attributes,\n      "type": "__OVERRIDE__",\n      "members": [{"_ref": mappingConfig.target + "/" + targetId}]\n    };\n    var assignmentResult = openidm.create(assignmentResCollection, null, assignment);\n    var result = openidm.action("sync", "getTargetPreview", {}, params);\n    Object.keys(source).forEach(function (key) {\n      if (typeof result[key] === "undefined" || javaIsEqual(source[key], result[key])) {\n        return\n      }\n      // unable to successfully recreate object being linked, delete assignment and throw exception\n      openidm.delete(assignmentResCollection + "/" + assignmentResult._id, null);\n      throw "Unable to successfully recreate " + sourceId + " with an assignment for " + targetId;\n    })\n  }\n}';
        mappingDefaults.onLink = {
          type: 'text/javascript',
          globals: {
            assignmentResCollection: `managed/${assignmentResourceName}`,
          },
          source: preservationSystemSource,
        };
      }
      return mappingDefaults;
    },
    pickMappingProperties(mapping) {
      const properties = [
        'allowEmptySourceSet',
        'consentRequired',
        'correlateEmptyTargetSet',
        'correlationQuery',
        'displayName',
        'icon',
        'links',
        'name',
        'onCreate',
        'onUpdate',
        'onDelete',
        'onLink',
        'onUnlink',
        'optimizeAssignmentSync',
        'policies',
        'prefetchLinks',
        'properties',
        'recon',
        'runTargetPhase',
        'source',
        'sourceCondition',
        'sourceQuery',
        'target',
        'targetQuery',
        'taskThreads',
        'validSource',
        'validTarget',
      ];
      return pick(mapping, properties);
    },
  },
};
</script>
