/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ResourceModal from './index';

describe('ResourceModal', () => {
  const resource = {
    displayName: 'Nadia Osei',
    id: 'app-1/user/009',
    objectType: 'user',
    isNHI: true,
    sourceId: '009',
    applicationId: 'app-1',
    lastImportTime: '2026-09-25T17:39:27Z',
    glossary: {
      idx: {
        '/resource': {
          privileged: true,
        },
      },
    },
  };

  function shallowMountComponent(propsData = {}) {
    return shallowMount(ResourceModal, {
      global: {
        mocks: {
          $t: (text) => (text),
        },
      },
      props: {
        resource,
        ...propsData,
      },
    });
  }

  it('sets aria-label combining resource type and display name', () => {
    const wrapper = shallowMountComponent();
    expect(wrapper.find('#CertificationTaskResourceModal').attributes('arialabel')).toContain('Nadia Osei');
  });

  it('falls back to the bare translated label when resource has no display name', () => {
    const wrapper = shallowMountComponent({ resource: { displayName: '' } });
    expect(wrapper.find('#CertificationTaskResourceModal').attributes('arialabel')).toBe('common.resource');
  });

  it('passes resource glossary values to the display form', () => {
    const wrapper = shallowMountComponent();
    expect(wrapper.vm.glossaryValues).toEqual({ privileged: true });
  });

  it('uses an empty object for glossary values when resource has no glossary', () => {
    const wrapper = shallowMountComponent({ resource: { displayName: 'No glossary' } });
    expect(wrapper.vm.glossaryValues).toEqual({});
  });

  it('uses the default modal id', () => {
    const wrapper = shallowMountComponent();
    expect(wrapper.props('modalId')).toBe('CertificationTaskResourceModal');
  });
});
