/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { colorsHex } from './colors';

export default function parseApiData(response) {
  const sortedCategory = {};
  const categories = [...new Set(response.result.map((item) => item.category))];
  categories.forEach((category) => {
    let colorIndex = 0;
    sortedCategory[category] = [];
    response.result.forEach((item) => {
      if (item.category === category) {
        const categoryValue = {
          label: item.value,
          value: parseInt(item.count, 10),
          valueFormatted: item.count,
          color: colorsHex[colorIndex] || colorsHex[4],
        };
        sortedCategory[item.category].push(categoryValue);
        colorIndex += 1;
      }
    });
  });
  return sortedCategory;
}
