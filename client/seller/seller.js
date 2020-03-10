const urlParams = new URLSearchParams(window.location.search);
const productID = urlParams.get("product");
document.getElementById("search").addEventListener("click", function(){
  window.location = `../seller?product=${document.getElementById("product-id").value}`
})

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
      let product_id = document.createElement('td');
      product_id.textContent = order.productID;
      let created_time = document.createElement('td');
      created_time.textContent = order.orderTime;
      let group_id = document.createElement('td');
      group_id.textContent = order.groupID;
      row.appendChild(order_id);
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
