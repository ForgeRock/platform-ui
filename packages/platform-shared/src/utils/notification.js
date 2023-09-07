/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { notify } from '@kyvg/vue3-notification';
import { has } from 'lodash';
import { getTranslation } from './translations';

export function displayNotification(notificationType, message) {
  let type = notificationType;

  if (type === 'error') {
    type = 'danger';
  }

  notify({
    type,
    text: getTranslation(message),
  });
}

export function showErrorMessage(error, defaultMessage) {
  let errorMessage = defaultMessage;

  if (has(error, 'response.data.message') && error.response.data.message.length > 0) {
    // error message may have html encoding for example &#39; aka single quote
    const errorTextElement = document.createElement('div');
    errorTextElement.innerHTML = error.response.data.message;
    errorMessage = errorTextElement.innerText;
  }

  displayNotification('danger', getTranslation(errorMessage));
}
