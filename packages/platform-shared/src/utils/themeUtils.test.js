/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  setUniqueThemeName,
} from './themeUtils';

describe('themeUtil', () => {
  it('sets a unique theme id with setUniqueThemeName', () => {
    const themeData = {
      _id: '123-456-789',
      name: 'TestTheme',
      backgroundColor: '#FFFFFF',
      isDefault: false,
      journeyFooterScriptTag: '',
    };
    const themeRealm = {
      realm: {
        testRealm: [
          {
            _id: '123-456-790',
            name: 'TestTheme',
            backgroundColor: '#FFFFFF',
            isDefault: false,
            journeyFooterScriptTag: '',
          },
          {
            _id: '987-654-321',
            name: 'AnotherTheme',
            backgroundColor: '#000000',
            isDefault: true,
            journeyFooterScriptTag: '',
          },
        ],
      },
    };
    setUniqueThemeName(themeData, themeRealm, 'testRealm');
    expect(themeData.name).toBe('TestTheme(2)');
  });
});
