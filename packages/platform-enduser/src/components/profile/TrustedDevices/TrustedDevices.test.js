/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import TrustedDevices from '@/components/profile/TrustedDevices';

const localVue = createLocalVue();
const MapMixin = {
  computed: {
    googleMapsApiKey: '',
  },
  methods: {
    reverseGeocode: () => Promise.resolve({
      getFormattedAddress() {
        return 'Austin, TX, USA';
      },
      getAddressComponent() {
        return {
          long_name: 'Austin',
        };
      },
    }),
    staticMap: () => 'https://mapurl',
  },
};

const threeDaysAgo = new Date() - (3 * 86400000);
const now = new Date();
const deviceData = [
  {
    _id: '2620036593-631687849-3472382927',
    _rev: '1283873680',
    identifier: '2620036593-631687849-3472382927',
    metadata: {
      hardware: {
        cpuClass: null,
        deviceMemory: 8,
        hardwareConcurrency: 16,
        maxTouchPoints: 0,
        oscpu: null,
        display: {
          width: 1680,
          height: 1050,
          pixelDepth: 24,
          angle: 0,
        },
      },
      browser: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36',
        appName: 'Netscape',
        appCodeName: 'Mozilla',
        appVersion: '5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36',
        appMinorVersion: null,
        buildID: null,
        product: 'Gecko',
        productSub: '20030107',
        vendor: 'Google Inc.',
        vendorSub: '',
        browserLanguage: null,
        plugins: 'internal-pdf-viewer;mhjfbmdgcfjbbpaeojofohoefgiehjai;internal-nacl-plugin;',
      },
      platform: {
        language: 'en-US',
        platform: 'MacIntel',
        userLanguage: null,
        systemLanguage: null,
        deviceName: 'Mac (Browser)',
        fonts: 'cursive;monospace;sans-serif;fantasy;Arial;Arial Black;Arial Narrow;Arial Rounded MT Bold;Comic Sans MS;Courier;Courier New;Georgia;Impact;Papyrus;Tahoma;Trebuchet MS;Verdana;',
        timezone: 300,
      },
    },
    location: {
      latitude: 30.299995,
      longitude: -97.736,
    },
    lastSelectedDate: threeDaysAgo,
    alias: 'user1234',
    recoveryCodes: [],
  },
  {
    _id: '1296998081-3122367898-3763616826',
    _rev: '1853764930',
    identifier: '1296998081-3122367898-3763616826',
    metadata: {
      hardware: {
        cpuClass: null,
        deviceMemory: 8,
        hardwareConcurrency: 16,
        maxTouchPoints: 0,
        oscpu: null,
        display: {
          width: 1680,
          height: 1050,
          pixelDepth: 24,
          angle: 0,
        },
      },
      browser: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36',
        appName: 'Netscape',
        appCodeName: 'Mozilla',
        appVersion: '5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36',
        appMinorVersion: null,
        buildID: null,
        product: 'Gecko',
        productSub: '20030107',
        vendor: 'Google Inc.',
        vendorSub: '',
        browserLanguage: null,
        plugins: 'internal-pdf-viewer;mhjfbmdgcfjbbpaeojofohoefgiehjai;internal-nacl-plugin;',
      },
      platform: {
        language: 'en-US',
        platform: 'MacIntel',
        userLanguage: null,
        systemLanguage: null,
        deviceName: 'Mac (Browser)',
        fonts: 'cursive;monospace;sans-serif;fantasy;Arial;Arial Black;Arial Narrow;Arial Rounded MT Bold;Comic Sans MS;Courier;Courier New;Georgia;Impact;Papyrus;Tahoma;Trebuchet MS;Verdana;',
        timezone: 300,
      },
    },
    location: {
      latitude: 30.299995,
      longitude: -97.736,
    },
    lastSelectedDate: now,
    alias: 'alias',
    recoveryCodes: [],
  },
];

