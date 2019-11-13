/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { storiesOf } from '@storybook/vue';
import SignIn from '../mocks/templates/SignIn.vue';

storiesOf('Templates|Sign In', module)
    .add('Sign In', () => ({
        components: { 'fr-signin': SignIn },
        template: '<fr-signin></fr-signin>'
    }));
