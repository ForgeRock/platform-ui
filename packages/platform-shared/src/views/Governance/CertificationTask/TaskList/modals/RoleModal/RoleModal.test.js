/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import RoleModal from './RoleModal';

describe('AccountModal', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(RoleModal, {
      global: {
        mocks: {
          $t: (t) => t,
        },
      },
      props: {
        isTesting: true,
        role: {
          name: 'test role',
          description: 'test description',
          glossary: {
            idx: {
              '/role': {
                test1: 'glossary1',
              },
            },
          },
          roleOwner: [{
            userName: 'owner username',
            givenName: 'testFirst',
            sn: 'testLast',
          }],
        },
        glossarySchema: [
          {
            displayName: 'test 1',
            name: 'test1',
            type: 'string',
          },
        ],
      },
    });
  });

  it('should show role name in title', () => {
    const header = findByTestId(wrapper, 'role-modal-header');
    expect(header.text()).toContain('test role');
  });

  it('should show role description', () => {
    const description = findByTestId(wrapper, 'role-description');
    expect(description.text()).toContain('test description');
  });

  it('should show glossary attributes', async () => {
    const glossary = findByTestId(wrapper, 'role-glossary');
    expect(glossary.text()).toContain('test 1');
    expect(glossary.text()).toContain('glossary1');
  });

  it('should show role owner', async () => {
    const owner = findByTestId(wrapper, 'role-owner');
    expect(owner.text()).toContain('owner username');
  });
});
