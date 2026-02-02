/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as Notifications from '@forgerock/platform-shared/src/utils/notification';

jest.mock('@forgerock/platform-shared/src/utils/notification');

// eslint-disable-next-line import/prefer-default-export
export function mockNotification() {
  Notifications.displayNotification = jest.fn();
  Notifications.showErrorMessage = jest.fn();
  Notifications.getApiErrorMessage = jest.fn((error, fallback) => {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.response?.data?.error) {
      return error.response.data.error;
    }
    if (error?.response?.data && typeof error.response.data === 'string' && error.response.data.trim().length > 0) {
      return error.response.data.trim();
    }
    return fallback;
  });

  return {
    displayNotification: Notifications.displayNotification,
    showErrorMessage: Notifications.showErrorMessage,
    getApiErrorMessage: Notifications.getApiErrorMessage,
  };
}
