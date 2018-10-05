let restaurant;
let reviews // add for mws3
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  console.log('id', self.restaurant.id);
  // fill reviews
  //if (self.restaurant.id) {
  const id = self.restaurant.id;
  //  console.log(id);
  //DBHelper.fetchReviews(id);

  DBHelper.fetchReviews(id, (error, reviews) => {
    self.reviews = reviews;
    console.log("Reviews", reviews);
    if (!reviews) {
      console.error(error);
      return;
    }
    //fillReviewsHTML();
    fillReviewsHTML();
    //callback(null,review);
  });
  console.log("Reviews", reviews);
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviews) => { // change for mws3 from self.restaurants.reviews
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

//addReviewfromForm = function() {
  //if online, post to server


  //if offline :
  //createReviewHTML();
  //save to local storage and mark as pending
  //save to local storage
  //return review
//}

/* Use FormData to bind to create review form in restaurant.html) and listen for new review; and then post - from MDN Using Form Data bound to form element */

window.addEventListener("load", function () {
  function sendData() {
    var XHR = new XMLHttpRequest();

    var FD = new FormData(form);

    XHR.addEventListener("load", function(event) {
      alert(event.target.responseText);
    })
    var id = self.restaurant.id;
    XHR.open("POST", "http://localhost:1337/reviews/?restaurant_id="+id)

    XHR.send(FD);
    XHR.onreadystatechange = function() {
      if (this.status=400) {
        console.log("offline, saving review for re-post");
        //save review
      }
    }
  }

  var form = document.getElementById("myReview");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    //Add restaurant id to form data
    //console.log("rest id", self.restaurant.id);
    //form.append("restaurant_id", self.restaurant.id)

    sendData();
  });

  //.catch (if error, then createReviewHTML with the new review data and save to localStorage)

  //const data = [] => {
    //name = form.name,
    //rating = form.rating,
    //comments = form.comments
  //}
  //const name = form.name;

  //Format form data for display in app
  /*
  const review = [self.restaurant.id, form.name, form.rating, form.comments];
  console.log("New review", review);
  const json = JSON.stringify(review);
  console.log("New review json", json);
  createReviewHTML(json); */
})

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = ' '; //review.date;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
