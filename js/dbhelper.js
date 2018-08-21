/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    /*const port = 8000; // Change this to your server port */
    /* return "http://127.0.0.1:8000/data/restaurants.json"; //was set to localhost and in single quotes */
    return "http://localhost:1337/restaurants"; //pull from mws2-restaurants server
  }

/*  From Medium article on using Jake's IDB file with suggestions from Slack user 'solittletime'
//class DBHelper { */
static openDatabase() {
  if (!navigator.serviceWorker) {
   return Promise.resolve();
  }

  //return idb.open('mws2db', 1, function(upgradeDb) {
  //var keyValStore = upgradeDb.createObjectStore('keyval');
  //keyValStore.put('world','hello');
//});

  return idb.open('rr', 1, function(upgradeDB) {
    var store = upgradeDB.createObjectStore('restaurants', {
     keypath: 'id'
    });
    store.createIndex('by-id', 'id', );
  });
}
//}


  /**
   * Fetch all restaurants.
   */

/* Using XMLHttpRequest */
/*
  static fetchRestaurants(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL);

    console.log(xhr.responseText);

    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        console.log(xhr.status); // Log status for test
        const json = JSON.parse(xhr.responseText);
        console.log(json);
        const restaurants = json; // use for mws2
        /* const restaurants = json.restaurants; commented out for mws2 */
     /*  console.log(restaurants); // log status
        callback(null, restaurants);
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    };
    xhr.send();
  } */

  /* open db - from medium article on using Jake's idb file */
  // DbHelper.openDatabase();

/* Using Fetch */

static fetchRestaurants(callback) {
    fetch("http://localhost:1337/restaurants")
    .then(function(response) {
      return response.json()
    })
    //.then(response => response.json())
     .then(data => {
      console.log('data', data);
      const restaurants = data;
      console.log('Restaurants', restaurants);
      callback(null, restaurants);
     })
     //.then(addToRestaurants);
     //.then(response => console.log('Success:', response))
     // .then(function(addToRestaurants) {
     //   const restaurants = data;
    // })
    // console.log('Restaurants:', restaurants);
    //debugger;
  }

  /*  From Medium article on using Jake's IDB file */
//class DBHelper {
//static openDatabase() {
  //if (!navigator.serviceWorker) {
   // return Promise.resolve();
  //}

  //return idb.open('restsdb', 1, function(upgradeDb) {
  // var keyValStore = upgradeDb.createObjectStore('keyval');
  // keyValStore.put('world','hello');
//}).catch(error);

  //return idb.open('restsdb', 1, function(upgradeDB) {

  //  var store = upgradeDB.createObjectStore('restaurants', {
   //   keyPath: 'id'
   // });
   // store.createIndex('by-id', 'id', );
  //})
  //}
//}



/* open db - from medium article on using Jake's idb file */
  //const dbPromise = DbHelper.openDatabase();

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          console.log(restaurant);
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL. For mws2 - changed to " ./img ..." are images coming from local rather than from 1337 server??
   */
  static imageUrlForRestaurant(restaurant) {
    return (`./img/${restaurant.photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}

const dbPromise = DBHelper.openDatabase(); //why would this not run in sw.js ??
