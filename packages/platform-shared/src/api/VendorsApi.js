/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import axios from 'axios';
import store from '../store';

/**
 * Fetches all google fonts
 *
 * @param {string} sort 'alpha', 'date', 'popularity', 'style', 'trending'
 * @returns {Promise} Returns all google fonts
 */

// eslint-disable-next-line import/prefer-default-export
export function getGoogleFonts(sort = 'popularity') {
  const url = 'https://www.googleapis.com/webfonts/v1/webfonts';
  const apiKey = store.state.SharedStore.googleFontsApiKey;
  return axios.get(`${url}?key=${apiKey}&sort=${sort}`);
}
