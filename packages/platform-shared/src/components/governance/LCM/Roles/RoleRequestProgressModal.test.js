/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { toHaveNoViolations } from 'jest-axe';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import RoleRequestProgressModal from './RoleRequestProgressModal';
import i18n from '@/i18n';

expect.extend(toHaveNoViolations);

const idleSteps = {
  similarity: { state: 'pending', note: '' },
  submit: { state: 'pending', note: '' },
};

const runningSteps = {
  similarity: { state: 'active', note: '' },
  submit: { state: 'pending', note: '' },
};

const checkDoneSteps = {
  similarity: { state: 'done', note: 'No similar roles detected' },
  submit: { state: 'pending', note: '' },
};

const successSteps = {
  similarity: { state: 'done', note: 'No similar roles detected' },
  submit: { state: 'done', note: 'Request REQ-123 created' },
};

const checkFailedSteps = {
  similarity: { state: 'error', note: 'The similarity check could not be completed' },
  submit: { state: 'pending', note: '' },
};

const submitFailedSteps = {
  similarity: { state: 'done', note: 'No similar roles detected' },
  submit: { state: 'error', note: 'The request could not be submitted' },
};

const similarRoles = [
  {
    id: 'role1',
    name: 'Support Agent',
    status: 'active',
    jaccard: 0.72,
    sharedItems: ['ent1', 'ent2'],
    totalShared: 18,
    entitlementCount: 20,
  },
];

function manyRoles(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: `role${i}`,
    name: `Role ${i}`,
    status: 'active',
    jaccard: 0.5,
    totalShared: 2,
  }));
}

function mountComponent(props = {}) {
  return mount(RoleRequestProgressModal, {
    global: {
      plugins: [i18n],
    },
    props: {
      isTesting: true,
      stepState: idleSteps,
      ...props,
    },
  });
}

