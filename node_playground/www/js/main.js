$(function () {

	'use strict';


	var isDevice = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/);

	if(!isDevice) {
		/*require.config({
			paths: {
				adapters: 'fake'
			}
		});*/
	}


	function main() {
		$("body").load("html/dashboard.html");
	}
	
	
	if (isDevice) {
		document.addEventListener('deviceready', function() {

			// Clear the session when the app moves to background.
			document.addEventListener('pause', function() {
				//session.clear();
				main();
			}, false);
		}, false);
	} else {
		main();
	}
});
