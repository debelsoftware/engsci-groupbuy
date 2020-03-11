const urlParams = new URLSearchParams(window.location.search);
let groupBuy;

document.getElementById('proceed').addEventListener("click", function(){
  document.getElementById('addressInfo').style.display = "none";
  document.getElementById('payment-method').style.display = "block";
})

document.getElementById('card').addEventListener("click", function(){
  document.getElementById('payment-method').style.display = "none";
  document.getElementById('payment-options').style.display = "block";
  groupBuy = new GroupBuyPayment(urlParams.get("client"),sessionStorage.getItem("token"),urlParams.get("product"),sessionStorage.getItem("name"),document.getElementById('address').value);
})
document.getElementById('paypal').addEventListener("click", function(){
  document.getElementById('payment-method').style.display = "none";
  document.getElementById('payment-options').style.display = "block";
  groupBuy = new GroupBuyPayment(urlParams.get("client"),sessionStorage.getItem("token"),urlParams.get("product"),sessionStorage.getItem("name"),document.getElementById('address').value);
})

async function onGBClick(){
  orderID = await groupBuy.submitOrder();
  window.location = `../order?orderID=${orderID}`
}
