/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as CdnApi from './CdnApi';

const get = jest.fn();
BaseApi.generateCdnApi = jest.fn(() => ({ get }));

describe('CdnApi', () => {
  it('getApplicationTemplatesIndexFile is called with correct parameters', async () => {
    await CdnApi.getApplicationTemplatesIndexFile();

    expect(BaseApi.generateCdnApi).toHaveBeenCalledTimes(1);
    expect(get).toBeCalledWith('/index.json');
  });

  it('getApplicationTemplate is called with correct parameters', async () => {
    const templatePath = 'templates/AppTemplates/consumer/Bookmark/1.0-bookmark.json';
    await CdnApi.getApplicationTemplate(templatePath);

    expect(BaseApi.generateCdnApi).toHaveBeenCalledTimes(2);
    expect(get).toBeCalledWith('/templates/AppTemplates/consumer/Bookmark/1.0-bookmark.json');
  });

  describe('getApplicationTemplateList', () => {
    afterEach(() => {
      delete global.fetch;
      delete global.DecompressionStream;
      delete global.Response;
    });

    it('should fetch from CDN URL in standard deployments', async () => {
      BaseApi.getCdnBaseURL = jest.fn().mockReturnValue('https://cdn.forgerock.com/platform/app-templates/');
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      await expect(CdnApi.getApplicationTemplateList()).rejects.toThrow();
      expect(global.fetch).toHaveBeenCalledWith('https://cdn.forgerock.com/platform/app-templates/appTemplates.json.gz');
    });

    it('should fetch from local path when air-gapped', async () => {
      BaseApi.getCdnBaseURL = jest.fn().mockReturnValue('/app-templates/');
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      await expect(CdnApi.getApplicationTemplateList()).rejects.toThrow();
      expect(global.fetch).toHaveBeenCalledWith('/app-templates/appTemplates.json.gz');
    });

    it('should throw a translated error when fetch fails', async () => {
      BaseApi.getCdnBaseURL = jest.fn().mockReturnValue('https://cdn.forgerock.com/platform/app-templates/');
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      await expect(CdnApi.getApplicationTemplateList()).rejects.toThrow();
    });

    it('should throw when the response is not ok', async () => {
      BaseApi.getCdnBaseURL = jest.fn().mockReturnValue('https://cdn.forgerock.com/platform/app-templates/');
      global.fetch = jest.fn().mockResolvedValue({ ok: false, statusText: 'Not Found' });
      await expect(CdnApi.getApplicationTemplateList()).rejects.toThrow('applications.errorRetrievingApplicationTemplates: Not Found');
    });

    it('should decompress and parse the response on success', async () => {
      const templates = { AppTemplates: { bookmark: { id: 'bookmark' } } };
      global.DecompressionStream = jest.fn().mockImplementation(() => ({}));
      global.Response = jest.fn().mockImplementation(() => ({
        text: jest.fn().mockResolvedValue(JSON.stringify(templates)),
      }));
      BaseApi.getCdnBaseURL = jest.fn().mockReturnValue('https://cdn.forgerock.com/platform/app-templates/');
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        body: { pipeThrough: jest.fn().mockReturnValue('decompressed-stream') },
      });

      const result = await CdnApi.getApplicationTemplateList();

      expect(result).toEqual(templates.AppTemplates);
    });
  });
});
