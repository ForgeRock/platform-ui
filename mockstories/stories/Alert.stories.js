/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { storiesOf } from '@storybook/vue';
import Alert from '../mocks/components/Alert.vue';

storiesOf('Components-Mock|Alert', module)
    .add('Alert', () => ({
        components: { 'fr-alert': Alert },
        template: '<fr-alert></fr-alert>'
    }));
