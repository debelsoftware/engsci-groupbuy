const urlParams = new URLSearchParams(window.location.search);

const groupBuy = new GroupBuyPayment(sessionStorage.getItem("token"),urlParams.get("product"));

async function onGBClick(){
  orderID = await groupBuy.submitOrder();
  window.location = `../order?orderID=${orderID}`
}
