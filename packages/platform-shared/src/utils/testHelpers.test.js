/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable indent */
import { mount } from '@vue/test-utils';
import { findByRole, findByTestId } from './testHelpers';
import FrCheckbox from '../components/Field/Checkbox';

describe('testHelpers', () => {
  describe('findByTestId', () => {
    describe('should throw error', () => {
      describe('when wrapper is falsy', () => {
        it.each`
          name                    | invalidWrapper
          ${'given false'}        | ${false}
          ${'given zero'}         | ${0}
          ${'given empty string'} | ${''}
          ${'given null'}         | ${null}
          ${'given undefined'}    | ${undefined}
          `('$name', ({ invalidWrapper }) => {
          expect(() => findByTestId(invalidWrapper, 'given_test_id')).toThrow(Error('Please provide a wrapper'));
        });
      });

      describe('when testId is not a string', () => {
        const stubWrapper = mount(FrCheckbox, {
          propsData: {
            name: 'stub-name',
          },
        });
        it.each`
          name                 | testid
          ${'given false'}     | ${false}
          ${'given zero'}      | ${0}
          ${'given null'}      | ${null}
          ${'given NaN'}       | ${NaN}
          ${'given undefined'} | ${undefined}
          `('$name', ({ testid }) => {
          expect(() => findByTestId(stubWrapper, testid)).toThrow(Error('Please provide a valid data-testid'));
        });
      });
    });

    describe('should return element', () => {
      it('when given valid testId', () => {
        const wrapper = mount(FrCheckbox, {
          propsData: {
            name: 'stub-name',
            testid: 'stub-test-id',
          },
        });

        const checkbox = findByTestId(wrapper, 'stub-test-id');
        expect(checkbox.exists()).toBe(true);
        expect(checkbox.element.name).toBe('stub-name');
      });
    });
  });

  describe('findByRole', () => {
    describe('should throw error', () => {
      describe('when wrapper is falsy', () => {
        it.each`
          name                    | invalidWrapper
          ${'given false'}        | ${false}
          ${'given zero'}         | ${0}
          ${'given empty string'} | ${''}
          ${'given null'}         | ${null}
          ${'given undefined'}    | ${undefined}
          `('$name', ({ invalidWrapper }) => {
          expect(() => findByRole(invalidWrapper, 'given_role')).toThrow(Error('Please provide a wrapper'));
        });
      });

      describe('when role is not a string', () => {
        const stubWrapper = mount(FrCheckbox, {
          propsData: {
            name: 'stub-name',
          },
        });
        it.each`
          name                 | role
          ${'given false'}     | ${false}
          ${'given zero'}      | ${0}
          ${'given null'}      | ${null}
          ${'given NaN'}       | ${NaN}
          ${'given undefined'} | ${undefined}
          `('$name', ({ role }) => {
          expect(() => findByRole(stubWrapper, role)).toThrow(Error('Please provide a valid role'));
        });
      });
    });

    describe('should return element', () => {
      it('when given valid role', () => {
        const wrapper = mount(FrCheckbox, {
          propsData: {
            name: 'stub-name',
          },
        });

        const checkboxInpur = findByRole(wrapper, 'checkbox');
        expect(checkboxInpur.exists()).toBe(true);
        expect(checkboxInpur.element.name).toBe('stub-name');
      });
    });
  });
});
