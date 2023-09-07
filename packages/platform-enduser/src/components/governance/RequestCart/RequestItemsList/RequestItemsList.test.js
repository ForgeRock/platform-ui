/**
 * Copyright 2023 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import RequestItemsList from './index';

describe('RequestItemsList', () => {
  const requestCartUsersStub = [
    {
      name: 'Barbara Jensen',
      username: 'bjensen',
      imgSrc: 'https://i.postimg.cc/hGrT2507/user-18-7d4c7a13.png',
    },
    {
      name: 'Pac Man',
      username: 'pman',
      imgSrc: 'http://google.com/pacman',
    },
  ];

  const roleRequestStub = [{
    itemType: 'role',
    name: 'Application Architecture Director',
  }];

  const entitlementRequestStub = [{
    itemType: 'entitlement',
    name: 'Application Architecture Director',
    description: 'Salesforce Permission Set',
    imgSrc: 'url/to/img',
  }];

  const stubProps = {
    global: {
      plugins: [i18n],
    },
    props: {
      requestItems: entitlementRequestStub,
    },
  };

  const setup = (props) => (mount(RequestItemsList, {
    ...stubProps,
    ...props,
  }));

  describe('@Component Tests', () => {
    it('request item delete event emits "remove-requested-item" event', () => {
      const wrapper = setup({
        props: {
          requestItems: requestCartUsersStub,
        },
      });
      const removeRequestedButton = findByTestId(wrapper, 'remove-requested-item-button');
      removeRequestedButton.trigger('click');
      expect(wrapper.emitted('remove-requested-item')).toBeTruthy();
    });

    it('hides the roles icon if request items "itemType" property is not equal to "role"', () => {
      const wrapper = setup();
      const roleIcon = findByTestId(wrapper, 'role-icon');
      expect(roleIcon.exists()).toBeFalsy();
    });

    it('shows the roles icon if request items "itemType" property is equal to "role" and context is "accessItem"', () => {
      const wrapper = setup({
        props: {
          requestItems: roleRequestStub,
          context: 'accessItem',
        },
      });
      const roleIcon = findByTestId(wrapper, 'role-icon');
      expect(roleIcon.exists()).toBeTruthy();
    });

    it('displays the delete icon if the "showDeleteButton" prop is true', async () => {
      const wrapper = setup();
      const removeUserButton = findByTestId(wrapper, 'remove-requested-item-button');
      expect(removeUserButton.exists()).toBeTruthy();
    });

    it('hides the delete icon if the "showDeleteButton" prop is false', async () => {
      const wrapper = setup();
      await wrapper.setProps({
        showDeleteButton: false,
      });
      const removeUserButton = findByTestId(wrapper, 'remove-requested-item-button');
      expect(removeUserButton.exists()).toBeFalsy();
    });

    it('hides the description container if the request item does not have the "description" property', () => {
      const wrapper = setup({
        props: {
          requestItems: roleRequestStub,
        },
      });
      const descriptionContainer = findByTestId(wrapper, 'description-container');
      expect(descriptionContainer.exists()).toBeFalsy();
    });

    it('shows the description container if the request item has the "description" property and context is "accessItem"', () => {
      const wrapper = setup({
        props: {
          requestItems: entitlementRequestStub,
          context: 'accessItem',
        },
      });
      const descriptionContainer = findByTestId(wrapper, 'description-container');
      expect(descriptionContainer.exists()).toBeTruthy();
    });

    it('displays the "Requested Access" empty state container when there are no request access items and context is "accessItem"', () => {
      const wrapper = setup({
        props: {
          requestItems: [],
          context: 'accessItem',
        },
      });
      const emptyRequestItemContainer = findByTestId(wrapper, 'empty-request-items-container');
      expect(emptyRequestItemContainer.exists()).toBeTruthy();
    });

    it('hides the "Requested Access" empty state container when there are request access items', () => {
      const wrapper = setup();
      const emptyRequestItemContainer = findByTestId(wrapper, 'empty-request-items-container');
      expect(emptyRequestItemContainer.exists()).toBeFalsy();
      const requestItemsContainer = findByTestId(wrapper, 'request-item-list');
      expect(requestItemsContainer.exists()).toBeTruthy();
    });

    it('emits the "requested-item-click" event when an access list item is clicked', () => {
      const wrapper = setup({
        props: {
          requestItems: entitlementRequestStub,
          frHover: true,
        },
      });
      const requestItemList = findByTestId(wrapper, 'request-item-list');
      requestItemList.trigger('click');
      expect(wrapper.emitted('requested-item-click')).toBeTruthy();
    });
  });
});
