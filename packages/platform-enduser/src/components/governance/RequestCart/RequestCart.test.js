/**
 * Copyright 2023 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import getPriorityImageSrc from '@/components/utils/governance/AccessRequestUtils';
import i18n from '@/i18n';
import RequestCart from './index';

jest.mock('@/components/utils/governance/AccessRequestUtils');

describe('RequestCart', () => {
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

  const requestCartItemsStub = [{
    itemType: 'entitlement',
    name: 'Application Architecture Director',
    description: 'Salesforce Permission Set',
    imgSrc: 'url/to/img',
  }];

  const stubProps = {
    i18n,
    propsData: {
      requestCartUsers: [{
        name: 'Barbara Jensen',
        username: 'bjensen',
        imgSrc: 'https://i.postimg.cc/hGrT2507/user-18-7d4c7a13.png',
      }],
    },
  };

  const setup = (props) => (mount(RequestCart, {
    ...stubProps,
    ...props,
  }));

  beforeEach(() => {
    getPriorityImageSrc.mockClear();
  });

  describe('@Component Tests', () => {
    it('submit button is disabled if no requested items present', () => {
      const wrapper = setup();
      const submitButton = findByTestId(wrapper, 'submit-request-button');
      expect(submitButton.element.disabled).toBeTruthy();
    });

    it('submit button emits "remove-requested-user" event', () => {
      const wrapper = setup({
        propsData: {
          requestCartUsers: requestCartUsersStub,
          requestCartItems: requestCartItemsStub,
        },
      });
      const submitButton = findByTestId(wrapper, 'submit-request-button');
      submitButton.trigger('click');
      expect(wrapper.emitted('submit-new-request')).toBeTruthy();
    });
  });
});
