
/* This file contains the functions used by the serviceworker to display app when offline.   */

self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open('mws-restaurants-v1').then(function(cache) {
			return cache.addAll([
				'/',
				'index.html',
				'restaurant.html',
				'/css/styles.css',
				'js/main.js',
				'js/dbhelper.js',
				'js/restaurant_info.js'
				]);
		})
	);
});

 /* self.addEventListener('fetch', function(event) {
	event.respondWith(
		new Response('hell world')
		);
}); */
