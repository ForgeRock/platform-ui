/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { first } from 'lodash';
import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import EditKBA from '@/components/profile/EditKBA';
import i18n from '@/i18n';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('EditKBA.vue', () => {
  let wrapper;
  beforeEach(() => {
    jest.spyOn(EditKBA, 'mounted')
      .mockImplementation(() => { });
  });

  afterEach(() => {
    wrapper = null;
  });

  it('AccountSecurity page loaded', () => {
    wrapper = shallowMount(EditKBA, {
      localVue,
      i18n,
    });

    expect(wrapper.name()).toBe('EditKBA');
    expect(wrapper).toMatchSnapshot();
  });

  describe('#generatePatch', () => {
    beforeEach(() => {
      wrapper = shallowMount(EditKBA, {
        localVue,
        i18n,
      });
    });

    it('should correctly generate patches for custom questions', () => {
      wrapper.setData({ kbaChoices: [{ customQuestion: { value: 'test' }, answer: { value: 'test answer' } }] });

      const patch = wrapper.vm.generatePatch();

      expect(typeof patch).toBe('object');
      expect(patch.length).toBe(1);
      expect(typeof first(patch)).toBe('object');
      expect(first(patch)).toHaveProperty('value');
      expect(first(patch).value).toEqual([{ answer: 'test answer', customQuestion: 'test' }]);
    });

    it('should correctly generate patches for provided questions', () => {
      wrapper.setData({ kbaChoices: [{ selected: { value: 'test' }, answer: { value: 'test answer' }, customQuestion: { value: '' } }] });

      const patch = wrapper.vm.generatePatch();

      expect(typeof patch).toBe('object');
      expect(patch.length).toBe(1);
      expect(typeof first(patch)).toBe('object');
      expect(first(patch)).toHaveProperty('value');
      expect(first(patch).value).toEqual([{ answer: 'test answer', questionId: 'test' }]);
    });
  });
});
