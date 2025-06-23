/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  cloneDeep,
  find,
} from 'lodash';

const predictionIcons = {
  HIGH: 'thumb_up_off_alt',
  LOW: 'thumb_down_off_alt',
  MEDIUM: 'thumbs_up_down',
};

const predictionColors = {
  HIGH: 'green',
  LOW: 'red',
  MEDIUM: 'yellow',
};

export const confidenceLevels = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  NONE: 'NONE',
};

/**
 * Checks if the prediction confidence is high based on the autoIdSettings.
 * @param {object} prediction The prediction object containing confidence score.
 * @param {object} autoIdSettings The settings object containing highScorePercentThreshold.
 * @return {boolean} Returns true if the prediction confidence is high, otherwise false.
 */
export function isHighConfidence(prediction, autoIdSettings) {
  if (!prediction) return false;
  return (prediction.confidence * 100) >= autoIdSettings.highScorePercentThreshold;
}

/**
 * Checks if the prediction confidence is low based on the autoIdSettings.
 * @param {object} prediction The prediction object containing confidence score.
 * @param {object} autoIdSettings The settings object containing lowScorePercentThreshold.
 * @return {boolean} Returns true if the prediction confidence is low, otherwise false.
 */
export function isLowConfidence(prediction, autoIdSettings) {
  if (!prediction) return false;
  return (prediction.confidence * 100) < autoIdSettings.lowScorePercentThreshold;
}

/**
 * Gets the confidence percentage on a 0-100 scale
 * @param {object} prediction The prediction object containing confidence score.
 * @return {number|null} Returns the confidence percentage rounded to the nearest integer, or null if no prediction or confidence is available.
 */
export function getConfidencePercentage(prediction) {
  if (!prediction || !prediction.confidence) return null;
  return Math.round(prediction.confidence * 100);
}

/**
 * Determines the confidence level of a prediction based on its confidence score and autoIdSettings.
 * @param {object} prediction The prediction object containing confidence score.
 * @param {object} autoIdSettings Configuration object for Auto ID recommendations
 * @return {string} Returns the confidence level as a string: 'HIGH', 'MEDIUM', 'LOW', or 'NONE'.
 */
export function getConfidenceLevel(prediction, autoIdSettings) {
  if (!prediction || !prediction.confidence) return confidenceLevels.NONE;
  if (isHighConfidence(prediction, autoIdSettings)) return confidenceLevels.HIGH;
  if (isLowConfidence(prediction, autoIdSettings)) return confidenceLevels.LOW;
  return confidenceLevels.MEDIUM;
}

/**
 * Gets the color for the confidence level of a prediction.
 * @param {string} confidenceLevel The confidence level of the prediction, expected to be one of 'HIGH', 'MEDIUM', or 'LOW'.
 * @return {string} Returns the color associated with the confidence level, or 'black' if the level is not recognized.
 */
export function getConfidenceIconColor(confidenceLevel) {
  return predictionColors[confidenceLevel] || 'black';
}

/**
 * Gets the icon for the confidence level of a prediction.
 * @param {string} confidenceLevel The confidence level of the prediction, expected to be one of 'HIGH', 'MEDIUM', or 'LOW'.
 * @return {string} Returns the icon associated with the confidence level, or null if the level is not recognized.
 */
export function getConfidenceIcon(confidenceLevel) {
  return predictionIcons[confidenceLevel] || null;
}

/**
 * Converts a set of rules into a display-friendly format.
 * Each rule is expected to be a string formatted as:
 * `<hex_length>_<property_name>_<value>`
 * For example: `04_name_John`.
 * @param {Array} rules Array of rule strings to convert.
 * @param {Array} schema Array of schema objects containing property definitions.
 * @return {Array} Returns an array of objects with keys `key`, `value`, and `displayName`.
 * If a rule cannot be parsed, it returns an object with the original rule string as `key`, an empty `value`, and the rule string as `displayName`.
 */
export function convertRulesToDisplay(rules, schema) {
  if (!rules) return [];

  const normalize = (str) => str.replace(/_/g, '').toLowerCase();
  const displayRules = rules.map((ruleStr) => {
    try {
      // Split rule string into length, property name, and value, then match the normalized property name to the user schema
      const [hexLen] = ruleStr.split('_', 2);
      const propLen = parseInt(hexLen, 16);
      const remainder = ruleStr.slice(hexLen.length + 1);
      const property = remainder.slice(0, propLen);
      const value = remainder.slice(propLen + 1); // skip underscore after prop name
      const normalizeProperty = normalize(property);
      const matchedSchema = find(schema, (entry) => normalizeProperty === normalize(entry.key));

      if (matchedSchema) return { ...matchedSchema, value };
      return { key: property, value, displayName: property };
    } catch (e) {
      return { key: ruleStr, value: '', displayName: ruleStr };
    }
  });
  return displayRules;
}

/**
 * The prediction data can vary slightly depending on the entity on which it appears, this function
 * is responsible for normalized the different properties to a common schema.
 *
 * @param {object} prediction IGA prediction data
 */
export function normalizePredictionData(prediction) {
  if (!prediction) return;
  prediction.usr_id = prediction.usr_id || prediction.user_id;
  prediction.confidence = prediction.confidence || prediction.CONF;
  prediction.rule = prediction.rule || prediction.RULE;
}

/**
 * Gets and transforms an object with IGA Auto ID recommendation and prediction data
 *
 * @param {object} item IGA entity that contains a prediction key with recommendations or predictions
 * @param {object} autoIdSettings Configuration object for Auto ID recommendations
 * @param {Array}  userSchema List of user schema properties
 * @returns Prediction object, with additional display properties added
 */
export function getPredictionDisplayInfo(item, autoIdSettings, userSchema) {
  if (!item) return null;

  normalizePredictionData(item.prediction);
  const predictionWithDisplay = cloneDeep(item.prediction) || {};
  if (autoIdSettings.enableAutoId) {
    predictionWithDisplay.confidenceLevel = getConfidenceLevel(item.prediction, autoIdSettings);
    predictionWithDisplay.confidenceIcon = getConfidenceIcon(predictionWithDisplay.confidenceLevel);
    predictionWithDisplay.confidenceIconColor = getConfidenceIconColor(predictionWithDisplay.confidenceLevel);
    predictionWithDisplay.confidencePercentage = getConfidencePercentage(item.prediction);
    predictionWithDisplay.rule = convertRulesToDisplay(predictionWithDisplay.rule, userSchema);
  }
  return predictionWithDisplay;
}
