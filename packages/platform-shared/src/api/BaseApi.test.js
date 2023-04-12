/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import axios from 'axios';
import store from '../store';
import { generateIgaApi } from './BaseApi';

jest.mock('axios');

describe('BaseApi', () => {
  describe('generateIgaApi', () => {
    const requestDetails = {
      baseURL: store.state.SharedStore.igaApiUrl,
      headers: {},
    };
    const requestOverride = {
      header: 'testHeader',
    };
    it('Should run axios.create with the requested details', () => {
      axios.create = jest.fn();
      generateIgaApi();
      expect(axios.create).toBeCalledWith(requestDetails);
    });
    it('Should run axios.create with the requested details adding the requestOverride param', () => {
      axios.create = jest.fn();
      const expectedValue = {
        ...requestDetails,
        ...requestOverride,
      };
      generateIgaApi(requestOverride);
      expect(axios.create).toBeCalledWith(expectedValue);
    });
  });
});
