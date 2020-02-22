<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<script>
import store from '../../store/index';

/**
 * @description Allows breadcrumb return routes to be set throughout app
 *
 */
export default {
  name: 'BreadcrumbMixin',
  methods: {
    /**
     * Clears out route and text parameters
     */
    clearBreadcrumb() {
      store.dispatch('setReturnRoute', {
        returnRoute: '',
        returnRouteText: '',
      });
    },
    /**
    * Sets the current breadcrumb
    *
    * @param {String} returnRoute URL path route which will direct link click
    * @param {String} returnRouteText displayed title of breadcrumb
    */
    setBreadcrumb(returnRoute, returnRouteText) {
      store.dispatch('setReturnRoute', {
        returnRoute,
        returnRouteText,
      });
    },
    /**
     * Gets the current breadcrumb
     *
     * @returns {Object} breadcrumb object containing both route and text
     */
    getBreadcrumb() {
      if (store.state) {
        return { returnRoute: store.state.returnRoute, returnRouteText: store.state.returnRouteText };
      }
      return { returnRoute: '', returnRouteText: '' };
    },
    /**
     * Gets the current breadcrumb route
     *
     * @returns {String} return route
     */
    getBreadcrumbRoute() {
      if (store.state) {
        return store.state.returnRoute;
      }
      return '';
    },
    /**
     * Gets the current breadcrumb text
     *
     * @returns {String} breadcrumb text
     */
    getBreadcrumbRouteText() {
      if (store.state) {
        return store.state.returnRouteText;
      }
      return '';
    },
  },
  /**
   * Cleans up breadcrumb when navigating away
   *
   * @param {Object} to Unused
   * @param {Object} from Unused
   * @param {Function} next returns control to router when called
   */
  beforeRouteLeave(to, from, next) {
    if (this.getBreadcrumbRoute()) {
      this.clearBreadcrumb();
    }
    next();
  },
};
</script>
