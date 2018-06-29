
/* This file contains the functions used by the serviceworker to display app when offline.   */
self.addEventListener('fetch', function (event) {
	console.log(event.request);
});
