import { first } from 'lodash';
import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import VeeValidate from 'vee-validate';
import EditKBA from '@/components/profile/EditKBA';
import i18n from '@/i18n';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(VeeValidate);

describe('EditKBA.vue', () => {
  beforeEach(() => {
    jest.spyOn(EditKBA, 'mounted')
      .mockImplementation(() => { });
  });


  it('AccountSecurity page loaded', () => {
    const wrapper = shallowMount(EditKBA, {
      localVue,
      i18n,
    });
    wrapper.vm.errors = { has: jest.fn() };

    expect(wrapper.name()).toBe('EditKBA');
    expect(wrapper).toMatchSnapshot();
  });

  describe('#generatePatch', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallowMount(EditKBA, {
        localVue,
        i18n,
      });

      wrapper.vm.errors = { has: jest.fn() };
    });

    it('should correctly generate patches for custom questions', () => {
      wrapper.setData({ selected: [{ custom: 'test', answer: 'test answer' }] });

      const patch = wrapper.vm.generatePatch();

      expect(typeof patch).toBe('object');
      expect(patch.length).toBe(1);
      expect(typeof first(patch)).toBe('object');
      expect(first(patch)).toHaveProperty('value');
      expect(first(patch).value).toEqual([{ answer: 'test answer', customQuestion: 'test' }]);
    });

    it('should correctly generate patches for provided questions', () => {
      wrapper.setData({ selected: [{ selected: 'test', answer: 'test answer' }] });

      const patch = wrapper.vm.generatePatch();

      expect(typeof patch).toBe('object');
      expect(patch.length).toBe(1);
      expect(typeof first(patch)).toBe('object');
      expect(first(patch)).toHaveProperty('value');
      expect(first(patch).value).toEqual([{ answer: 'test answer', questionId: 'test' }]);
    });
  });
});
