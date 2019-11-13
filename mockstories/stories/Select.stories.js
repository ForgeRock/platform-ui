/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { storiesOf } from '@storybook/vue';
import Select from '../mocks/components/Select.vue';

storiesOf('Components-Mock|Select', module)
    .add('Select', () => ({
        components: { 'fr-select': Select },
        template: '<fr-select></fr-select>'
    }));