describe('RoleRequestProgressModal', () => {
  it('shows a spinner on the active step and pending state on the other', () => {
    const wrapper = mountComponent({ stepState: runningSteps });
    expect(wrapper.find('[data-testid="progress-modal-spinner-similarity"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="progress-modal-spinner-submit"]').exists()).toBe(false);
    expect(wrapper.find('.fr-request-progress__step--pending').exists()).toBe(true);
  });

  it('shows a check icon and note for a completed step', () => {
    const wrapper = mountComponent({ stepState: checkDoneSteps });
    expect(wrapper.find('.fr-request-progress__icon--done').exists()).toBe(true);
    expect(wrapper.find('[data-testid="progress-modal-note-similarity"]').text()).toContain('No similar roles detected');
  });

  it('shows an error icon and note for a failed step', () => {
    const wrapper = mountComponent({ stepState: checkFailedSteps, outcome: 'error' });
    expect(wrapper.find('.fr-request-progress__icon--error').exists()).toBe(true);
    expect(wrapper.find('[data-testid="progress-modal-note-similarity"]').text()).toContain('The similarity check could not be completed');
  });

  it('does not render a progress bar', () => {
    const wrapper = mountComponent({ stepState: runningSteps });
    expect(wrapper.find('.progress-bar').exists()).toBe(false);
  });

  it('shows a Cancel escape path while steps are running, with no submit or retry buttons', () => {
    const wrapper = mountComponent({ stepState: runningSteps });
    expect(wrapper.find('[data-testid="progress-modal-cancel-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="progress-modal-retry-button"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="progress-modal-continue-button"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="progress-modal-done-button"]').exists()).toBe(false);
  });

  it('emits close from the running-state Cancel button', async () => {
    const wrapper = mountComponent({ stepState: runningSteps });
    await wrapper.find('[data-testid="progress-modal-cancel-button"]').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('shows an enabled Submit button when the check found no matches', async () => {
    const wrapper = mountComponent({ stepState: checkDoneSteps, canContinue: true, similarRoles: [] });
    const submit = wrapper.find('[data-testid="progress-modal-continue-button"]');
    expect(submit.exists()).toBe(true);
    expect(submit.text()).toBe('Submit');
    expect(submit.attributes('disabled')).toBeFalsy();
    await submit.trigger('click');
    expect(wrapper.emitted('continue')).toHaveLength(1);
  });

  it('disables the Submit and Cancel buttons while the submission is in flight', async () => {
    const wrapper = mountComponent({ stepState: checkDoneSteps, canContinue: true, isSubmitting: true });
    expect(wrapper.find('[data-testid="progress-modal-continue-button"]').attributes('disabled')).toBeDefined();
    expect(wrapper.find('[data-testid="progress-modal-cancel-button"]').attributes('disabled')).toBeDefined();
  });

  it('shows the review table expanded by default with an enabled Submit button', async () => {
    const wrapper = mountComponent({ stepState: checkDoneSteps, canContinue: true, similarRoles });
    // Table visible immediately, submit works without any interaction
    expect(wrapper.find('table').exists()).toBe(true);
    const submit = wrapper.find('[data-testid="progress-modal-continue-button"]');
    expect(submit.attributes('disabled')).toBeFalsy();
    await submit.trigger('click');
    expect(wrapper.emitted('continue')).toHaveLength(1);
  });

  it('collapses the review table via the header toggle and shows its rows when expanded', async () => {
    const wrapper = mountComponent({ stepState: checkDoneSteps, canContinue: true, similarRoles });
    const rows = wrapper.findAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].text()).toContain('Support Agent');
    expect(rows[0].text()).toContain('72%');
    expect(wrapper.find('[data-testid="progress-modal-toggle-similar-button"]').text()).toBe('Hide Similar Roles');
    await wrapper.find('[data-testid="progress-modal-toggle-similar-button"]').trigger('click');
    expect(wrapper.find('table').exists()).toBe(false);
    // Submit still works with the table collapsed
    await wrapper.find('[data-testid="progress-modal-continue-button"]').trigger('click');
    expect(wrapper.emitted('continue')).toHaveLength(1);
  });

  it('hides the similar-roles review card when the check found no matches', () => {
    const wrapper = mountComponent({ stepState: checkDoneSteps, canContinue: true, similarRoles: [] });
    expect(wrapper.find('[data-testid="progress-modal-similar-roles-card"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="progress-modal-toggle-similar-button"]').exists()).toBe(false);
  });

  it('shows the review card with the count in its header and the table expanded by default', () => {
    const wrapper = mountComponent({ stepState: checkDoneSteps, canContinue: true, similarRoles });
    const card = wrapper.find('[data-testid="progress-modal-similar-roles-card"]');
    expect(card.exists()).toBe(true);
    expect(card.find('.fr-request-progress__review-title').text()).toBe('Similar Roles (1)');
    expect(wrapper.find('table').exists()).toBe(true);
    expect(wrapper.find('[data-testid="progress-modal-toggle-similar-button"]').text()).toBe('Hide Similar Roles');
  });

  it('shows the similarity note inline with the step label in a single line', () => {
    const wrapper = mountComponent({ stepState: checkDoneSteps, canContinue: true, similarRoles });
    const note = wrapper.find('[data-testid="progress-modal-note-similarity"]');
    expect(note.exists()).toBe(true);
    const label = wrapper.find('.fr-request-progress__label');
    expect(label.text()).toContain('Checking for role similarity');
    expect(label.text()).toContain('No similar roles detected');
  });

  it('expands the collapsed table from the toggle', async () => {
    const wrapper = mountComponent({ stepState: checkDoneSteps, canContinue: true, similarRoles });
    await wrapper.find('[data-testid="progress-modal-toggle-similar-button"]').trigger('click');
    expect(wrapper.find('table').exists()).toBe(false);
    await wrapper.find('[data-testid="progress-modal-toggle-similar-button"]').trigger('click');
    expect(wrapper.find('table').exists()).toBe(true);
  });

  it('marks both disclosure toggles with aria-expanded and aria-controls', async () => {
    const wrapper = mountComponent({
      stepState: checkDoneSteps,
      canContinue: true,
      similarRoles: manyRoles(8),
    });
    const reviewToggle = wrapper.find('[data-testid="progress-modal-toggle-similar-button"]');
    expect(reviewToggle.attributes('aria-expanded')).toBe('true');
    expect(reviewToggle.attributes('aria-controls')).toBe('progress-modal-similar-roles-body');
    // Expanded state carries over to the show-more toggle while the extra rows are hidden
    const showMore = wrapper.find('[data-testid="progress-modal-show-more-button"]');
    expect(showMore.attributes('aria-expanded')).toBe('false');
    expect(showMore.attributes('aria-controls')).toBe('progress-modal-similar-rows-extra');
    await showMore.trigger('click');
    expect(showMore.attributes('aria-expanded')).toBe('true');
    await reviewToggle.trigger('click');
    expect(reviewToggle.attributes('aria-expanded')).toBe('false');
  });

  it('renders blank indicators instead of NaN or a crash for a malformed result row', () => {
    const wrapper = mountComponent({
      stepState: checkDoneSteps,
      canContinue: true,
      similarRoles: [{ id: 'roleX' }],
    });
    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(1);
    expect(rows[0].text()).toContain('--');
    expect(rows[0].text()).toContain('0%');
  });

  it('shows at most 5 rows with a show-more toggle inside the expanded review', async () => {
    const wrapper = mountComponent({ stepState: checkDoneSteps, canContinue: true, similarRoles: manyRoles(8) });
    // Expanded by default: 5 of the 8 rows visible
    expect(wrapper.findAll('tbody tr').length).toBe(5);
    const showMore = wrapper.find('[data-testid="progress-modal-show-more-button"]');
    expect(showMore.text()).toBe('Show 3 additional roles');
    await showMore.trigger('click');
    expect(wrapper.findAll('tbody tr').length).toBe(8);
  });

  it('shows a success banner and Done button on success', () => {
    const wrapper = mountComponent({ stepState: successSteps, outcome: 'success' });
    expect(wrapper.find('[data-testid="progress-modal-banner"]').classes()).toContain('fr-request-progress__banner--success');
    expect(wrapper.find('[data-testid="progress-modal-done-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="progress-modal-retry-button"]').exists()).toBe(false);
  });

  it('emits close when Done is clicked', async () => {
    const wrapper = mountComponent({ stepState: successSteps, outcome: 'success' });
    await wrapper.find('[data-testid="progress-modal-done-button"]').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('shows an error banner and Cancel/Retry buttons when the check fails', () => {
    const wrapper = mountComponent({ stepState: checkFailedSteps, outcome: 'error' });
    expect(wrapper.find('[data-testid="progress-modal-banner"]').classes()).toContain('fr-request-progress__banner--error');
    expect(wrapper.find('[data-testid="progress-modal-cancel-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="progress-modal-retry-button"]').exists()).toBe(true);
  });

  it('emits retry and close from the error footer buttons', async () => {
    const wrapper = mountComponent({ stepState: submitFailedSteps, outcome: 'error' });
    await wrapper.find('[data-testid="progress-modal-retry-button"]').trigger('click');
    expect(wrapper.emitted('retry')).toHaveLength(1);
    await wrapper.find('[data-testid="progress-modal-cancel-button"]').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('has no accessibility violations', async () => {
    const wrapper = mountComponent({ stepState: checkDoneSteps, canContinue: true, similarRoles });
    expect(await runA11yTest(wrapper)).toHaveNoViolations();
  });
});
