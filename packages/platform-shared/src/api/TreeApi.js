/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateAmApi } from '@forgerock/platform-shared/src/api/BaseApi';
import apiUtils from './utils/apiUtils';

const apiVersion = 'protocol=2.1,resource=1.0';

/**
  * Constructs the tree APIs config using the passed realm name and version
  * @param {String} realm the current realm
  * @param {Boolean} useApiV3 whether to use the tree api resource 3.0
  *
  * @returns {Object}
  */
const getTreeApiConfig = (realm, useApiV3 = false) => {
  let configPath;
  if (!realm) {
    configPath = apiUtils.getCurrentRealmConfigPath();
  } else {
    configPath = apiUtils.getRealmConfigPath(realm);
  }
  return {
    path: `${configPath}/authentication/authenticationtrees`,
    apiVersion: useApiV3 ? 'protocol=2.1,resource=3.0' : apiVersion,
  };
};

/**
  * Returns a list of already created trees with any input fields
  * @param {String[]} fields Optional list of fields to search
  * @param {Boolean} queryFilter for filtering results
  * @param {Number} pageSize quantity of results to shgow on each page
  *
  * @returns {Promise}
  */
export function actionGetAllTrees(fields, queryFilter = true, pageSize = -1) {
  let urlString = `/trees?_queryFilter=${queryFilter}&_pageSize=${pageSize}`;
  if (fields && fields.length > 0) {
    urlString += `&_fields=${fields.toString()}`;
  }
  return generateAmApi(getTreeApiConfig()).get(
    urlString,
    { withCredentials: true },
  );
}

/**
  * Reads an existing tree
  * @param {String} treeId Tree name used for identification
  * @param {Boolean} forExport Flag for telling getTree not to include ?ForUI=true to request
  * @param {String} realm optional realm parameter if getting tree outside of current realm
  * @param {String[]} fields Optional list of fields to search
  *
  * @returns {Promise}
  */
export function getTree(treeId, forExport, realm, fields) {
  let treePath = `/trees/${treeId}`;
  if (!forExport) {
    treePath = `${treePath}?forUI=true`;
  }
  if (fields && fields.length > 0) {
    treePath += `&_fields=${fields.toString()}`;
  }

  return generateAmApi(getTreeApiConfig(realm)).get(
    treePath,
    { withCredentials: true },
  );
}

/**
  * Save a node
  * @param {String} nodeId Unique ID for the node
  * @param {String} nodetype The type of node
  * @param {Object} nodeDetails Details of the node to save
  * @param {String} nodeVersion The version of the node
  *
  * @returns {Promise}
  */
export function putNode(nodeId, nodeType, nodeDetails, nodeVersion = null) {
  const path = nodeVersion ? `/nodes/${nodeType}/${nodeVersion}/${nodeId}` : `/nodes/${nodeType}/${nodeId}`;
  return generateAmApi(getTreeApiConfig(undefined, nodeVersion !== null)).put(
    path,
    nodeDetails,
    { withCredentials: true },
  );
}

/**
  * Deletes a node
  * @param {String} nodeId Tree name used for identification
  * @param {String} nodetype The type of node
  * @param {String} nodeVersion The version of the node
  *
  * @returns {Promise}
  */
export function deleteNode(nodeId, nodeType, nodeVersion = null) {
  const path = nodeVersion ? `/nodes/${nodeType}/${nodeVersion}/${nodeId}` : `/nodes/${nodeType}/${nodeId}`;
  return generateAmApi(getTreeApiConfig(undefined, nodeVersion !== null)).delete(
    path,
    { withCredentials: true },
  );
}

/**
  * Save a tree
  * @param {String} treeId Tree name used for identification
  * @param {Object} treeDetails An object containing the trees details
  * @param {Boolean} match Adds a header to ensure a unique tree is saved otherwise will override existing tree
  *
  * @returns {Promise}
  */
export function putTree(treeId, treeDetails, match) {
  const headers = {
    'Content-type': 'application/json',
    'accept-api-version': apiVersion,
  };

  if (match) {
    headers['if-none-match'] = '*';
  }
  return generateAmApi(getTreeApiConfig(), headers).put(
    `/trees/${treeId}`,
    treeDetails,
    { withCredentials: true },
  );
}

/**
  * Clones an already existing tree
  * @param {String} treeId Unique tree name of existing tree
  * @param {String} newTreeId Unique tree name for new tree
  *
  * @returns {Promise}
  */
export function cloneTree(treeId, newTreeId) {
  const headers = {
    'Content-type': 'application/json',
    'accept-api-version': apiVersion,
  };

  return generateAmApi(getTreeApiConfig(), headers).post(
    `/trees/${treeId}?_action=clone`,
    { newId: newTreeId },
    { withCredentials: true },
  );
}

/**
  * Deletes a tree
  * @param {String} treeId Tree name used for identification
  *
  * @returns {Promise}
  */
export function deleteTree(treeId) {
  return generateAmApi(getTreeApiConfig()).delete(
    `/trees/${treeId}`,
    { withCredentials: true },
  );
}

/**
  * Returns the template needed for creating a tree
  *
  * @returns {Promise}
  */
export function actionTreeTemplate() {
  return generateAmApi(getTreeApiConfig()).post(
    '/trees?_action=template',
    {},
    { withCredentials: true },
  );
}

