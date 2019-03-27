// global sort object
var sort_options = {
  options : [
    {
      id: 1,
      name: 'lowtohigh',
      sort_label: 'Low - High'
    },
    {
      id: 2,
      name: 'hightolow',
      sort_label: 'High - Low'
    }
  ]
};
// global variables
var cart_items = [];
var productsList;
var jsonObj;

// Method to load the app and initialize the required variables
function initializeApp() {

  // populating the global product list from the jsonObj obtained from data.js
  productsList = jsonObj.products.filter(product => product!=null);

  // if cached values are present, load the data from cache - delivery details
  if(localStorage.getItem('delivery_details')){
    let delDetails = JSON.parse(localStorage.getItem('delivery_details'));
    setDeliveryDetails(delDetails.name, delDetails.address, delDetails.postcode, delDetails.addlnotes);
  }

  // loading from cache - cart items
  if(localStorage.getItem('cart_items')){
    let cartItems = JSON.parse(localStorage.getItem('cart_items'));
    cart_items = cartItems;
  }

  // code to create the main list
  // clearing the exising old list in the UI
  let elem = document.getElementById('productsList');
  elem.innerHTML = '';
  // updating the count and count text based on cart items
  updateCount();
  updateCartText();
  // default sorting applied - low-high
  productsList = productsList.sort(function(a, b){return a.price - b.price});
  // logic to create the Product elements
  for(let i=0; i<productsList.length; i++){
    createProduct(productsList[i]['id'], productsList[i]['name'], productsList[i]['category'], productsList[i]['description'], productsList[i]['price'], productsList[i]['images']);
  }

  // code to create the category list
  let categories = jsonObj.categories;
  let catgryelem = document.getElementById('categoryList');
  catgryelem.innerHTML = '';
  for(let i=0; i<categories.length; i++){
    createCategory(categories[i]['id'], categories[i]['name']);
  }

  // code to create the sort list
  createSortList();

  // by default, sorting will be low to high
  document.getElementById('radio-lowtohigh').checked = true;

  // logic to calculate and display the grand total in the cart - use values from cache
  calculateTotal();

}


// method to create individual product row
function createProduct(id, name, category, description, price, images) {
    let imageList = '';
    let display = 'block'
    for(let i=0; i<images.length; i++){
      let imageElem = `<img class="icon-${id}" id="image-${id}-${images[i].id}" src="./${images[i].src}"
      style="width:100%;display:${display}">`;
      imageList += imageElem;
      display = 'none';
    }

    let product = `<div class="product-section category-${category}" id="${id}">
      <div class="icon">
        <button class="left-btn" onclick="moveLeft(${id})">L</button>
        ${imageList}
        <button class="right-btn" onclick="moveRight(${id})">R</button>
      </div>
      <div class="product-details">
        <div class="name">
          ${name}
        </div>
        <div class="category">
          ${category}
        </div>
        <div class="description">
          ${description}
        </div>
        <div class="quantity">

        </div>
        <div class="add-btn">
          <input type="button" value="Add to cart" onclick="addToCart(${id})">
        </div>
      </div>
      <div class="price">
        GBP ${price}
      </div>
  </div>`;

  // logic to append it to the DOM
  let elem = document.getElementById('productsList');
  elem.innerHTML += product;

}

// Method called when the R button is clicked in image slider
function moveRight(id){
  // first we have to get the selected item from products list
  let selectedItem;
  for(let j=0; j<productsList.length; j++){
    if(productsList[j].id == id){
      selectedItem = productsList[j];
      break;
    }
  }
  // get the total images length
  let imagesLength = selectedItem.images.length;
  // get the images from the dom
  let imageElements = document.getElementsByClassName(`icon-${id}`);
  let nextIndex = 0;
  // increment the index by 1 and display the image. Hide the already visible image
  for(let i=0; i<imageElements.length; i++){
    if(imageElements[i].style.display == 'block'){
      nextIndex = i+1;
      // if the last image is shown, reset the index
      if(nextIndex == imagesLength ){
        nextIndex = 0;
      }
      // hide the old image
      imageElements[i].style.display = 'none';
      // display the next image
      document.getElementById(`image-${id}-${nextIndex}`).style.display = 'block';
      break;
    }
  }

}

