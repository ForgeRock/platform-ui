/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateAmApi } from '@forgerock/platform-shared/src/api/BaseApi';
import apiUtils from './utils/apiUtils';

const apiVersion = 'protocol=2.1,resource=1.0';
const getTreeApiConfig = (realm) => {
  let configPath;
  if (!realm) {
    configPath = apiUtils.getCurrentRealmConfigPath();
  } else {
    configPath = apiUtils.getRealmConfigPath(realm);
  }
  return {
    path: `${configPath}/authentication/authenticationtrees`,
    apiVersion,
  };
};

/**
  * Returns a list of already created trees with any input fields
  * @param {String[]} fields Optional list of fields to search
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
  *
  * @returns {Promise}
  */
export function putNode(nodeId, nodeType, nodeDetails) {
  return generateAmApi(getTreeApiConfig()).put(
    `/nodes/${nodeType}/${nodeId}`,
    nodeDetails,
    { withCredentials: true },
  );
}

/**
  * Reads an existing tree
  * @param {String} nodeId Tree name used for identification
  *
  * @returns {Promise}
  */
export function deleteNode(nodeId, nodeType) {
  return generateAmApi(getTreeApiConfig()).delete(
    `/nodes/${nodeType}/${nodeId}`,
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
export function actionNodeGetAllTypes() {
  return generateAmApi(getTreeApiConfig()).post(
    '/nodes?_action=getAllTypes',
    {},
    { withCredentials: true },
  );
}

/**
  * Returns a specific node types schema
  * @param {String} nodeType Id specifiying a specific node type
  *
  * @returns {Promise}
  */
export function actionNodeSchema(nodeType) {
  return generateAmApi(getTreeApiConfig()).post(
    `/nodes/${nodeType}?_action=schema`,
    {},
    { withCredentials: true },
  );
}

/**
  * Returns a node types base data template
  * @param {String} nodeType Id specifiying a specific node type
  *
  * @returns {Promise}
  */
export function actionNodeTemplate(nodeType) {
  return generateAmApi(getTreeApiConfig()).post(
    `/nodes/${nodeType}?_action=template`,
    {},
    { withCredentials: true },
  );
}

/**
  * Returns a specific node types data template
  * @param {String} nodeType Id specifiying a specific node type
  * @param {String} nodeId Id specifiying a specific node type
  *
  * @returns {Promise}
  */
export function getNodeTemplate(nodeType, nodeId) {
  return generateAmApi(getTreeApiConfig()).get(
    `/nodes/${nodeType}/${nodeId}`,
    { withCredentials: true },
  );
}

/**
  * Returns a specific node types outcomes
  * @param {String} nodeType Id specifiying a specific node type
  * @param {String} nodeTypeConfig Optional object for node type details
  *
  * @returns {Promise}
  */
export function actionNodeListOutcomes(nodeType, nodeTypeConfig = {}) {
  return generateAmApi(getTreeApiConfig()).post(
    `/nodes/${nodeType}?_action=listOutcomes`,
    nodeTypeConfig,
    { withCredentials: true },
  );
}
