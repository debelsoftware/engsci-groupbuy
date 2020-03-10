const buttonContain = document.getElementById('gb-pay');
function renderButton(){
  const style = `
  :root{
    --button-color: #44b88d;
  }
  #gb-button{
    display: inline-block;
    vertical-align: middle;
    box-sizing: border-box;
    transition: all 0.3s;
    position: relative;
    height: 50px;
    background-color: var(--button-color);
    border-radius: 30px;
    width: 270px;
    padding: 5px 10px 5px 10px;
  }
  #gb-button:hover{
    cursor: pointer;
  }
  #gb-inner-text{
    display: inline-block;
    vertical-align: middle;
    position: absolute;
    left: 20px;
    top: 0;
    bottom: 0;
    font-family: sans-serif;
    color: white;
    font-weight: bold;
  }
  #gb-count{
    display: inline-block;
    vertical-align: middle;
    height: 30%;
    position: absolute;
    right: 20px;
    top: 0;
    bottom: 0;
    font-family: sans-serif;
    color: white;
    padding: 8px;
    margin: auto;
    font-weight: bold;
    border-radius: 30px;
    background: var(--button-color);
    box-shadow: inset 5px 5px 8px rgba(0, 0, 0, 0.2),
              inset -5px -5px 8px rgba(255,255,255,0.2);
  }
  #gb-info-button{
    position: relative;
    text-align: center;
    display: inline-block;
    vertical-align: middle;
    margin-left: 10px;
    width: 15px;
    height: 15px;
    font-family: serif;
    font-weight: bold;
    color: white;
    padding: 5px;
    border-radius: 100px;
    background-color: #a6a6a6;
  }
  #gb-info-button:hover{
    cursor: pointer;
  }
  #gb-info-button:hover #gb-info-box {
    visibility: visible;
  }
  #gb-info-box{
    visibility: hidden;
    width: 200px;
    background-color: rgba(0,0,0,0.7);
    color: white;
    text-align: left;
    padding: 10px;
    border-radius: 3px;
    position: absolute;
    left:-100px;
    z-index: 1;
    font-family: sans-serif;
    font-weight: normal;
  }`

  const infoBoxText = "Group buying allows you to get a reduced price by waiting until your order becomes part of a group"

  const css = document.createElement("style")
  css.type = "text/css"
  css.textContent = style
  document.head.appendChild(css)
  const button = document.createElement('div');
  button.id = 'gb-button'
  buttonContain.appendChild(button)
  document.getElementById('gb-button').addEventListener("click", onGBClick)

  const infoButton = document.createElement('p');
  infoButton.id = "gb-info-button";
  infoButton.textContent = "i";
  buttonContain.appendChild(infoButton)

  const infoBox = document.createElement('span');
  infoBox.id = "gb-info-box";
  infoBox.textContent = infoBoxText;
  document.getElementById('gb-info-button').appendChild(infoBox)

  const innerText = document.createElement('p');
  innerText.id = "gb-inner-text"
  innerText.textContent = "Pay with Group Buy";
  document.getElementById('gb-button').appendChild(innerText);

  const count = document.createElement('p');
  count.id = "gb-count"
  count.textContent = "---"
  document.getElementById('gb-button').appendChild(count)
}


class GroupBuyPayment {
  constructor(user,product) {
    renderButton();
    this.ref = document.getElementById("gb-pay");
    this.button = document.getElementById("gb-button");
    this.count = document.getElementById("gb-count");
    this.info = document.getElementById("gb-info-button");
    this.userToken = user;
    this.productID = product;
    this.updateCount()
  }
  updateCount(){
    const selfReference = this;
    fetch(`http://localhost:80/groupcount?productID=${this.productID}`)
    .then(
      function(response) {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }
        response.json().then(function(data) {
          selfReference.count.textContent = `${data.currentGroup} / ${data.requiredGroup}`
        });
      }
    )
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    });
  }
  submitOrder(){
    return fetch('http://localhost:80/submitorder', {
      method: 'POST',
      body: JSON.stringify({
        productID: this.productID,
        token: this.userToken,
      }),
      headers:{
        'Content-Type': 'application/json'
      }
    }).then(function(response) {
      if (response.status == 200){
        return response.json();
      }
      else {
        alert("failed to make purchase")
      }
    })
    .then(function(jsonResponse) {
      return jsonResponse.orderID
    })
    .catch(error => alert("An error occured while making purchase"));
  }
}
