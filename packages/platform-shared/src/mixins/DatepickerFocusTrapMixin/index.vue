<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
import { useFocusTrap } from '@forgerock/platform-shared/src/composables/useFocusTrap';

/**
 * Traps focus within the BFormDatepicker popup while it is open (IAM-11385).
 * Requires ref="datePicker" on the BFormDatepicker, with @shown="activateFocusTrap"
 * and @hidden="deactivateFocusTrap". Open focus and dismissal stay with BootstrapVue.
 */
export default {
  name: 'DatepickerFocusTrapMixin',
  beforeUnmount() {
    this.deactivateFocusTrap();
  },
  methods: {
    getFocusTrap() {
      if (!this.focusTrap) {
        this.focusTrap = useFocusTrap(
          // resolve live: BV re-renders the popup on open/close
          () => this.$refs.datePicker?.$el.querySelector('.dropdown-menu'),
        );
      }
      return this.focusTrap;
    },
    activateFocusTrap() {
      this.getFocusTrap().activate();
    },
    deactivateFocusTrap() {
      if (this.focusTrap) this.focusTrap.deactivate();
    },
  },
};
</script>