// Method called the image slider is moved left
function moveLeft(id){
  // get the selected item from products list
  let selectedItem;
  for(let j=0; j<productsList.length; j++){
    if(productsList[j].id == id){
      selectedItem = productsList[j];
      break;
    }
  }
  // get the images array length
  let imagesLength = selectedItem.images.length;
  let imageElements = document.getElementsByClassName(`icon-${id}`);
  let nextIndex = 0;
  // hide the visible image and show the next image
  for(let i=0; i<imageElements.length; i++){
    if(imageElements[i].style.display == 'block'){
      nextIndex = i-1;
      // if first image is reached, reset the index to last element
      if(nextIndex == -1 ){
        nextIndex = imagesLength - 1;
      }
      // hide the already visible image
      imageElements[i].style.display = 'none';
      // show the next image
      document.getElementById(`image-${id}-${nextIndex}`).style.display = 'block';
      break;
    }
  }

}

// method to create the categories list
function createCategory(id, name) {
  let category = `<li><label><input type="checkbox" class="category-check-box" name="${name}" value="${id}" onclick="filterProducts(${id})"/> ${name} </label></li>`;
  let elem = document.getElementById('categoryList');
  elem.innerHTML += category;
}

// Logic to create the Sort list in the left side panel
function createSortList() {
  let elem = document.getElementById('sortList');
  elem.innerHTML = '';
  let sortList = '';
  for(let i=0; i<sort_options.options.length; i++){
    sortList += `<li><label><input type="radio" class="category-radio-btn" id="radio-${sort_options.options[i].name}" name="sort" value="${sort_options.options[i].id}" onclick="sortProducts(${sort_options.options[i].id})"/> ${sort_options.options[i].sort_label} </label></li>`;
  }
  elem.innerHTML += sortList;
}

// Method to sort the products
function sortProducts(id){
  let selectedSort;
  // logic to find which sort is selected
  for(let i=0; i<sort_options.options.length; i++){
    if(id == sort_options.options[i].id){
      selectedSort = sort_options.options[i];
    }
  }

  // Logic to clear the products
  let elem = document.getElementById('productsList');
  elem.innerHTML = '';
  // sorting the products list
  if(selectedSort.name == 'lowtohigh'){
    productsList = productsList.sort(function(a, b){return a.price - b.price});
  } else {
    productsList = productsList.sort(function(a, b){return b.price - a.price});
  }
  // logic to display the sorted elements in the DOM
  for(let i=0; i<productsList.length; i++){
    createProduct(productsList[i]['id'], productsList[i]['name'], productsList[i]['category'], productsList[i]['description'], productsList[i]['price'], null);
  }

  // finally we have to call the filter products, so that existing filter is also applied with sorting
  filterProducts();

}

// method to filter the elements
function filterProducts(id) {

  let categories_dom = document.getElementsByClassName(`category-check-box`);
  let products_for_category = document.getElementsByClassName(`product-section`);

  // creating a new selected list - checked categories
  let selectedList = [];

  // check to find out whether all categories has been unselected
  for(let i=0; i<categories_dom.length; i++){
      if(categories_dom[i].checked){
        selectedList.push(categories_dom[i].value);
      }
  }
  // if nothing is selected, load all the products
  if(selectedList.length == 0){
    for(let i=0; i<products_for_category.length; i++){
      products_for_category[i].style.display = 'block';
    }
    return;
  } else {
    //  if something is selected, then first we have to hide all the elements
    for(let j=0; j<products_for_category.length; j++){
        products_for_category[j].style.display = 'none';
    }
  }

  // logic to display only the products that are part of the selected categories
  for(let i=0; i<selectedList.length; i++){
    for(let j=0; j<products_for_category.length; j++){
      if(products_for_category[j].classList.contains(`category-${selectedList[i]}`)) {
        products_for_category[j].style.display = 'block';
      }
    }
  }
}



// method to add a new product to cart
function addToCart(id) {
  let elem = productsList.filter((product) => (product.id == id))[0];
  // creating a new variable for calculating the price based on quantity
  elem.quantprice = elem.price;
  cart_items.push(elem);
  calculateTotal();
  updateCount();
  updateCartText();
  cacheCartItems();

}

// method to cache the cart items
function cacheCartItems() {
  localStorage.setItem('cart_items', JSON.stringify(cart_items));
}


// method to open the cart panel
function openNav() {
  document.getElementById("cart_panel").style.width = "540px";
  // delaying it by half a second so that DOM gets displayed after the panel opens
  setTimeout(function(){
    // method to add product to the cart
    createCartProduct();
    document.getElementById("outerWrapper").style.display = 'block';
  }, 500)
}

