// *****************************************
// Variables
// *****************************************
const urlParticipants =
  "https://mock-api.driven.com.br/api/v6/uol/participants";
const urlStatus = "https://mock-api.driven.com.br/api/v6/uol/status";
const urlMessages = "https://mock-api.driven.com.br/api/v6/uol/messages";

const userName = { name: "" };

const messageToSend = {
  from: "",
  to: "",
  text: "",
  type: "message", // "message" ou "private_message" para o bônus
};

let messages;
let participants;

const elementParticipants = document.querySelector(".list-participants");
const chat = document.querySelector("main");
const messageLabel = document.querySelector(".message-label");
messageLabel.innerHTML = "Enviando para Todos";

const typeOfMessage = {
  status: "message-status",
  message: "",
  private_message: "message-private",
};

let intervalLoginID;
let intervalMessagesGET;
let intervalParticipantsGET;

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
    <li onclick="selectParticipant(this)">
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

// *****************************************
// Functions for Actions from User
// *****************************************
function login(btn) {
  loadLoginScreen(btn);
  userName.name = document.getElementById("user-name").value;
  const promessLogin = axios.post(urlParticipants, userName);
  promessLogin.then(loginOK);
  promessLogin.catch(loginERROR);
}

function sendMessage() {
  const elementText = document.querySelector("#message-to-send");
  messageToSend.text = elementText.value;
  // console.log(messageToSend.text);
  const promessSendMessage = axios.post(urlMessages, messageToSend);
  promessSendMessage.then(sendMessageOK);
  promessSendMessage.catch(UserOnERROR);
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

  // Atualizar messageToSend.to
  messageToSend.to = selectedParticipant.querySelector("span").innerHTML;
  // console.log(messageToSend.to);

  // Atualiza rotulo
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

  // Atualizar messageToSend.type
  if (selectedVisibility.classList.contains("public")) {
    messageToSend.type = "message";
  } else {
    messageToSend.type = "private_message";
  }

  // Atualiza rotulo
  refreshLabelVisibiliy();
}

// *****************************************
// Functions to API
// *****************************************
function sendUserOnPOST() {
  const promessUserOn = axios.post(urlStatus, userName);
  promessUserOn.catch(UserOnERROR);
}

// Load Messagens
function loadMessagesGET() {
  const promessLoadMessages = axios.get(urlMessages);
  promessLoadMessages.then(loadMessagesOK);
}

// Load participants
function loadParticipantsGET() {
  const promessLoadParticipants = axios.get(urlParticipants);
  promessLoadParticipants.then(loadParticipantsOK);
}

//*****************************************
// Functions for API response
// ****************************************
// Login OK
function loginOK(response) {
  if (response.status === 200) {
    messageToSend.from = userName.name;
    loadChatScreen();
    intervalLoginID = setInterval(sendUserOnPOST, 5000);
    loadMessagesGET();
    intervalMessagesGET = setInterval(loadMessagesGET, 3000);
    loadParticipantsGET();
    intervalParticipantsGET = setInterval(loadParticipantsGET, 10000);
  }
}

// Login ERROR
function loginERROR(response) {
  if (response.response.status == 400) {
    alert("Usuário já exitente\nDigite um nome de usuário diferente");
  }
  // Recarrega tela de login
  loadLoginScreen();
}

function UserOnERROR(response) {
  if (response.response.status >= 400) {
    alert(
      "ERRO com o servidor!!!\nVocê será redirecionado para página inicial"
    );
    window.location.reload();
  }
}

function loadMessagesOK(response) {
  if (response.status === 200) {
    const tempMessages = response.data;
    // console.log(tempMessages);

    // Filtrar Mensagens
    messages = tempMessages.filter(
      (messageForUse) =>
        messageForUse.from === userName.name ||
        messageForUse.type === "message" ||
        messageForUse.type === "status" ||
        (messageForUse.type === "private_message" &&
          (messageForUse.to === "Todos" || messageForUse.to === userName.name))
    );
    // console.log(messages);

    // Render Chat
    chat.innerHTML = "";
    messages.forEach(refreshChat);
    refreshLabelVisibiliy();
    scrollChat();
  }
}

function sendMessageOK(response) {
  if (response.status === 200) {
    loadMessagesGET();
  }
}

function loadParticipantsOK(response) {
  if (response.status === 200) {
    participants = response.data;

    // participants.filter(select);

    participants.unshift({ name: "Todos" });

    // Destinatario iniical ou verifica ******se o destinatio ainda esta na sala
    if (messageToSend.to === "") {
      messageToSend.to = participants[0].name;
    }
    // console.log("\nNovaLIsta\n");
    // console.log(messageToSend.to);
  }
}
function refreshLabelVisibiliy() {
  let labelVisibiliy = "";
  if (messageToSend.type === "private_message") {
    labelVisibiliy = " (reservadamente)";
  }
  // console;
  messageLabel.innerHTML = `Enviando para ${messageToSend.to}${labelVisibiliy}`;
}

// Send whit enter Login
const inputUserName = document.getElementById("user-name");
// Execute a function when the user presses a key on the keyboard
inputUserName.addEventListener("keypress", function (event) {
  // If the user presses the "Enter" key on the keyboard
  if (event.key === "Enter") {
    // Cancel the default action, if needed
    //event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("btn-login").click();
  }
});

// Send whit enter Message
const inputMessage = document.getElementById("message-to-send");
// Execute a function when the user presses a key on the keyboard
inputMessage.addEventListener("keypress", function (event) {
  // If the user presses the "Enter" key on the keyboard
  if (event.key === "Enter") {
    // Cancel the default action, if needed
    //event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("btn-send-messagem").click();
  }
});
