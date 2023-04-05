/* eslint-disable import/prefer-default-export */
/**
 * Copyright 2023 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

// An array of extra colors that can be used if the input tier display name does not match one of the fixed values
const extraTierColors = ['indigo', 'purple', 'pink', 'red', 'orange', 'teal'];

// An object that maps the fixed tier color values
const fixedTierColors = {
  development: 'blue',
  dev: 'blue',
  staging: 'yellow',
  production: 'green',
  prod: 'green',
  uat: 'cyan',
  other: 'gray',
};

/**
 * Returns a color as a string, based on the input tier display name.
 * If the tier display name matches one of the fixed values, it returns the corresponding fixed color.
 * Otherwise, generates a random index based on the hash code of the tier display name and returns the corresponding color from the extraTierColors array.
 * @param {string} tierDisplayName - The display name of the tier (e.g. 'development', 'staging', etc.)
 * @returns {string} - A string containing the color to be used for the tier.
 */
export function getTierColor(tierDisplayName) {
  // Check if the input tier display name has a fixed tier color value assigned, and return the corresponding color if it does
  const lowerCaseTierName = tierDisplayName.toLowerCase();
  if (fixedTierColors[lowerCaseTierName]) {
    return fixedTierColors[lowerCaseTierName];
  }

  // If the input tier display name does not have a fixed color value assigned, map it to a unique index using the string hash code
  const tierDisplayNameHash = Array.from(lowerCaseTierName).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = tierDisplayNameHash % extraTierColors.length;

  // Return the color corresponding to the index
  return extraTierColors[index];
}
