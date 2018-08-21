/* This file contains the functions used by the serviceworker to display app when offline.   */

//importScripts('js/idb.js');


/* Create the cache and add resoources */

/* Retrieve cached files */

self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open('mws-restaurants-v1').then(function(cache) {
			return cache.addAll([
				//'/skeleton',
				'index.html',
				'restaurant.html',
				'/css/styles.css',
				'js/main.js',
				'js/dbhelper.js',
				'js/restaurant_info.js',
				'js/idb.js',
				'sw.js'
			    //'normalize-css.googlecode.com/svn/trunk/normalize.css',
				//'https://fonts.googleapis.com/css?family=Roboto:300,400,500'
				]);
		})
	);
});

/* Specify idb database schema */

//const dbPromise = DBHelper.openDatabase();

/* function createDB() {
  idb.open('test', 1, function(upgradeDB) {
    var store = upgradeDB.createObjectStore('beverages', {
      keypath: 'id'
    });
    store.put({id: 123, name: 'coke'});
  });
  //return store;
}

/* Open connection to idb database */

/* self.addEventListener('activate', function(event) {
	event.waitUntil(
		createDB()
		);
	console.log('db created');
});

/* hijack the request and if offline, service the response from the cache*/
self.addEventListener('fetch', function(event) {
	 //if(cacheUrlObj.hostname !== "localhost") {
	//	event.request.mode = "no-cors";
	//}
	event.respondWith(
		caches.match(event.request).then(function(response) {
			if (response) return response;
			return fetch(event.request);
		})
	);
})