/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import createEscConfirm from '../utils/escConfirm';
import useBvModal from './bvModal';

/**
 * Composable wrapper around createEscConfirm for use in <script setup> components.
 * For Options API components, use createEscConfirm directly from utils/escConfirm.
 *
 * @param {string} modalId - The id of the parent BModal
 * @param {Function} [onConfirm] - Optional callback invoked before the parent modal is hidden on confirm
 * @returns {{ handleEscHide: Function, confirmDiscard: Function, escConfirmId: string }}
 */
export default function useEscConfirm(modalId, onConfirm) {
  const { bvModal } = useBvModal();
  // Proxy defers .value access until call time, after onBeforeMount has set bvModal.value
  const bvModalProxy = {
    show: (...args) => bvModal.value.show(...args),
    hide: (...args) => bvModal.value.hide(...args),
  };
  return createEscConfirm(modalId, bvModalProxy, onConfirm);
}
