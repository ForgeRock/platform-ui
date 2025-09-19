/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
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

  return {
    displayNotification: Notifications.displayNotification,
    showErrorMessage: Notifications.showErrorMessage,
  };
}
