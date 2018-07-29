/* This file contains the functions used by the serviceworker to display app when offline.   */

/* Create the cache and add resoources */

/* self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open('mws-restaurants-v1').then(function(cache) {
			return cache.addAll([
				'/',
				'index.html',
				'restaurant.html',
				'/css/styles.css',
				'data/restaurants.json',
				/* '/img/*.*', */
				/* 'js/main.js',
				'js/dbhelper.js',
				'js/restaurant_info.js',
				'sw.js',
			    'normalize-css.googlecode.com/svn/trunk/normalize.css',
				'https://fonts.googleapis.com/css?family=Roboto:300,400,500'
				]);
		})
	);
});  */

/* hijack the request and if offline, servce the response from the cache*/
self.addEventListener('fetch', function(event) {
	/* if(cacheUrlObj.hostname !== "localhost") {
		event.request.mode = "no-cors";
	} */
	event.respondWith(
		/* caches.match(event.request).then(function(response) */ {
			if (response) return response;
			return fetch(event.request);
		})
	);
});
