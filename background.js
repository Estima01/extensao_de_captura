console.log("Background script iniciado.");

chrome.webRequest.onCompleted.addListener(
  (details) => {
    console.log("Requisição capturada:", details);

    chrome.storage.local.get({ requests: [] }, (result) => {
      let requests = result.requests;
      requests.push({
        url: details.url,
        method: details.method,
        statusCode: details.statusCode,
        timeStamp: details.timeStamp
      });
      if (requests.length > 100) {
        requests.shift(); // Limita a quantidade de requisições armazenadas
      }
      chrome.storage.local.set({ requests: requests }, () => {
        console.log("Requisição armazenada:", requests);
      });
    });
  },
  { urls: ["<all_urls>"] }
);

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
