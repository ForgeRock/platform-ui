/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as clipboard from 'clipboard-polyfill/text';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';

/**
 * Copy field value to clipboard
 *
 * @param {String} payload string to copy
 */
export function copyValueToClipboard(payload) {
  clipboard.writeText(payload).then(() => {
    displayNotification('success', i18n.global.t('common.copySuccess'));
  }, (error) => {
    showErrorMessage(error, i18n.global.t('common.copyFail'));
  });
}

/**
 * Strips HTML tags from a message and copies it to the clipboard
 *
 * @param {String} payload string to copy
 */
export function stripHtmlElementsAndCopyToClipboard(payload) {
  const tempDomElement = new DOMParser().parseFromString(payload, 'text/html');
  copyValueToClipboard(tempDomElement.body.textContent || '');
}
