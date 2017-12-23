// Session module based on HTML5 sessionStorage.
define(function() {

	'use strict';

	return {
		
		retrieve: function(key) {
		  return window.localStorage.getItem(key);
		},

		containsKey: function(key) {
		  return window.localStorage.getItem(key) !== null;
		},

		store: function(key, value) {
		  window.localStorage.setItem(key, value);
		},

		remove: function(key) {
		  window.localStorage.removeItem(key);
		},

		clear: function() {
		  window.localStorage.clear();
		}
	};
});
