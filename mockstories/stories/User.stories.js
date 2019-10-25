import { storiesOf } from '@storybook/vue';
import User from '../mocks/templates/User.vue';

storiesOf('Templates|User', module)
    .add('User', () => ({
        components: { 'fr-user': User },
        template: '<fr-user></fr-user>'
    }));
