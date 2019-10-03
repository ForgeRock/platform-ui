import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import VeeValidate from 'vee-validate';
import i18n from '@/i18n';
import EditResource from '@/components/access/EditResource/index';

const localVue = createLocalVue();
localVue.use(VeeValidate);
localVue.use(BootstrapVue);

describe('EditResource.vue', () => {
  const $route = {
    path: '/test',
    meta: {},
    params: {
      resourceName: 'test',
      resourceType: 'test',
      resourceId: 'test',
    },
  };
  const v = new VeeValidate.Validator();

  let wrapper;

  beforeEach(() => {
    jest.spyOn(EditResource, 'mounted')
      .mockImplementation(() => { });

    wrapper = shallowMount(EditResource, {
      localVue,
      provide: () => ({
        $validator: v,
      }),
      i18n,
      stubs: {
        'router-link': true,
      },
      mocks: {
        $route,
      },
    });
  });

  afterEach(() => {
    wrapper.destroy();
  });

  it('EditResource page loaded', () => {
    expect(wrapper.name()).toBe('EditResource');
    expect(wrapper).toMatchSnapshot();
  });

  it('Format display data', () => {
    const schema = {
      icon: 'fa-test',
      order: ['country', 'userName', 'sn', 'email', 'contractor'],
      required: ['userName'],
      properties: {
        userName: {
          type: 'string',
          title: 'Username',
        },
        sn: {
          type: 'string',
          title: 'Last Name',
        },
        email: {
          type: 'string',
          title: 'Email',
        },
        contractor: {
          type: 'boolean',
          title: 'Contractor',
        },
        country: {
          type: 'string',
          title: 'Country',
        },
      },
    };

    const privilege = {
      UPDATE: {
        allowed: true,
        properties: ['userName', 'contractor', 'sn', 'email'],
      },
      DELETE: {
        allowed: true,
      },
      VIEW: {
        allowed: true,
        properties: ['userName', 'country', 'sn', 'email'],
      },
    };

    const resourceDetails = {
      userName: 'test',
      email: 'test@test.com',
    };

    wrapper.vm.generateDisplay(schema, privilege, resourceDetails);

    expect(wrapper.vm.icon).toBe('fa-test');
    expect(wrapper.vm.formFields.contractor).toBe(false);
    // make sure the view and update properties are merged together and in the correct order
    expect(wrapper.vm.displayProperties.length).toBe(5);
    expect(wrapper.vm.displayProperties[0].key).toBe('country');
  });

  it('Password reveal correctly', () => {
    expect(wrapper.vm.passwordInputType).toBe('password');

    wrapper.vm.revealNew();

    expect(wrapper.vm.passwordInputType).toBe('text');

    wrapper.vm.revealNew();

    expect(wrapper.vm.passwordInputType).toBe('password');
  });
});
