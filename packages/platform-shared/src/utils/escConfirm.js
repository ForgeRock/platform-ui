/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Factory that creates the three standard Esc-confirmation functions for complex modals.
 * Intercepts the BModal @hide event when triggered by Esc, shows a discard-confirmation dialog,
 * and handles the confirm/cancel responses.
 *
 * @param {string} modalId - The id of the parent BModal
 * @param {object} bvModal - The bvModal instance (this.$bvModal in Options API, or a proxy object from the escConfirm composable)
 * @param {Function} [onConfirm] - Optional callback invoked before the parent modal is hidden on confirm (e.g. to reset local state)
 * @returns {{ handleEscHide: Function, confirmDiscard: Function, escConfirmId: string }}
 */
export default function createEscConfirm(modalId, bvModal, onConfirm) {
  const escConfirmId = `${modalId}-esc-confirm`;

  /**
   * Intercepts BModal hide events and shows the discard confirmation modal when Esc is pressed
   * @param {object} bvEvent bootstrap-vue hide event
   */
  function handleEscHide(bvEvent) {
    if (bvEvent.trigger === 'esc') {
      bvEvent.preventDefault();
      bvModal.show(escConfirmId);
    }
  }

  /**
   * Hides the discard confirmation modal, calls the optional onConfirm callback, and closes the parent modal
   */
  function confirmDiscard() {
    bvModal.hide(escConfirmId);
    if (onConfirm) onConfirm();
    bvModal.hide(modalId);
  }

  return {
    handleEscHide, confirmDiscard, escConfirmId,
  };
}
