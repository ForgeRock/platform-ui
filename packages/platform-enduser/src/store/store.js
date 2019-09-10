/* eslint-disable import/prefer-default-export */
import Vue from 'vue';
import Vuex from 'vuex';
import User from './modules/User';
import Application from './modules/Application';

Vue.use(Vuex);

export default new Vuex.Store({
	modules: {
		UserStore: {
			namespaced: true,
			state: User.state,
			getters: User.getters,
			actions: User.actions,
			mutations: User.mutations,
		},
		ApplicationStore: {
			namespaced: true,
			state: Application.state,
			getters: Application.getters,
			actions: Application.actions,
			mutations: Application.mutations,
		},
	},
});
