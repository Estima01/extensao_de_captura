document.addEventListener('DOMContentLoaded', function() {
    console.log("Popup carregado.");
    chrome.runtime.sendMessage({ action: "getRequests" }, function(response) {
      console.log("Requisições recebidas no popup:", response);
      const requestsTable = document.getElementById('requestsTable');
      requestsTable.innerHTML = ''; // Limpa a tabela antes de adicionar novas entradas
      response.forEach(request => {
        let row = document.createElement('tr');
  
        let urlCell = document.createElement('td');
        urlCell.textContent = request.url;
        row.appendChild(urlCell);
  
        let methodCell = document.createElement('td');
        methodCell.textContent = request.method;
        row.appendChild(methodCell);
  
        let statusCell = document.createElement('td');
        statusCell.textContent = request.statusCode;
        row.appendChild(statusCell);
  
        let timeCell = document.createElement('td');
        timeCell.textContent = new Date(request.timeStamp).toLocaleTimeString();
        row.appendChild(timeCell);
  
        requestsTable.appendChild(row);
      });
    });
  });
  