
$(document).ready(function(){
  $.getJSON( "data.js", function( json ) {
    jsonObj = json;
    localStorage.setItem('jsonObj', JSON.stringify(jsonObj));
    initializeApp();
  });
})


// fetch("data.json")
//   .then(response => response.json())
//   .then(json => console.log(json));

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

var cart_items = [];
var productsList;
var jsonObj;

function initializeApp() {

  productsList = jsonObj.products.filter(product => product!=null);

  if(localStorage.getItem('delivery_details')){
    let delDetails = JSON.parse(localStorage.getItem('delivery_details'));
    setDeliveryDetails(delDetails.name, delDetails.address, delDetails.postcode, delDetails.addlnotes);
  }

  if(localStorage.getItem('cart_items')){
    let cartItems = JSON.parse(localStorage.getItem('cart_items'));
    cart_items = cartItems;
  }

  // code to create the main list
  let elem = document.getElementById('productsList');
  elem.innerHTML = '';
  updateCount();
  updateCartText();
  productsList = productsList.sort(function(a, b){return a.price - b.price});
  for(let i=0; i<productsList.length; i++){
    createProduct(productsList[i]['id'], productsList[i]['name'], productsList[i]['category'], productsList[i]['description'], productsList[i]['price'], null);
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
  document.getElementById('radio-lowtohigh').checked = true;

  calculateTotal();

}


// method to create the product row
function createProduct(id, name, category, description, price, image) {

    let product = `<div class="product-section category-${category}" id="${id}">
      <div class="icon"></div>
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
        $${price}
      </div>
  </div>`;

  let elem = document.getElementById('productsList');

  elem.innerHTML += product;

}


// method to create the categories list
function createCategory(id, name) {

    let category = `<li><label><input type="checkbox" class="category-check-box" name="${name}" value="${id}" onclick="filterProducts(${id})"/> ${name} </label></li>`;

  let elem = document.getElementById('categoryList');

  elem.innerHTML += category;

}


function createSortList() {
  let elem = document.getElementById('sortList');
  elem.innerHTML = '';
  let sortList = '';
  for(let i=0; i<sort_options.options.length; i++){
    sortList += `<li><label><input type="radio" class="category-radio-btn" id="radio-${sort_options.options[i].name}" name="sort" value="${sort_options.options[i].id}" onclick="sortProducts(${sort_options.options[i].id})"/> ${sort_options.options[i].sort_label} </label></li>`;
  }
  elem.innerHTML += sortList;
}

function sortProducts(id){
  let selectedSort;
  for(let i=0; i<sort_options.options.length; i++){
    if(id == sort_options.options[i].id){
      selectedSort = sort_options.options[i];
    }
  }


  // code to create the main list
  let elem = document.getElementById('productsList');
  elem.innerHTML = '';
  if(selectedSort.name == 'lowtohigh'){
    productsList = productsList.sort(function(a, b){return a.price - b.price});
  } else {
    productsList = productsList.sort(function(a, b){return b.price - a.price});
  }
  for(let i=0; i<productsList.length; i++){
    createProduct(productsList[i]['id'], productsList[i]['name'], productsList[i]['category'], productsList[i]['description'], productsList[i]['price'], null);
  }

  filterProducts();

}

function filterProducts(id) {

  let categories_dom = document.getElementsByClassName(`category-check-box`);
  let products_for_category = document.getElementsByClassName(`product-section`);
  let selectedList = [];

  // check to find out whether all categories has been unselected
  for(let i=0; i<categories_dom.length; i++){
      if(categories_dom[i].checked){
        selectedList.push(categories_dom[i].value);
      }
  }
  if(selectedList.length == 0){
    for(let i=0; i<products_for_category.length; i++){
      products_for_category[i].style.display = 'block';
    }
    return;
  } else {
    for(let j=0; j<products_for_category.length; j++){
        products_for_category[j].style.display = 'none';
    }
  }


  for(let i=0; i<selectedList.length; i++){
    for(let j=0; j<products_for_category.length; j++){
      if(products_for_category[j].classList.contains(`category-${selectedList[i]}`)) {
        products_for_category[j].style.display = 'block';
      }
    }
  }
}



function addToCart(id) {
  let elem = productsList.filter((product) => (product.id == id))[0];
  elem.quantprice = elem.price;
  cart_items.push(elem);
  calculateTotal();
  updateCount();
  updateCartText();
  cacheCartItems();

}

function cacheCartItems() {
  localStorage.setItem('cart_items', JSON.stringify(cart_items));
}


function openNav() {
  document.getElementById("cart_panel").style.width = "540px";
  setTimeout(function(){
    createCartProduct();
    document.getElementById("outerWrapper").style.display = 'block';
  }, 500)
}

function createCartProduct() {
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

function createCartModal(obj, index){
  let cart_product = `<div class="cart-product">
    <div class="icon"></div>
    <div class="product-dtls">
      <div class="name">${obj.name}</div>
      <div class="overall-price" id="quantprice-${obj.id}">Price : $${obj.quantprice}</div>
      <div class="quantity">Quantity:<input id="quantity-cart-${obj.id}-${index}" min="0" max="10" count="1" type="number" value="1" onchange="quantityChanged(${obj.id}, ${index}, value)"></div>
      <div class="remove-product" onclick="removeProduct(${index})">Remove</div>
    </div>
  </div>`;
  let elem = document.getElementById('cartProductList');
  elem.innerHTML += cart_product;
}

function quantityChanged(id, index, val) {
  let selectedItem;
  selectedItem = cart_items[index];
  selectedItem.quantprice = Math.round(selectedItem.price * val *100)/100;
  updatePrice(id, selectedItem.quantprice);
  calculateTotal();
  cacheCartItems();
}

function calculateTotal() {
  let grandTotal = 0;
  for(let i=0; i<cart_items.length; i++){
    grandTotal = grandTotal + Number(cart_items[i].quantprice);
  }

  grandTotal = Math.round(grandTotal *100)/100;
  document.getElementById('grandTotal').innerHTML = `$${grandTotal}`;
}

function updatePrice(id, price) {
  let elem = document.getElementById(`quantprice-${id}`);
  elem.innerHTML = `<span>Price : $${price}</span>`;
}

function removeProduct(index) {
  cart_items.splice(index, 1);
  createCartProduct();
  calculateTotal();
  updateCount();
  updateCartText();
  cacheCartItems();
  if(cart_items.length == 0){
    document.getElementById('grandTotal').innerHTML = `$0.00`;
  }
}

function clearCart() {
  cart_items.splice(0, cart_items.length);
  createCartProduct();
  calculateTotal();
  updateCount();
  updateCartText();
  cacheCartItems();
  if(cart_items.length == 0){
    document.getElementById('grandTotal').innerHTML = `$0.00`;
  }
}

function updateCount() {
  document.getElementById('cartCount').innerHTML = `${cart_items.length}`;
}

function updateCartText() {
  document.getElementById('cartText').innerHTML = `${cart_items.length}`;
}

function closeNav() {
  document.getElementById("cart_panel").style.width = "0";
  document.getElementById("outerWrapper").style.display = 'none';
}



function updateDeliveryDetails() {
  let delObj = {
    name: document.getElementById('delName').value,
    address: document.getElementById('delAddress').value,
    postcode : document.getElementById('delPostcode').value,
    addlnotes: document.getElementById('delAddtlNotes').value
  }

  localStorage.setItem('delivery_details', JSON.stringify(delObj));
}

function setDeliveryDetails(name, address, postcode, addtlNotes) {
  document.getElementById('delName').value = name;
  document.getElementById('delAddress').value = address;
  document.getElementById('delPostcode').value = postcode;
  document.getElementById('delAddtlNotes').value = addtlNotes;
}
//initializeApp();
