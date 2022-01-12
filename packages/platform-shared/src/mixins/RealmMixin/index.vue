<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
import store from '@/store';
/**
 * @description Rest API call mixin for global use
 */
export default {
  name: 'RealmMixin',
  computed: {
    /**
      * Gives the first initial of the current realm name
      *
      * @return {string} first initial of realm name
      */
    realmInitial() {
      return store.state.realm[0];
    },
    /**
      * Gives the formal name of the current realm
      *
      * @return {string} first initial of realm name
      */
    realmFormalName() {
      return this.formatNameTopLevel(store.state.realm);
    },
  },
  methods: {
    /**
      * Formats the name of the root realm. When realms are retrieved from the
      * back end, the name of the root realm is '/'. When it is displayed to
      * the user it needs to displayed as 'Top level realm'.
      *
      * @param {string} name of realm from store
      * @return {string} name provided, unless name is root, then translated Top Level Name
      */
    formatNameTopLevel(name) {
      return name === '/' || name === 'root' ? this.$t('realm.topLevelRealm') : name;
    },
  },
};
</script>
