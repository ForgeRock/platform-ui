import { storiesOf } from '@storybook/vue';
import ProgressBar from '../mocks/components/ProgressBar.vue';

storiesOf('Components-Mock|Progress Bar', module)
    .add('ProgressBar', () => ({
        components: { 'fr-progress-bar': ProgressBar },
        template: '<fr-progress-bar></fr-progress-bar>'
    }));
