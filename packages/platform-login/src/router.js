import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'default',
      component: () => import('@/views/Login'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login'),
    },
    {
      path: '/service/:tree',
      name: 'service',
      component: () => import('@/views/Login'),
    },
  ],
});
