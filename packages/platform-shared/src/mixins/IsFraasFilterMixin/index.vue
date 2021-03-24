<!-- Copyright 2021 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<script>
import {
  last,
  reject,
} from 'lodash';

/**
 * @description mixin for filtering/changing things when $store.state.isFraas === true
 *
 */
export default {
  name: 'IsFraasFilterMixin',
  methods: {
    // filters out items that don't pertain to the current realm based on the alpha_ bravo_ myrealmname_ naming convention
    isFraasFilter(dataArrayToFilter, arrayItemProperty) {
      return reject(dataArrayToFilter, (item) => {
        // filter out anything to do with teammember
        if (item[arrayItemProperty].indexOf(this.$store.state.fraasAdminManagedObjectName) > -1) {
          return true;
        }
        // if there are no underscores in item[arrayItemProperty] we know this is not a realm specific object
        // in this case we want to show it (i.e. internal/role);
        if (item[arrayItemProperty].indexOf('_') === -1) {
          return false;
        }
        // using the last function here for cases where the arrayItemProperty is a path like /managed/alpha_user
        // if the string doesn't have slashes nothing will happen and the stringToTest will just be item[arrayItemProperty]
        const stringToTest = last(item[arrayItemProperty].split('/'));
        return stringToTest.indexOf(this.$store.state.realm) !== 0;
      });
    },
  },
};
</script>
