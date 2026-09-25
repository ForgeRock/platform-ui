<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <!-- Visually hidden status region for screen readers (WCAG 4.1.3 Status Messages pattern).
    Always rendered — even when `message` is empty — so the region exists in the DOM before text is injected,
    which screen readers announce most reliably. aria-live/aria-atomic are declared explicitly alongside role="status"
    as Chrome does not reliably map the implicit live-region semantics of the status role (VoiceOver + Chrome can miss announcements that rely on it). -->
  <div
    role="status"
    aria-live="polite"
    aria-atomic="true"
    class="sr-only"
    :data-testid="testid">
    {{ renderedMessage }}
  </div>
</template>

<script>
import { pluralizeValue } from '@forgerock/platform-shared/src/utils/PluralizeUtils';

export default {
  name: 'SearchResultsAnnouncer',
  props: {
    // null = no active search (silent), 0 = no results, n = result count.
    count: {
      type: Number,
      default: null,
    },
    // Singular resource noun (e.g. "role"); the plural form is derived with pluralizeValue for the "{count} {plural} found." / "No {plural} found"
    resource: {
      type: String,
      default: 'result',
    },
    testid: {
      type: String,
      default: 'search-results-announcer',
    },
  },
  data() {
    return {
      // Text currently rendered in the region; written by the message watcher below
      renderedMessage: '',
      // The last text the region announced (including any prefix), remembered across the
      // reset-to-empty between searches; used to detect an identical repeat announcement
      lastAnnouncedMessage: '',
    };
  },
  computed: {
    /**
     * Announcement text for the status region, derived from the current result
     * count: empty while no search is active, the no-results message at zero
     * ("No {pluralized resource} found" when a custom resource is passed, e.g.
     * "No roles found"), and a localized "{count} {resource} found." otherwise.
     * @returns {string} the message to announce
     */
    message() {
      if (this.count === null) return '';
      if (!this.count) {
        return this.resource !== 'result'
          ? this.$t('common.noObjectFound', { object: pluralizeValue(this.resource) })
          : this.$t('common.noResultsFound');
      }
      return this.$t('common.numberElementsFound', {
        number: this.count,
        element: this.count === 1 ? this.resource : pluralizeValue(this.resource),
      });
    },
  },
  watch: {
    /**
     * Renders the message in the live region. When a settled search produces text identical to the previous announcement
     * (e.g. re-submitting the same query and getting the same result count), screen readers do not re-speak text they last announced from the same element,
     * even if the region was cleared in between. The message is then prefixed with "Search updated." so the region's new text differs from the previous one and the announcement is heard every time.
     */
    message: {
      immediate: true,
      handler(newMessage) {
        if (!newMessage) {
          // Reset between searches: the region goes empty, but the last announced text is remembered so an identical repeat announcement can still be detected
          this.renderedMessage = '';
          return;
        }
        if (newMessage === this.lastAnnouncedMessage) {
          // Identical to the last announcement: screen readers do not re-speak text they last announced from the same element,
          // even if the region was cleared in between. Prefix so the region's new text differs and the announcement is heard every time.
          this.renderedMessage = `${this.$t('common.searchUpdated')} ${newMessage}`;
        } else {
          this.renderedMessage = newMessage;
        }
        this.lastAnnouncedMessage = this.renderedMessage;
      },
    },
  },
};
</script>
