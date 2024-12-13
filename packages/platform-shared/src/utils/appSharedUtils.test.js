/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getApplicationDisplayName, getApplicationLogo, setApplicationsTemplates } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { createPinia, setActivePinia } from 'pinia';
import { getApplicationTemplateList } from '@forgerock/platform-shared/src/api/CdnApi';

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn(),
  getAppTemplatesByType: jest.fn(),
}));
let mockSetApplication;
describe('AppSharedUtils', () => {
  const mockTemplates = {
    consumer: {
      Bookmark: {
        '1_0-bookmark': { id: 'bookmark', displayName: 'bookmark', image: 'bookmark.png' },
      },
      web: {
        '1_0-web': { id: 'web', displayName: 'Web Application', image: 'web.png' },
      },
    },
  };

  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);
    getApplicationTemplateList.mockResolvedValue(mockTemplates);
    mockSetApplication = jest.fn();
    jest.clearAllMocks();
  });

  describe('getApplicationDisplayName', () => {
    it('should return the displayName from the template when application.templateName is defined and template is loaded', () => {
      const application = { templateName: 'web', templateVersion: '1.0' };
      setApplicationsTemplates({
        web: {
          '1.0': { id: 'web', displayName: 'Web Application', image: 'web.png' },
        },
      });
      const mockDisplayName = 'Web Application';
      const result = getApplicationDisplayName(application);
      expect(result).toBe(mockDisplayName);
      expect(mockSetApplication).not.toHaveBeenCalled();
    });

    it('should return application.name when application.templateName is not defined', () => {
      const application = { name: 'Fallback Application' };

      const result = getApplicationDisplayName(application);

      expect(result).toBe(application.name);
      expect(mockSetApplication).not.toHaveBeenCalled();
    });

    it('should handle cases where application is missing both templateName and name', () => {
      const application = {};

      const result = getApplicationDisplayName(application);

      expect(result).toBeUndefined();
      expect(mockSetApplication).not.toHaveBeenCalled();
    });
  });

  describe('getApplicationLogo', () => {
    it('should return the logo image from the template when application.templateName is defined and template is loaded', () => {
      const application = { templateName: 'web', templateVersion: '1.0' };
      setApplicationsTemplates({
        web: {
          '1.0': { id: 'web', displayName: 'Web Application', image: 'web.png' },
        },
      });
      const mockDisplayName = 'https://cdn.forgerock.com/platform/app-templates/images/web.png';
      const result = getApplicationLogo(application);
      expect(result).toBe(mockDisplayName);
      expect(mockSetApplication).not.toHaveBeenCalled();
    });
  });
});
