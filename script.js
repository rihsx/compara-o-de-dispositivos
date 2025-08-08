// Variável global para armazenar todos os notebooks carregados
let allNotebooks = [];

// Aguarda até que todo o DOM esteja carregado antes de executar o código
document.addEventListener('DOMContentLoaded', () => {
    // Faz uma requisição HTTP para buscar o arquivo JSON que contém os dados dos notebooks
    fetch('./data/notebooks.json')
        // Converte a resposta da requisição em um objeto JavaScript (JSON -> JS)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        // Quando os dados forem convertidos, armazena e exibe os notebooks
        .then(data => {
            allNotebooks = data; // Armazena todos os notebooks
            exibirNotebooks(allNotebooks); // Exibe todos inicialmente
            populateNotebookSelects(allNotebooks); // Popula os dropdowns de comparação
        })
        // Caso haja algum erro ao carregar ou converter o JSON, exibe no console
        .catch(error => console.error("Erro ao carregar JSON:", error));

    // Adiciona event listener para o filtro de perfil
    document.getElementById('profile-select').addEventListener('change', filterNotebooksByProfile);

    // Adiciona event listener para o botão de comparação
    document.getElementById('compare-button').addEventListener('click', compareSelectedNotebooks);

    // Adiciona event listener para o botão de voltar à lista
    document.getElementById('back-to-list-button').addEventListener('click', showNotebookList);
});

/**
 * Função responsável por exibir os notebooks na página.
 * @param {Array} notebooks - Um array de objetos notebook a serem exibidos.
 */
function exibirNotebooks(notebooks) {
    // Seleciona o elemento HTML onde os notebooks serão inseridos
    const container = document.getElementById('notebooks-container');
    container.innerHTML = ''; // Limpa o container antes de adicionar novos cards

    // Se não houver notebooks para exibir, mostra uma mensagem
    if (notebooks.length === 0) {
        container.innerHTML = '<p style="text-align: center; width: 100%;">Nenhum notebook encontrado para o perfil selecionado.</p>';
        return;
    }

    // Para cada notebook no array (lista), cria um card com suas informações
    notebooks.forEach(nb => {
        // Cria um elemento <div> que representará um "card" do notebook
        const card = document.createElement('div');
        // Define a classe CSS do card para aplicar estilos
        card.className = 'card';

        // Define o conteúdo HTML interno do card, usando template literals (``)
        card.innerHTML = `
            <img src="${nb.imagem}" alt="${nb.nome}">
            <div class="card-content">
                <h2>${nb.nome}</h2>
                <p>${nb.descricao}</p>
                <p><strong>Processador:</strong> ${nb.processador}</p>
                <p><strong>RAM:</strong> ${nb.ram}</p>
                <p><strong>SSD:</strong> ${nb.ssd}</p>
                <p><strong>Tela:</strong> ${nb.tela}</p>
                <p><strong>GPU:</strong> ${nb.gpu}</p>
                <p><strong>Sistema Operacional:</strong> ${nb.sistema_operacional}</p>

                <p><strong> Pontos Positivos:</strong></p>
                <ul class="lista">
                    ${nb.positivos.map(p => `<li>${p}</li>`).join('')}
                </ul>

                <p><strong> Pontos Negativos:</strong></p>
                <ul class="lista">
                    ${nb.negativos.map(n => `<li>${n}</li>`).join('')}
                </ul>

                <p class="perfil"> Perfil: ${nb.perfil.join(', ')}</p>
            </div>
        `;
        // Adiciona o card ao container principal na página
        container.appendChild(card);
    });
}

/**
 * Popula os dropdowns de seleção de notebooks para comparação.
 * @param {Array} notebooks - O array de todos os notebooks disponíveis.
 */
function populateNotebookSelects(notebooks) {
    const selectElements = document.querySelectorAll('.notebook-select');

    selectElements.forEach(select => {
        select.innerHTML = '<option value="">Selecione um Notebook</option>'; // Opção padrão
        notebooks.forEach(nb => {
            const option = document.createElement('option');
            option.value = nb.nome; // Usa o nome como valor para identificar
            option.textContent = nb.nome;
            select.appendChild(option);
        });
    });
}

