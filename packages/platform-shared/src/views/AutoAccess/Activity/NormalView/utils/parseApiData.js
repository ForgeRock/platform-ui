/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { colorsHex, colorsReadable } from './colors';

export default function parseApiData(response) {
  const categories = {};
  const categoryHasOther = {};
  const categoryNames = [...new Set(response.result.map((item) => item.category))];
  categoryNames.forEach((category) => {
    let categoryValue = {};
    let otherCount = 0;
    let otherCategoryData = {};
    categories[category] = [];
    categoryHasOther[category] = false;

    /**
     * This reorganizing of the API data is needed since the data provided is formatted in a way needed by the UI.
     *
     * The data is flat and need to be organized into a usable object structure.
     * It needs to be manipulated by merging values of 'other', and null together into a single field.
     * The field of 'Others' also need to be converted to have the label 'other' and be sorted last
     */
    response.result.forEach((item) => {
      if (item.category === category) {
        // 'other' or null
        if (item.value === 'other' || !item.value) {
          otherCount += parseInt(item.count, 10);
          if (!categoryHasOther[category]) {
            otherCategoryData = {
              label: 'unknown',
              value: otherCount,
              valueFormatted: otherCount,
            };
            categoryHasOther[category] = true;
          } else {
            otherCategoryData.value = otherCount;
            otherCategoryData.valueFormatted = otherCount;
          }
        } else {
          // Handle all normal categories, except 'Others' which gets renames to 'other'
          categoryValue = {
            label: item.value === 'Others' ? 'other' : item.value,
            value: parseInt(item.count, 10),
            valueFormatted: item.count,
          };
          categories[item.category].push(categoryValue);
        }
      }
    });

    // We have found 'other' or null and need to add the manipulated field to the main array
    if (categoryHasOther[category]) {
      categories[category].push(otherCategoryData);
    }

    // Sort categories based on numerical 'value', but leave 'other' sorted last
    Object.keys(categories).forEach((cat) => {
      categories[cat].sort((a, b) => {
        const aVal = parseInt(a.value, 10);
        const bVal = parseInt(b.value, 10);
        if (a.label === 'other') { return 1; }
        if (b.label === 'other') { return -1; }
        if (aVal < bVal) { return 1; }
        if (aVal > bVal) { return -1; }
        return 0;
      });

      // Set the color values - hex for the Donut Chart, readable for the data table
      let colorIndex = 0;
      categories[cat].forEach((item) => {
        item.color = colorsHex[colorIndex] || colorsHex[4];
        item.colorReadable = colorsReadable[colorIndex] || colorsReadable[4];
        colorIndex += 1;
      });
    });
  });

  return categories;
}
