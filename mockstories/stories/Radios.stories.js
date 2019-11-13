/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { storiesOf } from '@storybook/vue';
import Radios from '../mocks/components/Radios.vue';

storiesOf('Components-Mock|Radios', module)
    .add('Radios', () => ({
        components: { 'fr-radios': Radios },
        template: '<fr-radios></fr-radios>'
    }));
