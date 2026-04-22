/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, mount, flushPromises } from '@vue/test-utils';
import axios from 'axios';
import { findByRole, findComponentByTestId, findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as CertificationApi from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';
import * as NotificationTemplateApi from '@forgerock/platform-shared/src/api/governance/NotificationTemplateApi';
import * as CertificationUtils from '@/views/Governance/utils/certification';
import * as TemplateApi from '@/api/governance/TemplateApi';
import EditTemplate from './index';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/governance/CertificationApi');
jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');
jest.mock('axios');
mockValidation(['required', 'max', 'unique']);

describe('EditTemplate View', () => {
  let wrapper;
  CertificationApi.getCertificationTemplates = jest.fn().mockReturnValue(Promise.resolve({
    data: {
      result: [{ name: 'testName1' }],
    },
  }));

  TemplateApi.postTemplate = jest.fn().mockReturnValue(Promise.resolve({
    data: {
      result: [],
    },
  }));

  TemplateApi.updateTemplate = jest.fn().mockReturnValue(Promise.resolve({
    data: {
      result: [],
    },
  }));

  beforeEach(() => {
    setupTestPinia();
  });

  describe('tests of features with shallow mount', () => {
    CommonsApi.getResource.mockReturnValue(Promise.resolve({ data: {} }));
    CommonsApi.getIgaAutoIdConfig = jest.fn().mockImplementation(() => Promise.resolve({ data: {} }));
    CommonsApi.getFilterSchema.mockImplementation(() => Promise.resolve({ data: { result: [] } }));
    NotificationTemplateApi.getEmailNotificationTemplates = jest.fn().mockReturnValue(Promise.resolve({ data: { result: [{ _id: 'test/templateTest' }, { displayName: 'Display Name', _id: 'test/templateTest2' }] } }));
    TemplateApi.getDecisionCount = jest.fn().mockReturnValue(Promise.resolve({ data: { objects: [] } }));

    beforeEach(() => {
      wrapper = shallowMount(EditTemplate, {
        mixins: [NotificationMixin],
        global: {
          plugins: [i18n],
          mocks: {
            $router: { push: jest.fn() },
            $store: {
              state: {
                SharedStore: {
                  uiConfig: {},
                },
              },
            },
          },
        },
      });
    });

    it('ownerInfo return empty object if missing owner details', () => {
      expect(wrapper.vm.ownerInfo).toEqual({
        ownerName: '',
        ownerUsername: '',
      });
    });

    it('ownerInfo returns form data if present', () => {
      wrapper.vm.forms.FrDetailsForm = {
        ownerInfo: {
          givenName: 'testGivenName',
          sn: 'testSn',
          userName: 'testUserName',
        },
      };
      expect(wrapper.vm.ownerInfo).toEqual({
        ownerName: 'testGivenName testSn',
        ownerUsername: 'testUserName',
      });
    });

    it('show wizard is false if email templates are not loaded', async () => {
      wrapper.vm.emailTemplatesLoaded = false;
      await flushPromises();

      expect(wrapper.vm.showWizard).toBe(false);
      expect(findByTestId(wrapper, 'template-wizard').exists()).toBeFalsy();

      wrapper.vm.emailTemplatesLoaded = true;
      await flushPromises();

      expect(wrapper.vm.showWizard).toBe(true);
      expect(findByTestId(wrapper, 'template-wizard').exists()).toBeTruthy();
    });

    it('should load the email template list with the correct format', () => {
      expect(wrapper.vm.emailTemplateOptions).toStrictEqual([{ text: 'Display Name', value: 'emailTemplate/test/templateTest2' }, { text: 'Template Test', value: 'emailTemplate/test/templateTest' }]);
    });
  });

  describe('saveTemplate', () => {
    it('should route to the template list after saving the new template', async () => {
      const routerPushSpy = jest.spyOn(wrapper.vm.$router, 'push');
      wrapper.vm.saveTemplate();
      await wrapper.vm.$nextTick();
      expect(routerPushSpy).toHaveBeenCalledWith({
        name: 'Certification',
        params: {
          certificationTab: 'templates',
        },
      });
    });
    it('should call displayNotification with success and the right message', async () => {
      const displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
      wrapper.vm.saveTemplate();

      await wrapper.vm.$nextTick();
      expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'Template saved successfully');
    });

    it('should route to the template list after editing the template', async () => {
      wrapper.vm.existingTemplateId = 'templateId';
      const routerPushSpy = jest.spyOn(wrapper.vm.$router, 'push');
      wrapper.vm.saveTemplate();
      await wrapper.vm.$nextTick();
      expect(routerPushSpy).toHaveBeenCalledWith({
        name: 'Certification',
        params: {
          certificationTab: 'templates',
        },
      });
    });

    it('should toggle isSaving state correctly', async () => {
      expect(wrapper.vm.isSaving).toBe(false);
      const savePromise = wrapper.vm.saveTemplate();
      expect(wrapper.vm.isSaving).toBe(true);
      await savePromise;
      expect(wrapper.vm.isSaving).toBe(false);
    });
  });

  describe('tests of features with mount', () => {
    beforeEach(async () => {
      jest.useFakeTimers();
      wrapper = mount(EditTemplate, {
        global: {
          plugins: [i18n],
          mocks: {
            $store: {
              state: {
                SharedStore: {
                  uiConfig: {},
                },
              },
            },
          },
          stubs: {
            RouterLink: true,
            FrWhat: true,
            FrWhen: true,
            FrWho: true,
            FrNotifications: true,
            FrAdditionalOptions: true,
            FrSummaryStep: true,
            FrNavbar: true,
          },
        },
      });
      wrapper.vm.appsLoaded = true;
      wrapper.vm.emailTemplatesLoaded = true;
    });

    it('should validate correctly details step by default, button next is disabled', async () => {
      await flushPromises();
      const nextButton = findByTestId(wrapper, 'nextButton');
      expect(nextButton.attributes('disabled')).toBeDefined();
    });

    describe('with name value setted', () => {
      let inputName;
      let nextButton;

      beforeEach(async () => {
        inputName = findByTestId(wrapper, 'input-name');
        inputName.setValue('test');
        await flushPromises();

        nextButton = findByTestId(wrapper, 'nextButton');
      });

      it('should validate correctly details on name value changed, button next is enabled', async () => {
        expect(nextButton.attributes('disabled')).toBeUndefined();
        inputName.setValue('testName2');
        await flushPromises();
        expect(nextButton.attributes('disabled')).toBeUndefined();
      });

      it('should validate correctly details on name value changed, button next is disabled', async () => {
        expect(nextButton.attributes('disabled')).toBeUndefined();
        inputName.setValue('testName1');
        await flushPromises();
        expect(nextButton.attributes('disabled')).toBeDefined();
      });

      it('should validate correctly details on name value changed to empty, button next is disabled', async () => {
        expect(nextButton.attributes('disabled')).toBeUndefined();
        inputName.setValue('');
        await inputName.trigger('blur');
        await flushPromises();

        expect(nextButton.attributes('disabled')).toBeDefined();
        const nameValidationMessage = findByRole(wrapper, 'alert');
        const innerParagraph = nameValidationMessage.find('p');
        expect(innerParagraph.text()).toBe('Please provide a value');
      });
    });
  });

  describe('event based certs', () => {
    beforeEach(async () => {
      jest.useFakeTimers();

      axios.create = jest.fn().mockReturnValue({
        interceptors: {
          response: {
            use: jest.fn().mockReturnValue(false),
          },
        },
        get: jest.fn().mockResolvedValue({}),
        post: jest.fn().mockResolvedValueOnce({}),
      });
      wrapper = mount(EditTemplate, {
        global: {
          plugins: [i18n],
          mocks: {
            $store: {
              state: {
                SharedStore: {
                  uiConfig: {},
                },
              },
            },
          },
          stubs: {
            RouterLink: true,
            FrWhat: true,
            FrWhen: true,
            FrWho: true,
            FrNotifications: true,
            FrAdditionalOptions: true,
            FrSummaryStep: true,
            FrNavbar: true,
          },
        },
        props: {
          eventBased: true,
        },
      });
      wrapper.vm.appsLoaded = true;
      wrapper.vm.emailTemplatesLoaded = true;
    });

    it('calls to build form when eventCert prop is added', async () => {
      const utilSpy = jest.spyOn(CertificationUtils, 'getFormValuesFromTemplate');

      await wrapper.setProps({ eventCert: { certDetails: 'test' } });

      expect(utilSpy).toHaveBeenCalledWith('test', true);
    });

    it('emits save event when saving', async () => {
      await flushPromises();
      const formWizard = findComponentByTestId(wrapper, 'template-wizard');
      formWizard.vm.$emit('save');

      await flushPromises();

      expect(wrapper.emitted().save[0]).toBeTruthy();
    });
  });
});
