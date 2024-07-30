/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { resolveImage } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { getApplicationDisplayName, getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';

const logoMap = {
  template1: 'path/to/template1Icon.png',
};

describe('AppSharedUtils', () => {
  describe('getApplicationLogo', () => {
    it('should return application icon if it exists', () => {
      const application = {
        icon: 'path/to/applicationIcon.png',
        templateName: '',
      };
      const result = getApplicationLogo(application);
      expect(result).toBe(application.icon);
    });

    it('should return icon based on templateName if it exists in logoMap', () => {
      const application = {
        icon: '',
        templateName: 'template1',
      };
      const expectedImagePath = logoMap[application.templateName];
      const result = getApplicationLogo(application);
      expect(result).toBe(resolveImage(expectedImagePath));
    });

    it('should return empty string if no icon or templateName provided', () => {
      const application = {
        icon: '',
        templateName: null,
      };
      const result = getApplicationLogo(application);
      expect(result).toBe('');
    });
  });

  describe('getApplicationDisplayName', () => {
    it('should return displayName based on templateName if it exists in displayNameMap', () => {
      const application = {
        templateName: 'workday',
        name: 'Application 1',
      };
      const displayNameMap = {
        workday: 'Workday',
      };
      const result = getApplicationDisplayName(application);
      expect(result).toBe(displayNameMap[application.templateName]);
    });

    it('should return application name if templateName is not provided', () => {
      const application = {
        templateName: '',
        name: 'Application 2',
      };
      const result = getApplicationDisplayName(application);
      expect(result).toBe(application.name);
    });
  });
});
