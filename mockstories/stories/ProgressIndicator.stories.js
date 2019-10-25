import { storiesOf } from '@storybook/vue';
import ProgressIndicator from '../mocks/components/ProgressIndicator.vue';

storiesOf('Components-Mock|Progress Indicator', module)
    .add('ProgressIndicator', () => ({
        components: { 'fr-progress-indicator': ProgressIndicator },
        template: '<fr-progress-indicator></fr-progress-indicator>'
    }));
