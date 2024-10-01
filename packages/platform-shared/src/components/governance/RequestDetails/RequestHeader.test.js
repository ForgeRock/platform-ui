/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { cloneDeep } from 'lodash';
import { mount } from '@vue/test-utils';
import RequestHeader from './RequestHeader';
import i18n from '@/i18n';

describe('RequestHeader', () => {
  let wrapper;

  function setup(props) {
    return mount(RequestHeader, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...props,
      },
    });
  }

  const item = {
    details: {
      requestedBy: 'test name',
      requestedFor: 'test2 name2',
      date: 'Aug 13, 2024',
    },
    rawData: {
      requestType: 'test',
    },
  };

  it('shows correct header text when all item details are present', () => {
    wrapper = setup({ item });

    expect(wrapper.text()).toBe('test namesubmitted this requestfor test2 name2on Aug 13, 2024');
  });

  it('shows correct header text when requested for is missing', () => {
    const itemCopy = cloneDeep(item);
    delete itemCopy.details.requestedFor;
    wrapper = setup({ item: itemCopy });

    expect(wrapper.text()).toBe('test namesubmitted this requeston Aug 13, 2024');
  });

  it('handles when the requester has id of SYSTEM', () => {
    const itemCopy = cloneDeep(item);
    itemCopy.details.requestedBy = 'System';
    wrapper = setup({ item: itemCopy });

    expect(wrapper.text()).toBe('Systemsubmitted this requestfor test2 name2on Aug 13, 2024');
  });
});
