/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByRole, findByTestId, findAllByTestId } from './testHelpers';
import FrCheckbox from '../components/Field/Checkbox';
import FrAccordion from '../components/Accordion';

describe('testHelpers', () => {
  describe('findByTestId', () => {
    describe('should throw error', () => {
      describe('when wrapper is falsy', () => {
        const testCases = [
          ['given false', false],
          ['given zero', 0],
          ['given empty string', ''],
          ['given null', null],
          ['given undefined', undefined],
        ];
        it.each(testCases)('%s', (name, invalidWrapper) => {
          expect(() => findByTestId(invalidWrapper, 'given_test_id')).toThrow(Error('Please provide a wrapper'));
        });
      });

      describe('when testId is not a string', () => {
        const stubWrapper = mount(FrCheckbox, {
          props: {
            name: 'stub-name',
          },
        });
        const testCases = [
          ['given false', false],
          ['given zero', 0],
          ['given null', null],
          ['given NaN', NaN],
          ['given undefined', undefined],
        ];
        it.each(testCases)('%s', (name, testid) => {
          expect(() => findByTestId(stubWrapper, testid)).toThrow(Error('Please provide a valid data-testid'));
        });
      });
    });

    describe('should return element', () => {
      it('when given valid testId', () => {
        const wrapper = mount(FrCheckbox, {
          props: {
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

  describe('testHelpers', () => {
    describe('findAllByTestId', () => {
      describe('should throw error', () => {
        describe('when wrapper is falsy', () => {
          const testCases = [
            ['given false', false],
            ['given zero', 0],
            ['given empty string', ''],
            ['given null', null],
            ['given undefined', undefined],
          ];
          it.each(testCases)('%s', (name, invalidWrapper) => {
            expect(() => findAllByTestId(invalidWrapper, 'given_test_id')).toThrow(Error('Please provide a wrapper'));
          });
        });

        describe('when testId is not a string', () => {
          const stubWrapper = mount(FrAccordion, {
            global: {
              directives: {
                'b-toggle': jest.mock(),
              },
            },
            props: {
              accordionGroup: 'default',
              items: [
                { open$: false },
                { open$: false },
                { open$: false },
              ],
            },
          });
          const testCases = [
            ['given false', false],
            ['given zero', 0],
            ['given null', null],
            ['given NaN', NaN],
            ['given undefined', undefined],
          ];
          it.each(testCases)('%s', (name, testid) => {
            expect(() => findAllByTestId(stubWrapper, testid)).toThrow(Error('Please provide a valid data-testid'));
          });
        });
      });

      describe('should return element', () => {
        it('when given valid testId', () => {
          const wrapper = mount(FrAccordion, {
            global: {
              directives: {
                'b-toggle': jest.mock(),
              },
            },
            props: {
              accordionGroup: 'default',
              items: [
                { open$: false },
                { open$: false },
                { open$: false },
              ],
            },
          });

          const accordionItem = findAllByTestId(wrapper, 'accordion-item-wrapper');
          expect(accordionItem.length).toBe(3);
        });
      });
    });
  });

  describe('findByRole', () => {
    describe('should throw error', () => {
      describe('when wrapper is falsy', () => {
        const testCases = [
          ['given false', false],
          ['given zero', 0],
          ['given empty string', ''],
          ['given null', null],
          ['given undefined', undefined],
        ];
        it.each(testCases)('%s', (name, invalidWrapper) => {
          expect(() => findByRole(invalidWrapper, 'given_role')).toThrow(Error('Please provide a wrapper'));
        });
      });

      describe('when role is not a string', () => {
        const stubWrapper = mount(FrCheckbox, {
          props: {
            name: 'stub-name',
          },
        });
        const testCases = [
          ['given false', false],
          ['given zero', 0],
          ['given null', null],
          ['given NaN', NaN],
          ['given undefined', undefined],
        ];
        it.each(testCases)('%s', (name, role) => {
          expect(() => findByRole(stubWrapper, role)).toThrow(Error('Please provide a valid role'));
        });
      });
    });

    describe('should return element', () => {
      it('when given valid role', () => {
        const wrapper = mount(FrCheckbox, {
          props: {
            name: 'stub-name',
          },
        });

        const checkboxInput = findByRole(wrapper, 'checkbox');
        expect(checkboxInput.exists()).toBe(true);
        expect(checkboxInput.element.name).toBe('stub-name');
      });
    });
  });
});
