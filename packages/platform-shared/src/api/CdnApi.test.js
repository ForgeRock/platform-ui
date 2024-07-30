/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
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
});
