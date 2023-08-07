/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as BaseApi from '@forgerock/platform-shared/src/api/BaseApi';
import * as RiskConfigAPI from './RiskConfigAPI';

describe('Risk Config API', () => {
  it('Function to update risk config receives correct path and payload', async () => {
    let expectedPath;
    let expectedPayload;
    // Mock the function generateAutoAcessApi
    const generateAutoAccessApiSpy = jest
      .spyOn(BaseApi, 'generateAutoAccessApi')
      .mockImplementation(() => ({
        put: (path, payload) => {
          expectedPath = path;
          expectedPayload = payload;
          return Promise.resolve();
        },
      }));
    await RiskConfigAPI.saveRiskConfig({ processJSON: 'processJSON' });
    expect(generateAutoAccessApiSpy).toHaveBeenCalled();
    expect(expectedPath).toEqual('/v2/riskConfig/userConfig');
    expect(expectedPayload).toEqual({ processJSON: 'processJSON' });
  });
  it('Function to submit config changes to prev¡ew recieves an specific value', () => {
    let expectedPath;
    let expectedPayload;
    // Mock the function generateAutoAcessApi
    const generateAutoAccessApiSpy = jest
      .spyOn(BaseApi, 'generateAutoAccessApi')
      .mockImplementation(() => ({
        post: (path, payload) => {
          expectedPath = path;
          expectedPayload = payload;
          return Promise.resolve({ data: '' });
        },
      }));
    RiskConfigAPI.getConfigurationChangesPreview(
      { name: '', bucket: '' },
      { processJSON: 'processJSON' },
    );
    expect(generateAutoAccessApiSpy).toHaveBeenCalled();
    expect(expectedPath).toEqual('/processEvaluation/v2/preview');
    expect(expectedPayload).toEqual({
      bucket: '',
      filePath: '',
      numOfEvents: 10,
      processJSON: { 'active-user-config': { processJSON: 'processJSON' } },
    });
  });
});
