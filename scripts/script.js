// *****************************************
// Constants
// *****************************************
// TIME
const UPDATE_CHAT = 3000;
const UPDATE_USER_ON = 5000;
const UPDATE_PARTICIPANTS = 10000;

// API URLs
const URL_PARTICIPANTS =
  "https://mock-api.driven.com.br/api/v6/uol/participants";
const URL_STATUS = "https://mock-api.driven.com.br/api/v6/uol/status";
const URL_MESSAGEN = "https://mock-api.driven.com.br/api/v6/uol/messages";

const REQ_OK = 200;
const REQ_ERROR = 400;

// Pages elements
const elementParticipants = document.querySelector(".list-participants");
const chat = document.querySelector("main");
const messageLabel = document.querySelector(".message-label");
messageLabel.innerHTML = "Enviando para Todos";

// Object
const typeOfMessage = {
  status: "message-status",
  message: "",
  private_message: "message-private",
};

// *****************************************
// Variables
// *****************************************

const userName = { name: "" };

const messageToSend = {
  from: "",
  to: "",
  text: "",
  type: "message",
};

let messages;
let participants;

let intervalLoginID;
let intervalMessagesGET;
let intervalParticipantsGET;

// *****************************************
// Functions for loading screens
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

  elementParticipants.innerHTML = ``;
  participants.forEach(loadParticipantsList);
}

function loadParticipantsList(participant) {
  let hideOrSelect = "hidden";
  if (participant.name === messageToSend.to) {
    hideOrSelect = "selected";
  }
  if (participant.name !== userName.name) {
    elementParticipants.innerHTML += `
    <li onclick="selectParticipant(this)" data-identifier="participant">
      <div class="box-li">
        <ion-icon name="person-circle"></ion-icon>
        <span>${participant.name}</span>            
      </div>
      <ion-icon name="checkmark" class="check ${hideOrSelect}"></ion-icon>
    </li>
    `;
  }
}

function refreshChat(message) {
  let messageTo = message.to;
  let hideOrNot = "";

  if (message.type === "status") {
    hideOrNot = "hidden";
  } else if (message.type === "private_message") {
    messageTo = `reservadamente para <span class="message-to">${messageTo}</span>`;
  } else {
    messageTo = `para <span class="message-to">${messageTo}</span>`;
  }
  chat.innerHTML += `
    <div class="box-message ${typeOfMessage[message.type]}">
      <span class="message-time">(${message.time}) </span>
      <span class="message-from">${message.from} </span>
      <span class="${hideOrNot}">${messageTo}: </span>
      <span class="message-text">${message.text} </span>
    </div>`;
}

// Auto Scroll
function scrollChat() {
  const lastElement = document.querySelector("main").lastChild;
  lastElement.scrollIntoView();
}

function refreshLabelVisibiliy() {
  let labelVisibiliy = "";
  if (messageToSend.type === "private_message") {
    labelVisibiliy = " (reservadamente)";
  }
  messageLabel.innerHTML = `Enviando para ${messageToSend.to}${labelVisibiliy}`;
}

// *****************************************
// Functions for user actions
// *****************************************
function login(btn) {
  loadLoginScreen(btn);
  userName.name = document.getElementById("user-name").value;
  const promessLogin = axios.post(URL_PARTICIPANTS, userName);
  promessLogin.then(loginOK);
  promessLogin.catch(loginERROR);
}

function sendMessage() {
  const elementText = document.querySelector("#message-to-send");
  messageToSend.text = elementText.value;
  const promessSendMessage = axios.post(URL_MESSAGEN, messageToSend);
  promessSendMessage.then(sendMessageOK);
  promessSendMessage.catch(chatERROR);
  elementText.value = "";
}

