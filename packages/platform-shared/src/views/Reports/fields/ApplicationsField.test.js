/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import ApplicationsField from './ApplicationsField';
import { getSchemaStub } from '../RunReportStubs';

describe('Applications Field for running reports', () => {
  function setup(props) {
    return mount(ApplicationsField, {
      i18n,
      propsData: {
        ...props,
        relationshipProperty: getSchemaStub.data.properties.applications,
      },
    });
  }

  let wrapper;

  describe('@component', () => {
    it('emits "applications-update" when the FrField input updated', async () => {
      wrapper = setup();

      const applicationsField = findByTestId(wrapper, 'fr-field-applications');
      await applicationsField.trigger('click');

      const firstApplicationsFieldOption = applicationsField.findAll('li').at(0).find('span');
      await firstApplicationsFieldOption.trigger('click');

      expect(wrapper.emitted('applications-update')[0]).toEqual([['All applications']]);
    });

    it('reveals the all-applications-field if the showSpecificApplications prop is true', async () => {
      wrapper = setup();

      const collapseWrapper = findByTestId(wrapper, 'all-applications-field');
      expect(collapseWrapper.classes()).not.toContain('show');

      const applicationsField = findByTestId(wrapper, 'fr-field-applications');
      await applicationsField.trigger('click');

      const specificApplicationsFieldOption = applicationsField.findAll('li').at(3).find('span');
      await specificApplicationsFieldOption.trigger('click');

      expect(wrapper.vm._setupProxy.showSpecificApplications).toEqual(true);
      expect(collapseWrapper.isVisible()).toBe(true);
    });
  });
});