describe('TrustedDevices.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.spyOn(TrustedDevices, 'mounted')
      .mockImplementation(() => { });

    wrapper = shallowMount(TrustedDevices, {
      localVue,
      mixins: [MapMixin],
      mocks: {
        $t: (match) => {
          switch (match) {
          case 'pages.profile.trustedDevices.editModalTitle':
            return 'editTitle';
          case 'pages.profile.trustedDevices.removeModalTitle':
            return 'removeTitle';
          case 'pages.profile.trustedDevices.remove':
            return 'remove';
          case 'common.save':
            return 'save';
          default:
            return 'none';
          }
        },
        $store: () => {},
      },
      i18n,
      stubs: {
        BModal: true,
      },
    });
  });

  it('Trusted Devices loads', () => {
    expect(wrapper.name()).toBe('TrustedDevices');
    expect(wrapper).toMatchSnapshot();
  });

  it('ParseDevice method returns an object with device data', () => {
    const localDeviceData = { ...deviceData[0] };
    const expected = {
      alias: 'user1234',
      browser: 'Chrome 81.0.4044.138',
      cpu: 'MacIntel',
      deviceId: '2620036593-631687849-3472382927',
      deviceType: 'macos',
      isCurrent: false,
      lastLogin: '3 days ago',
      lastSelectedDate: threeDaysAgo,
      os: 'Mac OS 10.15.4',
    };
    const parsedDevice = wrapper.vm.parseDevice(localDeviceData);
    expect(parsedDevice).toEqual(expected);
  });

  it('ParseDevice method returns an empty strings if metadata data is missing', () => {
    const deviceDataModified = { ...deviceData[0], metadata: { } };
    const expected = {
      alias: 'user1234',
      browser: '',
      cpu: '',
      deviceId: '2620036593-631687849-3472382927',
      deviceType: '',
      isCurrent: false,
      lastLogin: '3 days ago',
      lastSelectedDate: threeDaysAgo,
      os: '',
    };
    const parsedDevice = wrapper.vm.parseDevice(deviceDataModified);
    expect(parsedDevice).toEqual(expected);
  });

  it('ParseDevice method sets isCurrent to true on deviceId match', () => {
    const localDeviceData = { ...deviceData[0] };
    localStorage.setItem('profile-id', '2620036593-631687849-3472382927');

    const parsedDevice = wrapper.vm.parseDevice(localDeviceData);
    expect(parsedDevice.isCurrent).toBe(true);
  });

  it('ParseLocation method returns a promise that resolves with a location object', async (done) => {
    const location = { ...deviceData[0].location };
    const expected = {
      formattedAddress: 'Austin, TX, USA',
      locality: 'Austin',
      map: 'https://mapurl',
    };
    wrapper.vm.parseLocation(location).then((actualLocation) => {
      expect(actualLocation).toEqual(expected);
      done();
    });
  });

  it('SortDevicesByDate method returns devices sorted by lastSelectedDate', () => {
    const devices = [{ ...deviceData[0] }, { ...deviceData[1] }];
    const expectedSorted = [{ ...deviceData[1] }, { ...deviceData[0] }];
    const actualSorted = wrapper.vm.sortDevicesByDate(devices);
    expect(actualSorted).toEqual(expectedSorted);
  });

  it('setModalData set modal data', () => {
    const data = {
      alias: 'user1234',
      deviceId: '2620036593-631687849-3472382927',
    };
    const expectedEditModalData = {
      modalType: 'edit',
      modalDevice: {
        id: '2620036593-631687849-3472382927',
        index: undefined,
        primaryButtonText: 'save',
        title: 'editTitle',
      },
      editModalValue: 'user1234',
    };
    const expectedRemoveModalData = {
      modalType: 'remove',
      modalDevice: {
        id: '2620036593-631687849-3472382927',
        index: undefined,
        primaryButtonText: 'remove',
        title: 'removeTitle',
      },
      editModalValue: undefined,
    };
    const expectedClearModalData = {
      modalType: '',
      modalDevice: {
        id: undefined,
        title: '',
        index: undefined,
        primaryButtonText: '',
      },
      editModalValue: undefined,
    };
    wrapper.vm.setModalData('edit', data);
    expect(wrapper.vm.$data.modalDevice).toEqual(expectedEditModalData.modalDevice);
    expect(wrapper.vm.$data.modalType).toEqual(expectedEditModalData.modalType);
    expect(wrapper.vm.$data.editModal.value).toEqual(expectedEditModalData.editModalValue);

    wrapper.vm.setModalData('remove', data);
    expect(wrapper.vm.$data.modalDevice).toEqual(expectedRemoveModalData.modalDevice);
    expect(wrapper.vm.$data.modalType).toEqual(expectedRemoveModalData.modalType);
    expect(wrapper.vm.$data.editModal.value).toEqual(expectedRemoveModalData.editModalValue);

    wrapper.vm.setModalData('', {});
    expect(wrapper.vm.$data.modalDevice).toEqual(expectedClearModalData.modalDevice);
    expect(wrapper.vm.$data.modalType).toEqual(expectedClearModalData.modalType);
    expect(wrapper.vm.$data.editModal.value).toEqual(expectedClearModalData.editModalValue);
  });

  it('handleModalPrimaryButton method calls the correct handler', () => {
    const spy = jest.fn();
    wrapper = shallowMount(TrustedDevices, {
      localVue,
      mixins: [MapMixin],
      mocks: {
        $t: () => {},
        $store: () => {},
      },
      methods: {
        updateDeviceAlias: spy,
        removeDevice: spy,
      },
      i18n,
    });
    wrapper.vm.$data.modalDevice = { id: '111', index: '1' };
    wrapper.vm.$data.editModal.value = 'update';

    wrapper.vm.handleModalPrimaryButton('edit');
    expect(spy).toHaveBeenCalledWith('111', 'update', '1');

    wrapper.vm.handleModalPrimaryButton('remove');
    expect(spy).toHaveBeenCalledWith('111');
  });
});