function selectParticipant(selectedParticipant) {
  const participantsList = selectedParticipant.parentElement;
  const oldSelected = participantsList.querySelector(".selected");
  oldSelected.classList.remove("selected");
  oldSelected.classList.add("hidden");
  const checkMark = selectedParticipant.querySelector(".check");
  checkMark.classList.remove("hidden");
  checkMark.classList.add("selected");

  // Update receiver name
  messageToSend.to = selectedParticipant.querySelector("span").innerHTML;

  // Update message label
  refreshLabelVisibiliy();
}

function visibilityMessages(selectedVisibility) {
  const visibilityList = selectedVisibility.parentElement;
  const oldSelected = visibilityList.querySelector(".selected");
  oldSelected.classList.remove("selected");
  oldSelected.classList.add("hidden");
  const checkMark = selectedVisibility.querySelector(".check");
  checkMark.classList.remove("hidden");
  checkMark.classList.add("selected");

  // Update message type
  if (selectedVisibility.classList.contains("public")) {
    messageToSend.type = "message";
  } else {
    messageToSend.type = "private_message";
  }

  /// Update message label
  refreshLabelVisibiliy();
}

// *****************************************
// Functions for API (GETs and POSTs)
// *****************************************
function sendUserOnPOST() {
  const promessUserOn = axios.post(URL_STATUS, userName);
  promessUserOn.catch(chatERROR);
}

// Load Messagens
function loadMessagesGET() {
  const promessLoadMessages = axios.get(URL_MESSAGEN);
  promessLoadMessages.then(loadMessagesOK);
  promessLoadMessages.catch(chatERROR);
}

// Load participants
function loadParticipantsGET() {
  const promessLoadParticipants = axios.get(URL_PARTICIPANTS);
  promessLoadParticipants.then(loadParticipantsOK);
  promessLoadParticipants.catch(chatERROR);
}

//*****************************************
// Functions for API response
// ****************************************
// Login OK
function loginOK(response) {
  if (response.status === REQ_OK) {
    messageToSend.from = userName.name;
    loadChatScreen();
    intervalLoginID = setInterval(sendUserOnPOST, UPDATE_USER_ON);
    loadMessagesGET();
    intervalMessagesGET = setInterval(loadMessagesGET, UPDATE_CHAT);
    loadParticipantsGET();
    intervalParticipantsGET = setInterval(
      loadParticipantsGET,
      UPDATE_PARTICIPANTS
    );
  }
}

// Login ERROR
function loginERROR(response) {
  if (response.response.status === REQ_ERROR) {
    alert("Usuário já exitente\nDigite um nome de usuário diferente");
  }
  loadLoginScreen();
}

// Chat ERROR
function chatERROR(response) {
  if (response.response.status >= REQ_ERROR) {
    alert(
      "ERRO com o servidor!!!\nVocê será redirecionado para página inicial"
    );
    window.location.reload();
  }
}

function loadMessagesOK(response) {
  if (response.status === REQ_OK) {
    const tempMessages = response.data;

    // Private messages filter
    messages = tempMessages.filter(
      (messageForUse) =>
        messageForUse.from === userName.name ||
        messageForUse.type === "message" ||
        messageForUse.type === "status" ||
        (messageForUse.type === "private_message" &&
          (messageForUse.to === "Todos" || messageForUse.to === userName.name))
    );

    // Refresh Chat
    chat.innerHTML = "";
    messages.forEach(refreshChat);
    refreshLabelVisibiliy();
    scrollChat();
  }
}

function sendMessageOK(response) {
  if (response.status === REQ_OK) {
    loadMessagesGET();
  }
}

function loadParticipantsOK(response) {
  if (response.status === REQ_OK) {
    participants = response.data;
    participants.unshift({ name: "Todos" });

    // Update receiver
    if (messageToSend.to === "") {
      messageToSend.to = participants[0].name;
    }
  }
}

//*****************************************
// Send whit enter
// ****************************************
// Send whit enter Login
const inputUserName = document.getElementById("user-name");
inputUserName.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    document.getElementById("btn-login").click();
  }
});

// Send whit enter Message
const inputMessage = document.getElementById("message-to-send");
inputMessage.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    document.getElementById("btn-send-messagem").click();
  }
});
