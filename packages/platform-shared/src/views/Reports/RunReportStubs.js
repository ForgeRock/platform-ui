/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export const getSchemaStub = {
  data: {
    properties: {
      applications: {
        id: '',
        key: 'Applications',
        properties: {},
        description: 'Applications',
        items: {
          id: '',
          resourceCollection: [
            {
              label: 'Application',
              notify: true,
              path: 'managed/alpha_application',
              query: {
                fields: ['name'],
              },
            },
          ],
        },
      },
      members: {
        id: '',
        key: 'Application Members',
        properties: {},
        description: 'Application Members',
        items: {
          id: '',
          resourceCollection: [
            {
              label: 'User',
              notify: true,
              path: 'managed/alpha_user',
              query: {
                fields: ['userName'],
              },
            },
          ],
        },
      },
    },
  },
};

export const getConfigStub = {
  data: {
    objects: [
      { name: 'alpha_user' },
      { name: 'alpha_application' },
      { name: 'alpha_organization' },
      { name: 'alpha_role' },
    ],
  },
};

export const getManagedResourceListStub = {
  data: {
    result: [
      { name: 'prop1' },
      { name: 'prop2' },
      { name: 'prop3' },
    ],
  },
};
