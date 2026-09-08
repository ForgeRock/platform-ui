/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { axe } from 'jest-axe';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import i18n from '@/i18n';
import NewRequestModal from './NewRequestModal';

jest.mock('uuid', () => ({ v4: jest.fn(() => 'test-uuid') }));

// Stub FrResourceSelect: render the tag slot content for each v-model user, delegating to the
// caller's #tag slot (which NewRequestModal provides) so removals can be exercised end-to-end
jest.mock('@forgerock/platform-shared/src/components/Field/ResourceSelect', () => {
  const { h } = jest.requireActual('vue');
  return {
    name: 'ResourceSelect',
    props: ['value', 'modelValue'],
    emits: ['input', 'update:modelValue'],
    computed: {
      users() {
        const current = this.modelValue ?? this.value;
        return Array.isArray(current) ? current : [];
      },
    },
    render() {
      const tagSlot = this.$scopedSlots?.tag || this.$slots?.tag;
      const emitUpdate = (remaining) => {
        this.$emit('update:modelValue', remaining);
        this.$emit('input', remaining);
      };
      const tags = tagSlot
        ? this.users.map((user) => tagSlot({
          option: { value: user },
          // vue-multiselect's remove callback accepts the internal option object; unwrap .value
          remove: (o) => emitUpdate(this.users.filter((x) => x !== (o.value ?? o))),
        }))
        : [];
      // Mirror vue-multiselect's always-present search input (type="search" is what the modal's
      // focus restore targets)
      return [h('input', { class: 'multiselect__input', type: 'search', 'aria-label': 'Users' }), ...tags];
    },
  };
});

mockValidation(['required']);

const users = [
  {
    _id: 'u1',
    givenName: 'Mike',
    sn: 'Test',
    userName: 'mike',
    profileImage: '',
  },
  {
    _id: 'u2',
    givenName: 'Ann',
    sn: 'Bee',
    userName: 'ann',
    profileImage: '',
  },
  {
    _id: 'u3',
    givenName: 'Cee',
    sn: 'Dee',
    userName: 'cee',
    profileImage: '',
  },
];

/**
 * Mounts the modal with a testing Pinia (user + enduser store state) and the Others option pre-selected,
 * so the user multiselect renders.
 */
const mountModal = () => mount(NewRequestModal, {
  global: {
    plugins: [
      createTestingPinia({
        initialState: {
          user: {
            givenName: 'Admin',
            sn: 'User',
            userName: 'admin',
            userId: 'admin-id',
            hasIDMUsersViewPrivilege: true,
          },
          enduser: { profileImage: '' },
        },
      }),
      i18n,
    ],
    mocks: { $store: { state: { realm: 'alpha' } } },
  },
  data() {
    return { requestOption: 'others' };
  },
  props: { static: true, visible: true },
  attachTo: document.body,
});

/**
 * Clicks the remove icon on the tag for rawUser, mirroring a real user action. Uses mousedown
 * because the tag icon removes on mousedown (with .prevent, mirroring MultiselectBase's default
 * tag icon, so the click never moves focus onto the icon).
 * The tag slot passes the multiselect's internal option ({ value: rawUser }) to removeUser,
 * and the stubbed ResourceSelect removes the user from the v-model, mirroring vue-multiselect.
 */
async function removeTag(wrapper, rawUser) {
  const modalRoot = document.getElementById('NewRequestModal');
  const icons = [...modalRoot.querySelectorAll('.multiselect__tag-icon')];
  const idx = wrapper.vm.selectedUsers.indexOf(rawUser);
  const icon = icons[idx];
  expect(icon).toBeTruthy();
  icon.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
  await flushPromises();
}

describe('NewRequestModal Component', () => {
  let wrapper;

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = null;
    }
  });

  it('announces the removed user and focuses the previous tag after a middle-tag removal', async () => {
    wrapper = mountModal();
    wrapper.vm.selectedUsers = users;
    await flushPromises();

    await removeTag(wrapper, users[1]);
    expect(wrapper.find('[data-testid="removal-announcement"]').text()).toBe('User Ann Bee has been removed');

    const icons = [...document.getElementById('NewRequestModal').querySelectorAll('.multiselect__tag-icon')];
    expect(icons).toHaveLength(2);
    expect(document.activeElement).toBe(icons[0]);
  });

  it('announces the removed user and focuses the new first tag after a first-tag removal', async () => {
    wrapper = mountModal();
    wrapper.vm.selectedUsers = users;
    await flushPromises();

    await removeTag(wrapper, users[0]);
    expect(wrapper.find('[data-testid="removal-announcement"]').text()).toBe('User Mike Test has been removed');

    const icons = [...document.getElementById('NewRequestModal').querySelectorAll('.multiselect__tag-icon')];
    expect(icons).toHaveLength(2);
    expect(document.activeElement).toBe(icons[0]);
  });

  it('focuses the search input after the last remaining tag is removed', async () => {
    wrapper = mountModal();
    wrapper.vm.selectedUsers = [users[0]];
    await flushPromises();

    await removeTag(wrapper, users[0]);
    expect(wrapper.find('[data-testid="removal-announcement"]').text()).toBe('User Mike Test has been removed');

    const input = document.getElementById('NewRequestModal').querySelector('input[type="search"]');
    expect(input).not.toBeNull();
    expect(document.activeElement).toBe(input);
  });

  it('does not announce when the radio-option switch clears the selection', async () => {
    wrapper = mountModal();
    wrapper.vm.selectedUsers = users;
    await flushPromises();

    // Simulate the radio-option switch clearing the selection (requestOption watcher)
    wrapper.vm.requestOption = 'self';
    await flushPromises();

    expect(wrapper.find('[data-testid="removal-announcement"]').text()).toBe('');
  });

  it('is accessible', async () => {
    wrapper = mountModal();
    wrapper.vm.selectedUsers = users;
    await flushPromises();

    const results = await axe(wrapper.element);
    expect(results).toHaveNoViolations();
  });
});
