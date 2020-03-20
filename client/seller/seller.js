const urlParams = new URLSearchParams(window.location.search);
const productID = urlParams.get("product");
document.getElementById("search").addEventListener("click", function(){
  window.location = `../seller?product=${document.getElementById("product-id").value}`
});
document.getElementById("create-product").addEventListener("click", function(){
  document.getElementById('create-product-backdrop').style.display = "block"
});
document.getElementById("create-product-close-button").addEventListener("click", function(){
  document.getElementById('create-product-backdrop').style.display = "none"
});
document.getElementById("delete").addEventListener("click", deleteProduct);
document.getElementById("create-product-button").addEventListener("click", createProduct);


function deleteProduct(){
  if(confirm("ARE YOU SURE YOU WANT TO DELETE THIS PRODUCT. Clicking ok will delete this item")){
    fetch('http://localhost:80/admin/deleteproduct', {
      method: 'DELETE',
      body: JSON.stringify({
        productID: document.getElementById("product-id").value
      }),
      headers:{
        'Content-Type': 'application/json'
      }
    }).then(function(response) {
      if (response.status == 200){
        alert("product deleted");
      }
      else {
        alert("failed to delete product")
      }
    })
    .catch(error => console.log(error));
  }
}

if(productID != null && productID != ""){
  fetch('http://localhost:80/admin/orders', {
    method: 'POST',
    body: JSON.stringify({
      productID: productID,
    }),
    headers:{
      'Content-Type': 'application/json'
    }
  }).then(function(response) {
    if (response.status == 200){
      return response.json();
    }
    else {
      alert("failed to get order details")
    }
  })
  .then(function(jsonResponse) {
    for (let order of jsonResponse){
      let row = document.createElement('tr');
      let order_id = document.createElement('td');
      order_id.textContent = order.orderID;
      let platform_id = document.createElement('td');
      platform_id.textContent = order.platformID;
      let address = document.createElement('td');
      address.textContent = order.address;
      let product_id = document.createElement('td');
      product_id.textContent = order.productID;
      let created_time = document.createElement('td');
      created_time.textContent = order.orderTime;
      let group_id = document.createElement('td');
      group_id.textContent = order.groupID;
      row.appendChild(order_id);
      row.appendChild(platform_id);
      row.appendChild(address);
      row.appendChild(product_id);
      row.appendChild(created_time);
      row.appendChild(group_id);
      document.getElementById("order-table").appendChild(row)
    }
  })
  .catch(error => console.log(error));
  fetch('http://localhost:80/admin/groups', {
    method: 'POST',
    body: JSON.stringify({
      productID: productID,
    }),
    headers:{
      'Content-Type': 'application/json'
    }
  }).then(function(response) {
    if (response.status == 200){
      return response.json();
    }
    else {
      alert("failed to get group details")
    }
  })
  .then(function(jsonResponse) {
    for (let group of jsonResponse){
      let row = document.createElement('tr');
      let group_id = document.createElement('td');
      group_id.textContent = group.groupID;
      let product_id = document.createElement('td');
      product_id.textContent = group.productID;
      row.appendChild(group_id);
      row.appendChild(product_id);
      document.getElementById("group-table").appendChild(row)
    }
  })
  .catch(error => console.log(error));
}

function createProduct(){
  fetch('http://localhost:80/admin/createproduct', {
    method: 'POST',
    body: JSON.stringify({
      productID: document.getElementById("create-product-id").value,
      requiredGroup: parseInt(document.getElementById("create-product-group").value),
      price: parseFloat(document.getElementById("create-product-price").value)
    }),
    headers:{
      'Content-Type': 'application/json'
    }
  }).then(function(response) {
    if (response.status == 200){
      return response.json();
    }
    else {
      alert("failed to get group details")
    }
  })
  .then(function(jsonResponse) {
    if (jsonResponse.status != "done") {
      alert(jsonResponse.status)
    }
    else{
      document.getElementById('create-product-backdrop').style.display = "none"
      alert("product created")
    }
  })
  .catch(error => console.log(error));
}
