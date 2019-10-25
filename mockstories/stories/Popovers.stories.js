import { storiesOf } from '@storybook/vue';
import Popovers from '../mocks/components/Popovers.vue';

storiesOf('Components-Mock|Popovers', module)
    .add('Popovers', () => ({
        components: { 'fr-popovers': Popovers },
        template: '<fr-popovers></fr-popovers>'
    }));