/**
  * Returns a list of available node types
  *
  * @returns {Promise}
  */
export function actionNodeListLatestTypes() {
  return generateAmApi(getTreeApiConfig(undefined, true)).post(
    '/nodes?_action=listLatestTypes',
    {},
    { withCredentials: true },
  );
}

/**
  * Returns a list of available node types
  * @param {Boolean} useApiV3 whether to use the tree api resource 3.0
  *
  * @returns {Promise}
  */
export function actionNodeGetAllTypes(useApiV3 = false) {
  return generateAmApi(getTreeApiConfig(undefined, useApiV3)).post(
    '/nodes?_action=getAllTypes',
    {},
    { withCredentials: true },
  );
}

/**
  * Returns a specific node types schema
  * @param {String} nodeType Id specifiying a specific node type
  * @param {String} nodeVersion The version of the node
  *
  * @returns {Promise}
  */
export function actionNodeSchema(nodeType, template = {}, nodeVersion = null) {
  const path = nodeVersion ? `/nodes/${nodeType}/${nodeVersion}?_action=schema` : `/nodes/${nodeType}?_action=schema`;
  return generateAmApi(getTreeApiConfig(undefined, nodeVersion !== null)).post(
    path,
    template,
    { withCredentials: true },
  );
}

/**
  * Returns a node types base data template
  * @param {String} nodeType Id specifiying a specific node type
* * @param {String} nodeVersion The version of the node
  *
  * @returns {Promise}
  */
export function actionNodeTemplate(nodeType, nodeVersion = null) {
  const path = nodeVersion ? `/nodes/${nodeType}/${nodeVersion}?_action=template` : `/nodes/${nodeType}?_action=template`;
  return generateAmApi(getTreeApiConfig(undefined, nodeVersion !== null)).post(
    path,
    {},
    { withCredentials: true },
  );
}

/**
  * Returns a specific node types data template
  * @param {String} nodeType Id specifiying a specific node type
  * @param {String} nodeId Id of the node to get the template of
  * @param {String} nodeVersion The version of the node
  *
  * @returns {Promise}
  */
export function getNodeTemplate(nodeType, nodeId, nodeVersion = null) {
  const path = nodeVersion ? `/nodes/${nodeType}/${nodeVersion}/${nodeId}` : `/nodes/${nodeType}/${nodeId}`;
  return generateAmApi(getTreeApiConfig(undefined, nodeVersion !== null)).get(
    path,
    { withCredentials: true },
  );
}

/**
  * Returns a specific node types outcomes
  * @param {String} nodeType Id specifiying a specific node type
  * @param {String} nodeTypeConfig Optional object for node type details
  * @param {String} nodeVersion The version of the node
  *
  * @returns {Promise}
  */
export function actionNodeListOutcomes(nodeType, nodeTypeConfig = {}, nodeVersion = null) {
  const path = nodeVersion ? `/nodes/${nodeType}/${nodeVersion}?_action=listOutcomes` : `/nodes/${nodeType}?_action=listOutcomes`;
  return generateAmApi(getTreeApiConfig(undefined, nodeVersion !== null)).post(
    path,
    nodeTypeConfig,
    { withCredentials: true },
  );
}

/**
  * Returns version information about the given node type
  * @param {String} nodeType Id specifiying a specific node type
  *
  * @returns {Promise}
  */
export function actionNodeGetVersionInfo(nodeType) {
  return generateAmApi(getTreeApiConfig(undefined, true)).post(
    `/nodes/${nodeType}?_action=versionInfo`,
    {},
    { withCredentials: true },
  );
}

/**
  * Updates a node to the given target version
  * @param {String} nodeType Id specifiying a specific node type
  * @param {String} currentVersion The current version of the node
  * @param {String} targetVersion The version you wish to upgrade the node to
  * @param {Object} nodeData The current node configuration
  *
  * @returns {Promise}
  */
export function actionNodeGetUpgradedConfig(nodeType, currentVersion, targetVersion, nodeData) {
  return generateAmApi(getTreeApiConfig(undefined, true)).post(
    `/nodes/${nodeType}/${currentVersion}?_action=getUpgradedConfig&targetVersion=${targetVersion}`,
    nodeData,
    { withCredentials: true },
  );
}

/**
  * Returns a specific nodes type data
  * @param {String} nodeType Id specifiying a specific node type
  * @param {String} nodeVersion The version of the node
  *
  * @returns {Promise}
  */
export function actionNodeGetType(nodeType, nodeVersion = null) {
  const path = nodeVersion ? `/nodes/${nodeType}/${nodeVersion}?_action=getType` : `/nodes/${nodeType}?_action=getType`;
  return generateAmApi(getTreeApiConfig(undefined, nodeVersion !== null)).post(
    path,
    { withCredentials: true },
  );
}

/**
  * Returns a config provider script template
  * @param {String} nodeType Id specifying a specific node type
  * @param {String} nodeVersion The version of the node
  *
  * @returns {Promise}
  */
export function actionNodeConfigProviderScript(nodeType, nodeVersion = null) {
  const path = nodeVersion ? `/nodes/${nodeType}/${nodeVersion}?_action=configProviderScript`
    : `/nodes/${nodeType}?_action=configProviderScript`;
  return generateAmApi(getTreeApiConfig(undefined, nodeVersion !== null)).post(
    path, {}, { withCredentials: true },
  );
}
