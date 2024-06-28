document.addEventListener('DOMContentLoaded', function () {
  const requestsTable = document.getElementById('requestsTable');
  const searchInput = document.getElementById('search');

  // Função para carregar e exibir as requisições
  function loadRequests(filter, searchQuery = '') {
    chrome.runtime.sendMessage({ action: "getRequests" }, function (response) {
      if (chrome.runtime.lastError) {
        console.error("Erro ao enviar mensagem: " + chrome.runtime.lastError.message);
        return;
      }

      requestsTable.innerHTML = ''; // Limpa a tabela

      response.forEach(request => {
        if ((filter === 'all' || request.method === filter) &&
            request.url.includes(searchQuery)) {
          const row = document.createElement('tr');

          const urlCell = document.createElement('td');
          urlCell.textContent = request.url;
          row.appendChild(urlCell);

          const methodCell = document.createElement('td');
          methodCell.textContent = request.method;
          row.appendChild(methodCell);

          const statusCell = document.createElement('td');
          statusCell.textContent = request.statusCode !== null ? request.statusCode : 'N/A';
          row.appendChild(statusCell);

          const timeCell = document.createElement('td');
          const date = new Date(request.timeStamp);
          timeCell.textContent = date.toLocaleString();
          row.appendChild(timeCell);

          const payloadCell = document.createElement('td');
          if (request.requestBody && request.requestBody.formData) {
            payloadCell.textContent = JSON.stringify(request.requestBody.formData);
          } else if (request.requestBody && request.requestBody.raw) {
            let rawData = '';
            request.requestBody.raw.forEach(part => {
              const decoder = new TextDecoder('utf-8');
              rawData += decoder.decode(new Uint8Array(part.bytes));
            });
            payloadCell.textContent = rawData;
          } else {
            payloadCell.textContent = 'N/A';
          }
          row.appendChild(payloadCell);

          requestsTable.appendChild(row);
        }
      });
    });
  }

  // Adiciona evento de clique nos botões de filtro
  const buttons = document.querySelectorAll('.filter-buttons button');
  buttons.forEach(button => {
    button.addEventListener('click', function () {
      const filter = this.getAttribute('data-filter');
      const searchQuery = searchInput.value;
      loadRequests(filter, searchQuery);
    });
  });

  // Adiciona evento de input no campo de pesquisa
  searchInput.addEventListener('input', function () {
    const filter = document.querySelector('.filter-buttons button.active').getAttribute('data-filter') || 'all';
    const searchQuery = searchInput.value;
    loadRequests(filter, searchQuery);
  });

  // Carrega todas as requisições por padrão
  loadRequests('all');
});
