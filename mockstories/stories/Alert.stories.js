import { storiesOf } from '@storybook/vue';
import Alert from '../mocks/components/Alert.vue';

storiesOf('Components-Mock|Alert', module)
    .add('Alert', () => ({
        components: { 'fr-alert': Alert },
        template: '<fr-alert></fr-alert>'
    }));
