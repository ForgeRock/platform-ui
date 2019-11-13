/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { storiesOf } from '@storybook/vue';
import Typography from '../mocks/foundations/Typography.vue';

storiesOf('Foundations|Typography', module)
    .add('Typography', () => ({
        components: { 'typography': Typography },
        template: '<typography></typography>'
    }));
