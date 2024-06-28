console.log("Background script iniciado.");

// Função para capturar o corpo da requisição POST
function capturePostRequest(details) {
  console.log("Corpo da requisição capturado (POST):", details);

  chrome.storage.local.get({ requests: [] }, (result) => {
    let requests = result.requests;
    requests.push({
      url: details.url,
      method: details.method,
      requestBody: details.requestBody,
      timeStamp: details.timeStamp,
      statusCode: details.statusCode,
    });
    if (requests.length > 100) {
      requests.shift(); // Limita a quantidade de requisições armazenadas
    }
    chrome.storage.local.set({ requests: requests }, () => {
      console.log("Requisição armazenada:", requests);
    });
  });
}

// Listener para capturar requisições POST
chrome.webRequest.onBeforeRequest.addListener(
  capturePostRequest,
  { urls: ["https://admin.anota.ai/*"], types: ["xmlhttprequest"] },
  ["requestBody"]
);

// Listener para capturar requisições completadas
chrome.webRequest.onCompleted.addListener(
  (details) => {
    console.log("Requisição completada:", details);

    chrome.storage.local.get({ requests: [] }, (result) => {
      let requests = result.requests;
      for (let request of requests) {
        if (request.url === details.url && request.timeStamp === details.timeStamp) {
          request.statusCode = details.statusCode;
          break;
        }
      }
      chrome.storage.local.set({ requests: requests }, () => {
        console.log("Status da requisição atualizado:", requests);
      });
    });
  },
  { urls: ["https://admin.anota.ai/*"], types: ["xmlhttprequest"] }
);

// Listener para responder à mensagem para obter requisições
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getRequests") {
    console.log("Solicitação para obter requisições recebida.");
    chrome.storage.local.get({ requests: [] }, (result) => {
      console.log("Requisições recuperadas do armazenamento:", result.requests);
      sendResponse(result.requests);
    });
    return true; // Mantém o canal de mensagem aberto para resposta assíncrona
  }
});
