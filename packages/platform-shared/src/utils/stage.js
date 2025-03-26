/**
 * Copyright (c) 2022-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { isObject } from 'lodash';

/**
 * Parses theme id within string version of stage field in the form of stageId=<id> or stageid=<id>
 * @param {string} stage A string containing a theme id definition
 * @returns {string} Returns the found theme id
 */
export function getThemeIdFromStageString(stage) {
  const regexp = /theme[Ii]d=\s*(.[^\s,]*).*/g;
  const match = regexp.exec(stage);
  if (match && match[1]) {
    return match[1];
  }
  return '';
}

export function parseStage(stageValue) {
  try {
    return JSON.parse(stageValue);
  } catch (e) {
    return stageValue;
  }
}

/**
 * Finds themeId in stage value
 *
 * @param {string} stageValue
 */
export function getThemeId(stage) {
  let themeId = '';
  if (stage) {
    if (stage.themeId) {
      themeId = stage.themeId;
    } else {
      themeId = getThemeIdFromStageString(stage);
    }
  }
  return themeId;
}

/**
 * updates the stage field of a page node with changed property
 * @param {Object} pageNode Page node we are setting the stage value of
 * @param {String} id id of the node being set
 * @param {String} key which property in the stage object we are setting
 * @param {String} value Actual value we want to set on this property
 */
export function setStageValue(pageNode, id, key, value) {
  let cleanValue = value;
  // For new theme id format, we want to strip off the ui/theme-<realm>- prefix to ensure that imported journeys
  // do not used an incorrect realm from the id
  if (key === 'themeId' && value.startsWith('ui/theme-')) {
    const removeIndex = value.indexOf('-', value.indexOf('-') + 1);
    cleanValue = value.substring(removeIndex + 1);
  }
  let stage = parseStage(pageNode.template.stage);

  if (!stage) {
    stage = {};
  } else if (!isObject(stage)) {
    const themeId = getThemeIdFromStageString(stage);
    if (themeId) {
      stage = { themeId };
    } else {
      stage = {};
    }
  }

  // Keys including a '.' indicate that they are properties being set for a callback
  // within a pagenode, rather than on the pagenode itself. We then handle these with an array
  // as there can be multiple of the same type of subnode within a pagenode.
  if (key.includes('.')) {
    const [callbackName, propertyName] = key.split('.');
    if (!stage[callbackName] && cleanValue !== undefined) {
      stage[callbackName] = [];
    }
    if (stage[callbackName]) {
      const callbackIndex = stage[callbackName].findIndex((callback) => callback.id === id);
      if (callbackIndex > -1) {
        // Modify config if it exists for this node
        if (cleanValue) {
          stage[callbackName][callbackIndex][propertyName] = cleanValue;
        } else if (cleanValue === false && Object.keys(stage[callbackName][callbackIndex]).length > 2) {
          // If there is more than one property on the current node, we only want to set value to new value
          delete stage[callbackName][callbackIndex][propertyName];
        } else {
          // else we want to completely remove this node in the saved object
          stage[callbackName].splice(callbackIndex, 1);
          if (stage[callbackName].length === 0) {
            delete stage[callbackName];
          }
        }
      } else if (cleanValue !== undefined) {
        // Add new config
        stage[callbackName].push({
          id,
          [propertyName]: cleanValue,
        });
      }
    }
  // We are setting values on the page node
  } else if (cleanValue) {
    if (typeof cleanValue === 'object' && !Object.keys(cleanValue).length) {
      delete stage[key];
    } else {
      stage[key] = cleanValue;
    }
  } else {
    delete stage[key];
  }
  if (Object.keys(stage).length === 0) {
    pageNode.template.stage = '';
  } else {
    pageNode.template.stage = JSON.stringify(stage);
  }
}

/**
 * Check if a string is a valid JSON
 */
export function isJSON(str) {
  try {
    return !!JSON.parse(str);
  } catch (e) {
    return false;
  }
}
