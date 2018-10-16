/* This file contains the functions used by the serviceworker to cache and display app files when offline.   */
/* The data for the app is fetched from a server and stored in IndexedDB, then fetched from IndexedDB when offline. */
/* Data functions are in DBHelper.js */

/* Create the cache and add resoources */

var cacheName = 'mws-restaurants-v1';

self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open(cacheName).then(function(cache) {
			return cache.addAll([
				'/',
				'/img',
				'index.html',
				'restaurant.html',
				'manifest.json',
				'/css/styles.css',
				'js/main.js',
				'js/dbhelper.js',
				'js/restaurant_info.js',
				'js/idb.js',
				//'sw.js'
			    //'normalize-css.googlecode.com/svn/trunk/normalize.css'
				//'https://fonts.googleapis.com/css?family=Roboto:300,400,500'
				]);
		})
	)
});



/* hijack the request and if offline, service the response from the cache */


self.addEventListener('fetch', function(event) {
	 /* if(hostname !== "localhost") {
		event.request.mode = "no-cors";
	} */
	event.respondWith(
		caches.match(event.request)
		.then(function(response) {
			if (response)
				return response;
			return fetch(event.request);
		})
	)

		//clone the request for subsequent fetch

		let fetchRequest = event.request.clone();

		return fetch(fetchRequest).then(
			function(response) {
				//check if valid response received
				if(!response || response.status !== 200 || response.type !== 'basic') {
					return response;
				}
			}
		//Clone the response
		let responseToCache = response.clone();

		caches.open(cacheName)
			.then(function(cache) {
				cache.put(event.request, responseToCache);
			})

		return response;

		//} //end return fetch
	//);
	)
	})
	//);
