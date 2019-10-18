import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import i18n from '@/i18n';
import App from '@/App';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(BootstrapVue);

describe('App.vue', () => {
  const store = new Vuex.Store({
    state: {
      UserStore: {},
      ApplicationStore: {},
    },
    getters: {
      UserStore: state => state.UserStore,
      ApplicationStore: state => state.ApplicationStore,
    },
  });

  let wrapper;
  let $route;

  beforeEach(() => {
    $route = {
      meta: { hideToolbar: true },
    };

    wrapper = shallowMount(App, {
      localVue,
      store,
      i18n,
      mocks: {
        $route,
      },
      stubs: {
        RouterLink: true,
        RouterView: true,
        Notifications: true,
      },
    });
  });

  afterAll(() => {
    wrapper = null;
  });

  it('App loaded', () => {
    expect(wrapper.name()).toBe('App');
    expect(wrapper).toMatchSnapshot();
  });

  it('Side nav toggle', () => {
    expect(wrapper.vm.toolbarToggled).toEqual(false);

    wrapper.vm.onToggle();

    expect(wrapper.vm.toolbarToggled).toEqual(true);
  });

  it('Access generated icons', () => {
    expect(wrapper.vm.accessIcon('')).toEqual('check_box_outline_blank');
    expect(wrapper.vm.accessIcon('test')).toEqual('test');
  });
});
