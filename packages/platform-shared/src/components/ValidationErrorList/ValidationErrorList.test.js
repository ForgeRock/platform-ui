/**
 * Copyright (c) 2019-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByRole, findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import ValidationError from './index';
import i18n from '@/i18n';

describe('ValidationErrorList', () => {
  function setup(props) {
    return mount(ValidationError, {
      global: {
        plugins: [i18n],
      },
      props: {
        fieldName: 'stub-name',
        ...props,
      },
    });
  }

  describe('given no errors', () => {
    it('should not display errors', () => {
      const wrapper = setup();
      const errorWrapper = findByRole(wrapper, 'alert');
      const firstErrorParagraph = findByTestId(errorWrapper, 'stub-name-validation-error-0');

      expect(firstErrorParagraph.exists()).toBeFalsy();
    });
  });

  describe('given multiple errors', () => {
    // Note: id is required for accessibility. To enable inputs to reference this with aria-describedby
    it('should all have error id', () => {
      const wrapper = setup({ validatorErrors: ['first error', 'second error'] });

      const errorWrapper = findByRole(wrapper, 'alert');
      const firstErrorParagraph = findByTestId(errorWrapper, 'stub-name-validation-error-0');
      expect(firstErrorParagraph.attributes('id')).toBe('stub-name0-error');
      expect(firstErrorParagraph.text()).toBe('first error');

      const secondErrorParagraph = findByTestId(errorWrapper, 'stub-name-validation-error-1');
      expect(secondErrorParagraph.attributes('id')).toBe('stub-name1-error');
      expect(secondErrorParagraph.text()).toBe('second error');
    });
  });
});
