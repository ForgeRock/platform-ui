/**
 * Copyright 2023 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import DecisionFilter from './index';

describe('DecisionFilter View', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(DecisionFilter, {
      global: {
        mocks: {
          $t: (text) => (text),
        },
      },
      props: {
        filterData: {
          decisionFilter: {},
          enableCertDecisionFilter: true,
        },
      },
    });
  });

  it('initializes app-selection with values from value prop', () => {
    expect(findByTestId(wrapper, 'enable-cert-decision-filter'));
  });
});
