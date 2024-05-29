/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';
import { useJourneyEditorAsChildPageStore } from '@forgerock/platform-shared/src/stores/journeyEditorAsChildPage';
import { useRouter } from 'vue-router';
import useJourneyEditorAsChildPage from './journeyEditorAsChildPage';

jest.mock('vue-router', () => ({
  useRouter: jest.fn(),
}));

describe('journeyEditorAsChildPage composable', () => {
  function setupTestStore({ editorIsChildPage = false, childJourneyId = '', parentRoute = '' }) {
    const testPinia = createTestingPinia({
      initialState: {
        journeyEditorAsChildPage: {
          editorIsChildPage,
          childJourneyId,
          parentRoute,
        },
      },
    });
    setActivePinia(testPinia);
  }

  it('Sets store state and navigates to the journey editor as a child page', () => {
    const push = jest.fn();
    useRouter.mockImplementationOnce(() => ({
      push,
    }));
    setupTestStore({});
    const store = useJourneyEditorAsChildPageStore();
    const { viewJourneyAsChildPage } = useJourneyEditorAsChildPage();

    // Store should be clear initially
    expect(store.childJourneyId).toBe('');
    expect(store.editorIsChildPage).toBe(false);
    expect(store.parentRoute).toBe('');
    // router push should not have been called
    expect(push).not.toHaveBeenCalled();

    viewJourneyAsChildPage('123', 'returnRoute');

    expect(store.childJourneyId).toBe('123');
    expect(store.editorIsChildPage).toBe(true);
    expect(store.parentRoute).toBe('returnRoute');
    expect(push).toHaveBeenCalledWith({ name: 'JourneyTree', params: { treeId: '123' } });
  });

  it('Clears store child page state and navigates back to the parent page', () => {
    const push = jest.fn();
    useRouter.mockImplementationOnce(() => ({
      push,
    }));
    setupTestStore({ editorIsChildPage: true, childJourneyId: '123', parentRoute: 'returnRoute' });
    const store = useJourneyEditorAsChildPageStore();
    const { returnToParentPage } = useJourneyEditorAsChildPage();

    // Store should be set initially
    expect(store.childJourneyId).toBe('123');
    expect(store.editorIsChildPage).toBe(true);
    expect(store.parentRoute).toBe('returnRoute');
    // router push should not have been called
    expect(push).not.toHaveBeenCalled();

    returnToParentPage();

    // is child page should have been cleared
    expect(store.editorIsChildPage).toBe(false);

    // remaining state is kept for the parent page to consume and clear
    expect(store.childJourneyId).toBe('123');
    expect(store.parentRoute).toBe('returnRoute');

    expect(push).toHaveBeenCalledWith('returnRoute');
  });

  it('Clears store state when the user leaves the child page without returning to the parent page', () => {
    setupTestStore({ editorIsChildPage: true, childJourneyId: '123', parentRoute: 'returnRoute' });
    const store = useJourneyEditorAsChildPageStore();
    const { leftChildPage } = useJourneyEditorAsChildPage();

    // Store should be set initially
    expect(store.editorIsChildPage).toBe(true);
    expect(store.childJourneyId).toBe('123');
    expect(store.parentRoute).toBe('returnRoute');

    leftChildPage();

    // Store should be cleared
    expect(store.editorIsChildPage).toBe(false);
    expect(store.childJourneyId).toBe('');
    expect(store.parentRoute).toBe('');
  });

  it('Clears store state when the parent has received data', () => {
    setupTestStore({ editorIsChildPage: false, childJourneyId: '123', parentRoute: 'returnRoute' });
    const store = useJourneyEditorAsChildPageStore();
    const { parentHasReceivedData } = useJourneyEditorAsChildPage();

    // Store should be set initially
    expect(store.editorIsChildPage).toBe(false);
    expect(store.childJourneyId).toBe('123');
    expect(store.parentRoute).toBe('returnRoute');

    parentHasReceivedData();

    // Store should be cleared
    expect(store.editorIsChildPage).toBe(false);
    expect(store.childJourneyId).toBe('');
    expect(store.parentRoute).toBe('');
  });

  it('Returns whether the editor is being used as a child page', () => {
    setupTestStore({ editorIsChildPage: true });
    const { editorIsChildPage } = useJourneyEditorAsChildPage();
    expect(editorIsChildPage.value).toBe(true);
  });

  it('Returns the child journey ID from the store', () => {
    setupTestStore({ childJourneyId: '123' });
    const { childJourneyId } = useJourneyEditorAsChildPage();
    expect(childJourneyId.value).toBe('123');
  });
});
