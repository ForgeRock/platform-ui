/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export default function useReportFilters() {
  function filterDefinitions(definitions) {
    if (definitions && Object.keys(definitions).length) {
      return [];
    }
    return [];
  }

  function filtersPayload(definitions) {
    if (definitions.length) {
      return {
        filter: {},
      };
    }
    return {};
  }

  return {
    filterDefinitions,
    filtersPayload,
  };
}
