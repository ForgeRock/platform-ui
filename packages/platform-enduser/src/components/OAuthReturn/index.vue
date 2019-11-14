<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BContainer
    fluid
    class="h-100 px-0">
    <div class="h-100 d-flex">
      <div class="m-auto fr-center-card">
        <BounceLoader :color="loadingColor" />
      </div>
    </div>
  </BContainer>
</template>

<script>
import { each } from 'lodash';
import { BounceLoader } from 'vue-spinner/dist/vue-spinner.min';
import styles from '@/scss/main.scss';

/**
 * @description Return page used for oauth provider authentication. Will appropriately redirect a user to login or account claiming.
 *
 * @fires POST identityProviders?_action=handlePostAuth - Generates the token used for continuing the authentication process based off of the returned provider information
 * @fires POST authentication?_action=login - Uses data store token to establish a new user session
 */
export default {
  name: 'OAuthReturn',
  components: {
    BounceLoader,
  },
  data() {
    return {
      loadingColor: styles.basecolor,
    };
  },
  created() {
    const queryParams = {};

    each(this.$route.params.amData.replace('?', '').split('&'), (param) => {
      if (param.length > 0) {
        const parts = param.split('=');
        // eslint-disable-next-line prefer-destructuring
        queryParams[parts[0]] = parts[1];
      }
    });

    window.history.pushState('', '', window.location.pathname);

    this.$router.push({
      name: 'AccountClaiming',
      params: {
        clientToken: queryParams.clientToken,
        returnParams: queryParams.returnParams,
      },
    });
  },
};
</script>
