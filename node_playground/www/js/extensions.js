define(['jquery', 'lodash'], function ($, _) {

	'use strict';

	// Add custom methods to lodash.
	_.mixin({
		
	 // return a promise object with resolve.
	 resolve: function () {
             var d = $.Deferred();
	     d.resolve.apply(null, arguments);
	     return d.promise();
	 },

	 // return a promise object with reject.
	 reject: function () {
		var d = $.Deferred();
		d.reject.apply(null, arguments);
		return d.promise();
	 }
	 });
});
