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

/* Using Fetch to get restaurant data from mws2 server */

static fetchRestaurants(callback) {
    fetch("http://localhost:1337/restaurants")
    .then(function(response) {
      return response.json()
    });
    //.then(response => response.json()) - used when data in local json file
     .then(data => {
      console.log('data', data);
      const restaurants = data;
      console.log('Restaurants', restaurants);
      callback(null, restaurants);
     }).catch(function () {      // if no restaurants from server, get restaurants from IDB
      console.log("You are offline");
      dbPromise.then(db => {
        const tx = db.transaction('restaurants','readwrite');
        const store = tx.objectStore('restaurants');
        return store.getAll();
        }).then(restaurants => {
        callback(null, restaurants);
        console.log('Rests', restaurants)
      });
     });
  }

  /*  From Medium article on using Jake's IDB file with suggestions from Slack user 'solittletime'
//class DBHelper { */
static openDatabase() {
  if (!navigator.serviceWorker) {
   return Promise.resolve();
  };

  return idb.open('restaurantsdb', 1, function(upgradeDB) {
    const store = upgradeDB.createObjectStore('restaurants', {keyPath: 'id'});
    store.createIndex('by-id', 'id' );
    DBHelper.addRestaurantstoIDB();
  });
}


static addRestaurantstoIDB() {
  DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        //restaurants => {
          dbPromise.then(db => {
           const tx = db.transaction('restaurants', 'readwrite');
           const store = tx.objectStore('restaurants');
           restaurants.forEach(function (restaurant) {
            store.put(restaurant);
            });
           return tx.complete;
          });
        }
  });
}


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
    //return (`./img/${restaurant.photograph}.jpg`);
      return (`/img/${restaurant.id}.jpg`);
  }

  /*
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
/* create variable to run and store IDB data */

const dbPromise = DBHelper.openDatabase(); //why would this not run in sw.js ??
