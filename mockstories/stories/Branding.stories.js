import { storiesOf } from '@storybook/vue';
import Branding from '../mocks/foundations/Branding.vue';

storiesOf('Foundations|Branding', module)
    .add('Branding', () => ({
        components: { 'fr-branding': Branding },
        template: '<fr-branding></fr-branding>'
    }));
