const urlParams = new URLSearchParams(window.location.search);
document.getElementById('order-id').textContent = urlParams.get("orderID")

fetch('http://localhost:80/orderdetails', {
  method: 'POST',
  body: JSON.stringify({
    orderID: urlParams.get("orderID"),
    token: sessionStorage.getItem("token")
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
  console.log(jsonResponse);
  document.getElementById("product-id").textContent = jsonResponse.orderDetails.productID;
  if (jsonResponse.orderDetails.groupID == null) {
    document.getElementById("order-progress").value = jsonResponse.currentGroup;
    document.getElementById("order-progress").max = jsonResponse.requiredGroup;
    document.getElementById("order-progress-text").textContent = `${jsonResponse.currentGroup} / ${jsonResponse.requiredGroup}`
    document.getElementById("group-id").textContent = "Not enough people to form a group yet";
  }
  else {
    document.getElementById("order-progress").value = 100;
    document.getElementById("order-progress-text").textContent = "Group Completed"
    document.getElementById("group-id").textContent = jsonResponse.orderDetails.groupID;
  }
})
.catch(error => console.log(error));
