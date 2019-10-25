import { storiesOf } from '@storybook/vue';
import Modal from '../mocks/components/Modal.vue';

storiesOf('Components-Mock|Modal', module)
    .add('Modal', () => ({
        components: { 'fr-modal': Modal },
        template: '<fr-modal></fr-modal>'
    }));
