// *****************************************
// Variables
// *****************************************
const urlParticipants =
  "https://mock-api.driven.com.br/api/v6/uol/participants";

const urlStatus = "https://mock-api.driven.com.br/api/v6/uol/status";
const urlMessages = "https://mock-api.driven.com.br/api/v6/uol/messages";

const userName = { name: "" };
let messages;

let intervalLoginID;
let intervalMessagesGET;

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

function refreshChat() {
  const chat = document.querySelector("main");
  chat.innerHTML = "";

  const typeOfMessage = {
    status: "message-status",
    message: "",
    private_message: "message-private",
  };

  for (let i = 0; i < messages.length; i++) {
    const messageFrom = messages[i].from;
    let messageTo = messages[i].to;
    const messageText = messages[i].text;
    const messageType = messages[i].type;
    const messageTime = messages[i].time;
    let hiddenText = "";

    if (messageType === "status") {
      hiddenText = "hidden";
    } else if (messageType === "private_message") {
      messageTo = "reservadamente para " + messageTo;
    } else {
      messageTo = "para " + messageTo;
    }
    chat.innerHTML += `
      <div class="box-message ${typeOfMessage[messageType]}">
      <span class="message-time">(${messageTime}) </span>
      <span class="message-from">${messageFrom} </span>
      <sapn class="message-to ${hiddenText}">${messageTo}: </sapn>
      <sapn class="message-text">${messageText} </sapn>
      </div>;
      `;
  }
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
function sendUserOnPOST() {
  const promessUserOn = axios.post(urlStatus, userName);
  promessUserOn.catch(errorUserOn);
}

// Load Messagens
function loadMessagesGET() {
  const promessLoadMessages = axios.get(urlMessages);
  promessLoadMessages.then(loadMessages);
}

//*****************************************
// Functions for API response
// ****************************************
// Login OK
function processLogin(response) {
  if (response.status === 200) {
    loadChatScreen();
    intervalLoginID = setInterval(sendUserOnPOST, 5000);
    loadMessagesGET();
    intervalMessagesGET = setInterval(loadMessagesGET, 3000);
  }
}

// Login ERROR
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

function loadMessages(response) {
  if (response.status === 200) {
    messages = response.data;
    refreshChat();
  }
}

// *****************************************
// Garbage
// *****************************************
// const promessLogin = axios.post(urlParticipants, userName);
// promessLogin.then(processLogin);
// promessLogin.catch(errorLogin)
