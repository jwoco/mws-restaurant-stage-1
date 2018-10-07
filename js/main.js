let restaurants,
  neighborhoods,
  cuisines,
  reviews //add for stage 3
var map
var markers = []

/* Register service worker. Service worker functions are in sw.js file in this project. */

const registerServiceWorker = function() {
  if(!navigator.serviceWorker)return;

  navigator.serviceWorker.register('./sw.js').then(function(){
    console.log('Registration worked!');
  }).catch(function() {
    console.log('Registration failed!');
  });
};
registerServiceWorker();


/* Fetch reviews - added for stage 3 */

//DBHelper.fetchReviews();

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = "Photo of restaurant"
  li.append(image);

  const name = document.createElement('h3');
  name.innerHTML = restaurant.name;
  li.append(name);

  //create button for favorite - based on ideas from Elisa and Lorenzo's MWS project 3 walkthrough
  const favorite = document.createElement('button');
  favorite.innerHTML = '&#x2665';
  favorite.classList.add('fav_btn')
  //change status on fav
  /*
  favorite.onclick = function() {
    const isFav = !restaurant.is_favorite;
    const restaurant_id = restaurant.id;
    DBHelper.updateFav(restaurant_id, isFav);
    restaurant.is_favorite = !restaurant.is_favorite;

    changeFavElementClass(favorite); //removed first arg - favorite
    li.append(favorite);
 } */

 favorite.onclick = function () {
  const status = (restaurant.is_favorite.toString() === 'true') ? true:false;
  if (restaurant.is_favorite == 'undefined') {
    restaurant.is_favorite === false;
  }
  DBHelper.updateFav(restaurant.id , status);
  restaurant.is_favorite = !restaurant.is_favorite;
  if (restaurant.is_favorite === false) {
    //favorite.fav_btn.style.color = 'black';
    favorite.classList.remove('fav_btn');
    favorite.classList.add('fav_btn_no')
  } else if (restaurant.is_favorite === true) {
    //favorite.fav_btn.style.color = 'red';
    favorite.classlist.remove('fav_btn');
    favorite.classlist.remove('fav_btn_no');
    favorite.classlist.add('fav_btn_yes');
  }
  favorite.setAttribute('aria-label' , status);
 }

  li.append(favorite);


changeFavElementClass = (fav) => { //removed first arg - el
  if (!fav) {
    favorite.classlist.remove('fav_btn'); // replace el with favorite
    favorite.classlist.add('fav_btn_no');
    favorite.setAttribute('aria-label', 'mark as favorite');
  } else {
    console.log('toggle yes');
    favorite.classlist.remove('fav_btn');
    favorite.classlist.add('fav_btn_yes');
    favorite.setAttribute('aria-label', 'remove as favorite');
  }
}

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}