// Method called when a new product is added to the Cart
function createCartProduct() {
  // initially we have to clear the exising contents in the DOM
  let elem = document.getElementById('cartProductList');
  elem.innerHTML = '';
  if(cart_items.length == 0){

    elem.innerHTML += "<div class='cart-empty'>Cart is empty</span>";
    return;
  }
  for(let i=0; i<cart_items.length; i++){
    createCartModal(cart_items[i], i);
  }
}

// templating method to generate the Products in Cart
function createCartModal(obj, index){
  let cart_product = `<div class="cart-product">
    <div class="icon">
    <img src="./${obj.images[0].src}" style="width:100%;display:block">
    </div>
    <div class="product-dtls">
      <div class="name">${obj.name}</div>
      <div class="overall-price" id="quantprice-${obj.id}">Price : GBP ${obj.quantprice}</div>
      <div class="quantity">Quantity:<input id="quantity-cart-${obj.id}-${index}" min="0" max="10" count="1" type="number" value="1" onchange="quantityChanged(${obj.id}, ${index}, value)"></div>
      <div class="remove-product" onclick="removeProduct(${index})">Remove</div>
    </div>
  </div>`;

  // appending the product to the DOM
  let elem = document.getElementById('cartProductList');
  elem.innerHTML += cart_product;
}

// Method called whenever any quantity is changed in the Cart
function quantityChanged(id, index, val) {
  let selectedItem;
  selectedItem = cart_items[index];
  selectedItem.quantprice = Math.round(selectedItem.price * val *100)/100;
  updatePrice(id, selectedItem.quantprice);
  calculateTotal();
  // to cache the items in localStorage
  cacheCartItems();
}

// Method to calculate the grand total whenever the cart is updated
function calculateTotal() {
  let grandTotal = 0;
  for(let i=0; i<cart_items.length; i++){
    grandTotal = grandTotal + Number(cart_items[i].quantprice);
  }

  grandTotal = Math.round(grandTotal *100)/100;
  document.getElementById('grandTotal').innerHTML = `GBP ${grandTotal}`;
}

// Method called to update the Price when any new item is added or removed from cart
function updatePrice(id, price) {
  let elem = document.getElementById(`quantprice-${id}`);
  elem.innerHTML = `<span>Price : GBP ${price}</span>`;
}

// method to remove individual element from the cart
function removeProduct(index) {
  cart_items.splice(index, 1);
  createCartProduct();
  calculateTotal();
  updateCount();
  updateCartText();
  cacheCartItems();
  // if the cart_items object is empty, reset the grand total to 0
  if(cart_items.length == 0){
    document.getElementById('grandTotal').innerHTML = `GBP 0.00`;
  }
}

// Method to clear the Cart. Remove all the elements from cart_items obj
function clearCart() {
  cart_items.splice(0, cart_items.length);
  createCartProduct();
  calculateTotal();
  updateCount();
  updateCartText();
  cacheCartItems();
  // if the cart_items object is empty, reset the grand total to 0
  document.getElementById('grandTotal').innerHTML = `GBP 0.00`;
}

// Method to update the count next to the Cart icon
function updateCount() {
  document.getElementById('cartCount').innerHTML = `${cart_items.length}`;
}

// Method to update the count in Cart text { Cart - n items }
function updateCartText() {
  document.getElementById('cartText').innerHTML = `${cart_items.length}`;
}

// method to close the Cart panel
function closeNav() {
  document.getElementById("cart_panel").style.width = "0";
  document.getElementById("outerWrapper").style.display = 'none';
}



// Method to update the delivery details in the Cache
function updateDeliveryDetails() {
  let delObj = {
    name: document.getElementById('delName').value,
    address: document.getElementById('delAddress').value,
    postcode : document.getElementById('delPostcode').value,
    addlnotes: document.getElementById('delAddtlNotes').value
  }

  // call to save the value in localstorage
  localStorage.setItem('delivery_details', JSON.stringify(delObj));
}

// method to update the delivery details in the UI
function setDeliveryDetails(name, address, postcode, addtlNotes) {
  document.getElementById('delName').value = name;
  document.getElementById('delAddress').value = address;
  document.getElementById('delPostcode').value = postcode;
  document.getElementById('delAddtlNotes').value = addtlNotes;
}



// to load the app when the DOM is ready
$(document).ready(function(){
  // method to fetch the JSON from the data.js file
  $.getJSON( "data.js", function( json ) {
    // creating the global jsonObj
    jsonObj = json;
    // setting the object in cache
    localStorage.setItem('jsonObj', JSON.stringify(jsonObj));

    // call to initialize the app
    initializeApp();
  });
})
