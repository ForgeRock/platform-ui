import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import ListGroup from '@/components/utils/ListGroup';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('ListGroup.vue', () => {
  it('List Group component loaded', () => {
    const wrapper = shallowMount(ListGroup, { localVue });

    expect(wrapper.name()).toBe('ListGroup');
    expect(wrapper).toMatchSnapshot();
  });
});
