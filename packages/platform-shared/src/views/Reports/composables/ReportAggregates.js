/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export default function useReportAggregates() {
  function aggregateDefinitions() {
    return [];
  }

  function aggregatesPayload(definitions) {
    if (definitions.length) {
      return {
        aggregate: {},
      };
    }
    return {};
  }

  return {
    aggregateDefinitions,
    aggregatesPayload,
  };
}