/**
 * Filtra os notebooks exibidos com base no perfil selecionado.
 */
function filterNotebooksByProfile() {
    const selectedProfile = document.getElementById('profile-select').value;
    let filteredNotebooks = [];

    if (selectedProfile === 'todos') {
        filteredNotebooks = allNotebooks;
    } else {
        // Filtra notebooks cujo array 'perfil' inclui o perfil selecionado
        filteredNotebooks = allNotebooks.filter(nb => nb.perfil.includes(selectedProfile));
    }
    exibirNotebooks(filteredNotebooks); // Exibe os notebooks filtrados
    showNotebookList(); // Garante que a lista de notebooks esteja visível
}

/**
 * Compara os notebooks selecionados e exibe uma tabela comparativa.
 */
function compareSelectedNotebooks() {
    const select1 = document.getElementById('notebook-select-1').value;
    const select2 = document.getElementById('notebook-select-2').value;
    const select3 = document.getElementById('notebook-select-3').value;

    const selectedNames = [select1, select2, select3].filter(name => name !== ""); // Remove vazios

    if (selectedNames.length < 2) {
        alert("Por favor, selecione pelo menos dois notebooks para comparar.");
        return;
    }

    const notebooksToCompare = allNotebooks.filter(nb => selectedNames.includes(nb.nome));

    if (notebooksToCompare.length === 0) {
        alert("Nenhum notebook válido selecionado para comparação.");
        return;
    }

    // Esconde a lista de notebooks e mostra a tabela de comparação
    document.getElementById('notebooks-container').classList.add('hidden');
    document.getElementById('comparison-table-container').classList.remove('hidden');
    document.querySelector('.controls').classList.add('hidden'); // Esconde os controles também

    buildComparisonTable(notebooksToCompare);
}

/**
 * Constrói e exibe a tabela de comparação.
 * @param {Array} notebooks - Os notebooks a serem comparados.
 */
function buildComparisonTable(notebooks) {
    const tableHeaderRow = document.getElementById('table-header-row');
    const tableBody = document.getElementById('table-body');

    // Limpa a tabela anterior
    tableHeaderRow.innerHTML = '<th>Característica</th>';
    tableBody.innerHTML = '';

    // Adiciona os nomes dos notebooks ao cabeçalho da tabela
    notebooks.forEach(nb => {
        const th = document.createElement('th');
        th.textContent = nb.nome;
        tableHeaderRow.appendChild(th);
    });

    // Define as características a serem comparadas
    const characteristics = [
        { label: "Descrição", key: "descricao" },
        { label: "Processador", key: "processador" },
        { label: "RAM", key: "ram" },
        { label: "SSD", key: "ssd" },
        { label: "Tela", key: "tela" },
        { label: "GPU", key: "gpu" },
        { label: "Sistema Operacional", key: "sistema_operacional" },
        { label: "Pontos Positivos", key: "positivos", isList: true },
        { label: "Pontos Negativos", key: "negativos", isList: true },
        { label: "Perfil", key: "perfil", isList: true }
    ];

    // Adiciona as linhas de características ao corpo da tabela
    characteristics.forEach(char => {
        const tr = document.createElement('tr');
        const thChar = document.createElement('th');
        thChar.textContent = char.label;
        tr.appendChild(thChar);

        notebooks.forEach(nb => {
            const td = document.createElement('td');
            if (char.isList) {
                // Para listas (positivos, negativos, perfil), junta os itens com vírgula
                td.textContent = nb[char.key] ? nb[char.key].join(', ') : 'N/A';
            } else {
                td.textContent = nb[char.key] || 'N/A'; // Exibe 'N/A' se o valor for nulo/indefinido
            }
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

/**
 * Volta para a visualização da lista de notebooks e esconde a tabela de comparação.
 */
function showNotebookList() {
    document.getElementById('notebooks-container').classList.remove('hidden');
    document.getElementById('comparison-table-container').classList.add('hidden');
    document.querySelector('.controls').classList.remove('hidden'); // Mostra os controles novamente
}
