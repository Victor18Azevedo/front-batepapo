// *****************************************
// Variables
// *****************************************
const urlParticipants =
  "https://mock-api.driven.com.br/api/v6/uol/participants";

const urlStatus = "https://mock-api.driven.com.br/api/v6/uol/status";

const userName = { name: "" };
let isLoggedIn = false;
let intervalLoginID;

// *****************************************
// Functions for Load Screens
// *****************************************
function loadLoginScreen(btn = document.querySelector(".btn-login")) {
  btn.classList.toggle("hidden");
  btn.nextElementSibling.classList.toggle("hidden");
  btn.previousElementSibling.classList.toggle("hidden");
}

function loadChatScreen() {
  document.querySelector(".container-login").classList.add("hidden");
  document.querySelector(".container-participants").classList.add("hidden");
  document.querySelector(".container-chat").classList.remove("hidden");
}

function loadParticipantsBar() {
  document.querySelector(".container-login").classList.add("hidden");
  document.querySelector(".container-participants").classList.remove("hidden");
}

// *****************************************
// Functions for Actions from User
// *****************************************
function login(btn) {
  loadLoginScreen(btn);

  userName.name = document.getElementById("user-name").value;
  const promessLogin = axios.post(urlParticipants, userName);
  promessLogin.then(processLogin);
  promessLogin.catch(errorLogin);
}

// *****************************************
// Functions to API
// *****************************************
function sendUserOn() {
  const promessUserOn = axios.post(urlStatus, userName);
  promessUserOn.catch(errorUserOn);
}

//*****************************************
// Functions for API response
// *****************************************
function processLogin(response) {
  if (response.status === 200) {
    loadChatScreen();
    isLoggedIn = true;
    intervalLoginID = setInterval(sendUserOn, 5000);
  }
}

function errorLogin(response) {
  if (response.response.status == 400) {
    alert("Usuário já exitente\nDigite um nome de usuário diferente");
  }
  // Recarrega tela de login
  loadLoginScreen();
}

function errorUserOn(response) {
  if (response.response.status >= 400) {
    // alert("ERRO com o servidor!!! vc será redirecionado à página principal");
    // // Recarrega tela de login
    // loadLoginScreen();
    console.log(response);
  }
}

// *****************************************
// Garbage
// *****************************************
// const promessLogin = axios.post(urlParticipants, userName);
// promessLogin.then(processLogin);
// promessLogin.catch(errorLogin)
