/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useJourneyEditorAsChildPageStore } from '../stores/journeyEditorAsChildPage';

/**
 * Allows components to route to the journey editor as a child page which will allow return to the original page
 */
export default function useJourneyEditorAsChildPage() {
  const journeyEditorAsChildPageStore = useJourneyEditorAsChildPageStore();
  const router = useRouter();

  /**
   * Navigates to the journey editor for a specific journey and sets store data so this will be presented as a child page
   * @param {String} journeyId the id of the journey to view as a child page
   * @param {String} returnRoute the route to return to when the child page is closed
   */
  function viewJourneyAsChildPage(journeyId, returnRoute) {
    journeyEditorAsChildPageStore.childJourneyId = journeyId;
    journeyEditorAsChildPageStore.editorIsChildPage = true;
    journeyEditorAsChildPageStore.parentRoute = returnRoute;
    router.push({ name: 'JourneyTree', params: { treeId: journeyId } });
  }

  /**
   * Navigates back to the parent page using store data
   */
  function returnToParentPage() {
    journeyEditorAsChildPageStore.editorIsChildPage = false;
    router.push(journeyEditorAsChildPageStore.parentRoute);
  }

  /**
   * Resets the store data when a user leaves the child page without returning to the parent page
   */
  function leftChildPage() {
    journeyEditorAsChildPageStore.editorIsChildPage = false;
    journeyEditorAsChildPageStore.childJourneyId = '';
    journeyEditorAsChildPageStore.parentRoute = '';
  }

  /**
   * Clears store data when the parent page has received the data
   */
  function parentHasReceivedData() {
    journeyEditorAsChildPageStore.childJourneyId = '';
    journeyEditorAsChildPageStore.parentRoute = '';
  }

  const editorIsChildPage = computed(() => journeyEditorAsChildPageStore.editorIsChildPage);
  const childJourneyId = computed(() => journeyEditorAsChildPageStore.childJourneyId);

  return {
    viewJourneyAsChildPage,
    returnToParentPage,
    leftChildPage,
    parentHasReceivedData,
    editorIsChildPage,
    childJourneyId,
  };
}
