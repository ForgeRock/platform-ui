/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
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
// eslint-disable-next-line import/prefer-default-export
export function copyValueToClipboard(payload) {
  clipboard.writeText(payload).then(() => {
    displayNotification('success', i18n.global.t('common.copySuccess'));
  }, (error) => {
    showErrorMessage(error, i18n.global.t('common.copyFail'));
  });
}
