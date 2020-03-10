function onSignIn(googleUser) {
  const profile = googleUser.getBasicProfile();
  sessionStorage.setItem('token', googleUser.getAuthResponse().id_token)
  sessionStorage.setItem('name', profile.getName());
  sessionStorage.setItem('email', profile.getEmail());
}

document.getElementById("run").addEventListener('click', function(){
  const productID = document.getElementById("product-input").value;
  window.location = `./payment?product=${productID}`
})
