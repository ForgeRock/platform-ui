/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
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
        roleDetails: {
          role: {
            name: 'test role',
            description: 'test description',
          },
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
    const owner = findByTestId(wrapper, 'user-info');
    expect(owner.text()).toContain('owner username');
  });

  it('sets aria-label combining subtitle and role name', () => {
    const modal = wrapper.findComponent({ name: 'BModal' });
    expect(modal.props('ariaLabel')).toBe('governance.certificationTask.roleDetails: test role');
  });

  it('uses fallback label when role has no name', async () => {
    await wrapper.setProps({ roleDetails: { role: {} } });
    const modal = wrapper.findComponent({ name: 'BModal' });
    expect(modal.props('ariaLabel')).toBe('governance.certificationTask.roleDetails');
  });

  describe('multi-value roleOwner', () => {
    const fourOwners = [
      { userName: 'owner1', givenName: 'First', sn: 'Owner' },
      { userName: 'owner2', givenName: 'Second', sn: 'Owner' },
      { userName: 'owner3', givenName: 'Third', sn: 'Owner' },
      { userName: 'owner4', givenName: 'Fourth', sn: 'Owner' },
    ];

    it('shows all owners when roleOwner has multiple entries', async () => {
      await wrapper.setProps({
        roleDetails: {
          role: { name: 'test role' },
          roleOwner: [
            { userName: 'owner1', givenName: 'First', sn: 'Owner' },
            { userName: 'owner2', givenName: 'Second', sn: 'Owner' },
          ],
        },
      });
      const owners = wrapper.findAll('[data-testid="user-info"]');
      expect(owners).toHaveLength(2);
      expect(owners[0].text()).toContain('owner1');
      expect(owners[1].text()).toContain('owner2');
    });

    it('shows at most 3 owners with a show more control when there are more than 3', async () => {
      await wrapper.setProps({
        roleDetails: {
          role: { name: 'test role' },
          roleOwner: fourOwners,
        },
      });
      await flushPromises();

      const owners = wrapper.findAll('[data-testid="user-info"]');
      expect(owners).toHaveLength(3);
      expect(owners[0].text()).toContain('owner1');
      expect(owners[2].text()).toContain('owner3');

      const collapse = wrapper.find('.collapse');
      expect(collapse.exists()).toBe(true);
      expect(collapse.classes()).not.toContain('show');

      const showMoreButton = findByTestId(wrapper, 'show-more-button');
      expect(showMoreButton.text()).toContain('common.showMore');

      await showMoreButton.trigger('click');
      await flushPromises();

      expect(wrapper.find('.collapse').classes()).toContain('show');
      expect(wrapper.text()).toContain('owner4');
      expect(findByTestId(wrapper, 'show-more-button').text()).toContain('common.hideMore');
    });

    it('does not show a show more control when there are exactly 3 owners', async () => {
      await wrapper.setProps({
        roleDetails: {
          role: { name: 'test role' },
          roleOwner: fourOwners.slice(0, 3),
        },
      });

      expect(wrapper.findAll('[data-testid="user-info"]')).toHaveLength(3);
      expect(findByTestId(wrapper, 'show-more-button').exists()).toBe(false);
    });

    it('shows a single owner when roleOwner is a legacy scalar object', async () => {
      await wrapper.setProps({
        roleDetails: {
          role: { name: 'test role' },
          roleOwner: { userName: 'legacyOwner', givenName: 'Legacy', sn: 'Owner' },
        },
      });
      const owners = wrapper.findAll('[data-testid="user-info"]');
      expect(owners).toHaveLength(1);
      expect(owners[0].text()).toContain('legacyOwner');
    });

    it('shows blank value indicator when roleOwner is an empty object', async () => {
      await wrapper.setProps({
        roleDetails: {
          role: { name: 'test role' },
          roleOwner: {},
        },
      });
      const owners = wrapper.findAll('[data-testid="user-info"]');
      expect(owners).toHaveLength(0);
      expect(wrapper.text()).toContain('--');
    });

    it('shows blank value indicator when roleOwner is missing', async () => {
      await wrapper.setProps({
        roleDetails: {
          role: { name: 'test role' },
        },
      });
      const owners = wrapper.findAll('[data-testid="user-info"]');
      expect(owners).toHaveLength(0);
      expect(wrapper.text()).toContain('--');
    });
  });
});
