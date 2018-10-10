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
    })
    //.then(response => response.json()) - used when data in local json file
     .then(data => {
      //console.log('data', data);
      const restaurants = data;
      console.log('Restaurants', restaurants);
      callback(null, restaurants);
     })
     .catch(function () {      // if no restaurants from server, get restaurants from IDB
      console.log("You are offline");
      dbPromise.then(db => {
        const tx = db.transaction('restaurants','readwrite');
        const store = tx.objectStore('restaurants');
        return store.getAll();
        }).then(restaurants => {
        callback(null, restaurants);
        console.log('Rests', restaurants);
        })
      })
  }

/* added for stage 3 - reviews are served separately from restaurants */
    static fetchReviews(id, callback) {
    fetch("http://localhost:1337/reviews/?restaurant_id="+id)
    //fetch("http://localhost:1337/reviews/?restaurant-id=5")
     //./restaurant.html?id=${restaurant.id}
    .then(function(response) {
      return response.json();
    })
     //.then(data => {
      //const reviews = data;
      .then(reviews => {
        console.log('Reviews', reviews);
        dbPromise.then(db => {
          const tx = db.transaction('reviews', 'readwrite');
          const store = tx.objectStore('reviews');
          reviews.forEach(review => {
            console.log('putting reviews in IDB');
            store.put(review);
          })
        });
        callback(null , reviews);
      })
      /*
      console.log('Reviews', reviews);
      dbPromise.then(db => {
        const tx = db.transaction('reviews','readwrite');
        const reviewsStore = tx.objectStore('reviews');
        reviewsStore.put(review);
      }).then(reviews => {
      callback(null, reviews);
    }) */
     .catch(function () {
      console.log("Looks like a problem ...");
      console.log('reviews', reviews);
      dbPromise.then(db => {
        const tx = db.transaction('reviews','readwrite');
        const store = tx.objectStore('reviews');
      return store.getAll();
    }).then(reviews => {
      callback(null, reviews);
      })
    })

/*
      dbPromise.then(db => {
        const tx = db.transaction('reviews','readwrite');
        const reviewsStore = tx.objectStore('reviews');
        reviewsStore.put(review);
        return reviewsStore.getAll();
        }).then(reviews => {
        callback(null, reviews);
        console.log('Reviews', reviews);
     }) */
    //})
  }


  /*  From Medium article on using Jake's IDB file with suggestions from Slack user 'solittletime'
//class DBHelper { */
static openDatabase() {
  if (!navigator.serviceWorker) {
   return Promise.resolve();
  };

  return idb.open('restaurantsdb', 2, function(upgradeDB) {
    const store = upgradeDB.createObjectStore('restaurants', {keyPath: 'id'});
    store.createIndex('by-id', 'id' );
    DBHelper.addRestaurantstoIDB();
    const reviewsStore = upgradeDB.createObjectStore('reviews', {keyPath: 'id'});
    reviewsStore.createIndex('by-id', 'id' );
    DBHelper.addReviewstoIDB();
    const tempreviewsStore = upgradeDB.createObjectStore('tempreviews', {keyPath: 'id'});
    tempreviewsStore.createIndex('by-id', 'id');
    DBHelper.addTempreviewstoIDB();
  });

   //return idb.open('reviewsdb', 1, function(upgradeDB) {
    //const reviewsstore = upgradeDB.createObjectStore('reviews', {keyPath: 'id'});
    //reviewsstore.createIndex('restaurant', 'restaurant_id' );
    //DBHelper.addReviewstoIDB();
  //});
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

// Add reviews to IDB for offline

static addReviewstoIDB() {
  DBHelper.fetchReviews((error, reviews) => {
      if (error) {
        callback(error, null);
      } else {
          console.log('reviews', reviews);
          dbPromise.then(db => {
           const tx = db.transaction('reviews', 'readwrite');
           //const store = tx.objectStore('reviews');
           //const tx = db.transaction('restaurants', 'readwrite');
           const reviewsStore = tx.objectStore('reviews');
           reviews.forEach(function (review) {
            reviewsStore.put(review);
            });
           return tx.complete;
          });
        }
  });
}

// Add new reviews to temporary store in IDB for offline

static addTempreviewstoIDB(tempreviews) {
          console.log(tempreviews);
          dbPromise.then(db => {
           const tx = db.transaction('tempreviews', 'readwrite');
           //const store = tx.objectStore('reviews');
           //const tx = db.transaction('restaurants', 'readwrite');
           const tempreviewsStore = tx.objectStore('tempreviews');
           tempreviews.forEach(function (tempreview) {
            tempreviewsStore.put(tempreview);
            });
           return tx.complete;
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

//Add favorite symbol to restaurant object on the server - based on ideas from Elisa and Lorenzo's MWS project 3 walkthrough
  /*
  static updateFav(restaurant_id, isFavorite) {
    console.log('change status to:', status);
    fetch('http://localhost:1337/restaurants/${restaurant_id}/?is_favorite = ${isFavorite}' , {
      method: 'PUT'
    })
      .then( () => {
        console.log('changed');
        this.dbPromise()
        .then( () => {
          const tx = db.transaction('restaurants', 'readwrite');
          const restaurantsdb = tx.objectStore('restaurants');
          restaurantsdb.get(restaurant_id)
           .then(restaurant => {
            restaurant.is_favorite = isFavorite;
            restaurantsdb.put(restaurant);
           });
        })
      })
  } */

  static updateFav(id, status) {
    console.log('change status to:', status);
    //fetch("http://localhost:1337/restaurants/?restaurant.id="+id+"/?is_favorite="+status , {
    fetch("http://localhost:1337/restaurants/"+id+"/?is_favorite="+status , {
    /*
    fetch('http://localhost:1337/restaurants/${restaurant_id}/?is_favorite = ${isFavorite}' , { */
      method: 'PUT'
    })
    .then( () =>
    {
      this.dbPromise(db => {
        const tx = db.transaction('restaurants' , 'readwrite');
        const store = tx.objectStore('restaurants');
        restaurants.forEach(restaurant => {
          restaurant.is_favorite = status;
          store.put(restaurant);
        });
        return tx.complete;
      });
    }).catch(function () {
      dbPromise.then(db => {
        const tx = db.transaction('restaurants' , 'readwrite');
        const store = tx.objectStore('restaurants');
        return store.getAll();
      })
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

/**
  * Review page URL. mws3
  */
  //static urlForReviews(reviews) {
    //return ('./restaurant.html?id=${restaurant.id}')
  //}

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
