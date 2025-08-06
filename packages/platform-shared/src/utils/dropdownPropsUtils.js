/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import store from '@/store';

/**
 * Returns the boundary for the dropdown menu based on the column resizer applicability.
 * If column resizer functionality is not applicable(The input params is false), use window as the boundary.
 * If column resizer functionality is applicable(The input params is true/undefined) and the enableTableColumnResizing flag is set to true, use scrollParent as the boundary.
 * @param {boolean} isColumnResizerApplicable - Indicates if column resizer is applicable
 * @return {string} - The boundary for the dropdown menu, either 'scrollParent' or 'window'.
 */
export default function getDropdownBoundary(isColumnResizerApplicable) {
  if (isColumnResizerApplicable !== false && store.state.SharedStore.enableTableColumnResizing) {
    return 'scrollParent';
  }
  return 'window'; // Default to window, to keep it consistent as current behavior.
}
