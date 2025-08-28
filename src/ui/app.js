// /src/ui/app.js

// ==========================================================
// IMPORTAÇÕES
// ==========================================================
import { Biblioteca } from "../classes/Biblioteca.js";
import { BibliotecaService } from "../classes/BibliotecaService.js";
import { Autor } from "../classes/Autor.js";
import { Livro } from "../classes/Livro.js";
import { Exemplar } from "../classes/Exemplar.js";
import { UsuarioAluno } from "../classes/UsuarioAluno.js";
import { UsuarioProfessor } from "../classes/UsuarioProfessor.js";
import { UsuarioFuncionario } from "../classes/UsuarioFuncionario.js";
import { ImageManager } from "../classes/ImageManager.js";
import { Emprestimo } from "../classes/Emprestimo.js";
import { Reserva } from "../classes/Reserva.js";

// ==========================================================
// INSTÂNCIAS PRINCIPAIS E ELEMENTOS DO DOM
// ==========================================================
const biblioteca = Biblioteca.getInstance();
const bibliotecaService = new BibliotecaService();

// Elementos do DOM
const tabs = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const closeButton = document.querySelector(".close-button");

// ==========================================================
// VARIÁVEIS DE ESTADO
// ==========================================================
let currentEmprestimoFilter = "TODOS";
let sortState = {
  autores: { key: "id", dir: "asc" },
  livros: { key: "id", dir: "asc" },
  usuarios: { key: "id", dir: "asc" },
  emprestimos: { key: "id", dir: "asc" },
};

// ==========================================================
// GERENCIAMENTO DE MODAL E ABAS
// ==========================================================
/**
 * Exibe um modal com título e conteúdo HTML
 * @param {string} title - Título do modal
 * @param {string} formHtml - Conteúdo HTML do modal
 */
function showModal(title, formHtml) {
  modalTitle.textContent = title;
  modalBody.innerHTML = formHtml;
  modal.style.display = "flex";
}

// Event listeners para fechar o modal
closeButton.addEventListener("click", () => (modal.style.display = "none"));
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// Event listeners para alternar entre abas
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const tabId = tab.dataset.tab;

    // Remove a classe active de todas as abas e conteúdos
    tabContents.forEach((content) => content.classList.remove("active"));
    tabs.forEach((btn) => btn.classList.remove("active"));

    // Adiciona a classe active à aba e conteúdo selecionados
    document.getElementById(tabId).classList.add("active");
    tab.classList.add("active");

    // Executa a função correspondente à aba selecionada
    if (tabId === "dashboard") renderDashboard();
    if (tabId === "autores") listarAutores();
    if (tabId === "livros") listarLivros();
    if (tabId === "usuarios") listarUsuarios();
    if (tabId === "emprestimos") listarEmprestimos();
    if (tabId === "relatorios") exibirRelatorios();
  });
});

// ==========================================================
// FUNÇÕES GENÉRICAS DE TABELA E ORDENAÇÃO
// ==========================================================
/**
 * Cria uma tabela HTML com cabeçalhos e dados
 * @param {Array} headers - Array de objetos com texto e chave para ordenação
 * @param {Array} data - Dados a serem exibidos na tabela
 * @param {Function} renderRow - Função para renderizar cada linha
 * @param {string} tableId - ID da tabela para controle de ordenação
 * @returns {string} HTML da tabela
 */
function criarTabela(headers, data, renderRow, tableId) {
  if (!data || data.length === 0) {
    return "<p>Nenhum resultado encontrado.</p>";
  }

  const currentSort = sortState[tableId];

  // Cria os cabeçalhos da tabela com indicadores de ordenação
  const tableHeaders = `<tr>${headers
    .map((h) => {
      if (!h.key) {
        // Colunas não ordenáveis como Foto ou Ações
        return `<th>${h.text}</th>`;
      }
      const sortClass =
        currentSort.key === h.key
          ? currentSort.dir === "asc"
            ? "sort-asc"
            : "sort-desc"
          : "";
      return `<th class="sortable ${sortClass}" data-sort-key="${h.key}">${h.text}</th>`;
    })
    .join("")}</tr>`;

  // Cria as linhas da tabela
  const tableRows = data.map((item) => `<tr>${renderRow(item)}</tr>`).join("");

  return `<table class="data-table"><thead>${tableHeaders}</thead><tbody>${tableRows}</tbody></table>`;
}

/**
 * Ordena os dados com base na chave e direção especificadas
 * @param {Array} data - Dados a serem ordenados
 * @param {Object} sortInfo - Informações de ordenação {key, dir}
 * @returns {Array} Dados ordenados
 */
function handleSort(data, sortInfo) {
  const { key, dir } = sortInfo;
  if (!key) return data;

  data.sort((a, b) => {
    const valA = key.split(".").reduce((o, i) => (o ? o[i] : null), a);
    const valB = key.split(".").reduce((o, i) => (o ? o[i] : null), b);

    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;

    let comparison = 0;

    // Tratamento para datas que estão em formato string ISO
    if (key.toLowerCase().includes("data")) {
      comparison = new Date(valA) - new Date(valB);
    } else if (typeof valA === "number" && typeof valB === "number") {
      comparison = valA - valB;
    } else {
      comparison = String(valA).localeCompare(String(valB), "pt-BR", {
        sensitivity: "base",
      });
    }

    return dir === "asc" ? comparison : -comparison;
  });
}

/**
 * Manipula o clique em cabeçalhos de tabela para ordenação
 * @param {Event} e - Evento de clique
 * @param {string} tableId - ID da tabela
 * @param {Function} renderFunction - Função para re-renderizar a tabela
 */
function handleSortClick(e, tableId, renderFunction) {
  const key = e.target.closest("th")?.dataset.sortKey;
  if (!key) return;

  const currentSort = sortState[tableId];
  if (currentSort.key === key) {
    currentSort.dir = currentSort.dir === "asc" ? "desc" : "asc";
  } else {
    currentSort.key = key;
    currentSort.dir = "asc";
  }
  renderFunction();
}

// ==========================================================
// DASHBOARD (PÁGINA PRINCIPAL)
// ==========================================================
/**
 * Renderiza o dashboard com os livros disponíveis
 */
function renderDashboard() {
  const gridContainer = document.getElementById("dashboard-livros-grid");
  if (!gridContainer) return;

  const livros = biblioteca.getLivros();
  let cardsHtml = "";

  // Cria um card para cada livro
  livros.forEach((livro) => {
    const autor = biblioteca.buscarAutorPorId(livro.autorId);
    const exemplaresDoLivro = biblioteca
      .getExemplares()
      .filter((ex) => ex.livroId === livro.id);
    const exemplaresDisponiveis = exemplaresDoLivro.filter(
      (ex) => ex.obterStatus() === "DISPONÍVEL"
    ).length;

    const disponibilidadeClass =
      exemplaresDisponiveis > 0 ? "disponivel" : "indisponivel";
    const disponibilidadeTexto =
      exemplaresDisponiveis > 0
        ? `${exemplaresDisponiveis} disponíveis`
        : "Indisponível";

    cardsHtml += `
      <div class="livro-card">
        <img src="${
          livro.capaUrl || biblioteca.obterImagemPadrao("livro")
        }" alt="Capa do livro ${livro.titulo}" class="livro-card-capa">
        <div class="livro-card-info">
          <h3>${livro.titulo}</h3>
          <p>por ${autor ? autor.nome : "Desconhecido"}</p>
          <div class="livro-card-disponibilidade">
            <span class="${disponibilidadeClass}">${disponibilidadeTexto}</span>
          </div>
        </div>
        <div class="livro-card-actions">
          <button class="btn btn-primary btn-emprestar-dash" data-livro-id="${
            livro.id
          }" ${exemplaresDisponiveis === 0 ? "disabled" : ""}>
            Emprestar
          </button>
        </div>
      </div>
    `;
  });

  gridContainer.innerHTML =
    cardsHtml || "<p>Nenhum livro cadastrado no sistema.</p>";

  // Adiciona event listeners aos botões de empréstimo
  document.querySelectorAll(".btn-emprestar-dash").forEach((button) => {
    button.addEventListener("click", (e) => {
      const livroId = parseInt(e.target.dataset.livroId);
      abrirModalEmprestimoDashboard(livroId);
    });
  });
}

/**
 * Abre o modal de empréstimo a partir do dashboard
 * @param {number} livroId - ID do livro a ser emprestado
 */
function abrirModalEmprestimoDashboard(livroId) {
  const livro = biblioteca.buscarLivroPorId(livroId);
  const usuarios = biblioteca.getUsuarios().filter((u) => u.status === "ATIVO");
  const exemplaresDisponiveis = biblioteca
    .getExemplares()
    .filter(
      (ex) => ex.livroId === livroId && ex.obterStatus() === "DISPONÍVEL"
    );

  if (!livro || exemplaresDisponiveis.length === 0) {
    alert("Não há exemplares disponíveis para este livro.");
    return;
  }

  const exemplarIdParaEmprestar = exemplaresDisponiveis[0].id;

  // Cria opções de usuários para o select
  const usuariosOptions = usuarios
    .map(
      (u) =>
        `<option value="${u.id}">${u.nome} (Matrícula: ${u.matricula})</option>`
    )
    .join("");

  const modalHtml = `
    <form id="form-emprestimo-dash">
      <h3>Empréstimo Rápido</h3>
      <p><strong>Livro:</strong> ${livro.titulo}</p>
      <div class="form-group">
        <label for="dash-usuario-select">Selecione o Usuário:</label>
        <select id="dash-usuario-select" required>${usuariosOptions}</select>
      </div>
      <button type="submit" class="btn btn-primary">Confirmar Empréstimo</button>
    </form>
  `;

  showModal("Realizar Empréstimo", modalHtml);

  // Event listener para o formulário de empréstimo
  document
    .getElementById("form-emprestimo-dash")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      const usuarioId = parseInt(
        document.getElementById("dash-usuario-select").value
      );

      try {
        bibliotecaService.realizarEmprestimo(
          exemplarIdParaEmprestar,
          usuarioId
        );
        alert("Empréstimo realizado com sucesso!");
        modal.style.display = "none";
        renderDashboard();
        listarEmprestimos();
      } catch (error) {
        alert(`Erro ao realizar empréstimo: ${error.message}`);
      }
    });
}

// ==========================================================
// GESTÃO DE AUTORES
// ==========================================================
// Inicializa a aba de autores
const autoresTab = document.getElementById("autores");
autoresTab.innerHTML = `
    <h2>Gestão de Autores</h2>
    <div class="busca-container">
        <input type="text" id="busca-autor" class="caixa-busca" placeholder="Buscar por Nome ou ID do Autor...">
    </div>
    <br>
    <div class="actions">
        <button id="btn-cadastrar-autor" class="btn btn-primary">Cadastrar Novo Autor</button>
    </div>
    <div id="autores-list"></div>
`;

/**
 * Lista os autores na tabela
 */
function listarAutores() {
  const termoBusca = document.getElementById("busca-autor").value || "";
  const autoresListDiv = document.getElementById("autores-list");
  let autores = biblioteca.getAutores();

  // Filtra autores pelo termo de busca
  if (termoBusca) {
    const termo = termoBusca.toLowerCase();
    autores = autores.filter(
      (autor) =>
        autor.nome.toLowerCase().includes(termo) ||
        String(autor.id).includes(termo)
    );
  }

  // Ordena os autores
  handleSort(autores, sortState.autores);

  // Configura os cabeçalhos da tabela
  const headers = [
    { text: "ID", key: "id" },
    { text: "Nome", key: "nome" },
    { text: "Nacionalidade", key: "nacionalidade" },
    { text: "Data de Nasc.", key: "dataNascimento" },
    { text: "Foto", key: null },
    { text: "Ações", key: null },
  ];

  // Cria a tabela de autores
  const tableHtml = criarTabela(
    headers,
    autores,
    (autor) => {
      return `
        <td>${autor.id}</td>
        <td>${autor.nome}</td>
        <td>${autor.nacionalidade}</td>
        <td>${new Date(autor.dataNascimento).toLocaleDateString("pt-BR", {
          timeZone: "UTC",
        })}</td>
        <td><img src="${
          autor.fotoUrl || biblioteca.obterImagemPadrao("autor")
        }" alt="Foto de ${autor.nome}" style="width: 50px;"></td>
        <td>
            <button class="btn btn-secondary btn-sm btn-alterar-autor" data-id="${
              autor.id
            }">Alterar</button>
            <button class="btn btn-danger btn-sm btn-excluir-autor" data-id="${
              autor.id
            }">Excluir</button>
        </td>
    `;
    },
    "autores"
  );

  autoresListDiv.innerHTML = tableHtml;

  // Adiciona event listeners para ordenação e ações
  autoresListDiv
    .querySelector("thead")
    ?.addEventListener("click", (e) =>
      handleSortClick(e, "autores", listarAutores)
    );

  autoresListDiv.querySelectorAll(".btn-alterar-autor").forEach((button) => {
    button.addEventListener("click", (e) =>
      showFormularioAlterarAutor(parseInt(e.target.dataset.id))
    );
  });

  autoresListDiv.querySelectorAll(".btn-excluir-autor").forEach((button) => {
    button.addEventListener("click", (e) =>
      excluirAutor(parseInt(e.target.dataset.id))
    );
  });
}

// Event listener para cadastrar novo autor
document.getElementById("btn-cadastrar-autor").addEventListener("click", () => {
  const form = `
        <form id="form-autor">
            <div class="form-group"><label for="autor-nome">Nome:</label><input type="text" id="autor-nome" required></div>
            <div class="form-group"><label for="autor-nacionalidade">Nacionalidade:</label><input type="text" id="autor-nacionalidade" required></div>
            <div class="form-group"><label for="autor-data-nascimento">Data de Nasc.:</label><input type="date" id="autor-data-nascimento" required></div>
            <div class="form-group"><label for="autor-foto">Foto:</label><input type="file" id="autor-foto" accept="image/*"></div>
            <button type="submit" class="btn btn-primary">Salvar Autor</button>
        </form>
    `;
  showModal("Cadastrar Autor", form);

  // Event listener para o formulário de autor
  document
    .getElementById("form-autor")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const nome = document.getElementById("autor-nome").value;
      const nacionalidade = document.getElementById(
        "autor-nacionalidade"
      ).value;
      const dataNascimento = document.getElementById(
        "autor-data-nascimento"
      ).value;
      const fotoArquivo = document.getElementById("autor-foto").files[0];

      try {
        const fotoUrl = fotoArquivo
          ? await ImageManager.fazerUploadImagem(fotoArquivo)
          : biblioteca.obterImagemPadrao("autor");
        const novoAutor = new Autor(
          nome,
          nacionalidade,
          dataNascimento,
          fotoUrl
        );
        biblioteca.adicionarAutor(novoAutor);
        alert("Autor cadastrado com sucesso!");
        modal.style.display = "none";
        listarAutores();
      } catch (error) {
        alert("Erro ao cadastrar autor: " + error.message);
      }
    });
});

/**
 * Exibe o formulário para alterar um autor
 * @param {number} autorId - ID do autor a ser alterado
 */
function showFormularioAlterarAutor(autorId) {
  const autor = biblioteca.buscarAutorPorId(autorId);
  if (!autor) {
    alert("Autor não encontrado.");
    return;
  }

  const form = `
        <form id="form-alterar-autor">
            <input type="hidden" id="autor-id" value="${autor.id}">
            <div class="form-group"><label for="autor-nome">Nome:</label><input type="text" id="autor-nome" value="${autor.nome}" required></div>
            <div class="form-group"><label for="autor-nacionalidade">Nacionalidade:</label><input type="text" id="autor-nacionalidade" value="${autor.nacionalidade}" required></div>
            <div class="form-group"><label for="autor-data-nascimento">Data de Nasc.:</label><input type="date" id="autor-data-nascimento" value="${autor.dataNascimento}" required></div>
            <div class="form-group"><label for="autor-foto">Foto:</label><input type="file" id="autor-foto" accept="image/*"></div>
            <button type="submit" class="btn btn-primary">Salvar Alterações</button>
        </form>
    `;
  showModal("Alterar Autor", form);

  // Event listener para o formulário de alteração
  document
    .getElementById("form-alterar-autor")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const nome = document.getElementById("autor-nome").value;
      const nacionalidade = document.getElementById(
        "autor-nacionalidade"
      ).value;
      const dataNascimento = document.getElementById(
        "autor-data-nascimento"
      ).value;
      const fotoArquivo = document.getElementById("autor-foto").files[0];

      try {
        let fotoUrl = autor.fotoUrl;
        if (fotoArquivo) {
          fotoUrl = await ImageManager.fazerUploadImagem(fotoArquivo);
        }

        biblioteca.alterarAutor(
          autorId,
          nome,
          nacionalidade,
          dataNascimento,
          fotoUrl
        );
        alert("Autor alterado com sucesso!");
        modal.style.display = "none";
        listarAutores();
      } catch (error) {
        alert("Erro ao alterar autor: " + error.message);
      }
    });
}

/**
 * Exclui um autor após confirmação
 * @param {number} autorId - ID do autor a ser excluído
 */
function excluirAutor(autorId) {
  if (confirm("Tem certeza que deseja excluir este autor?")) {
    try {
      biblioteca.excluirAutor(autorId);
      alert("Autor excluído com sucesso!");
      listarAutores();
    } catch (error) {
      alert("Erro ao excluir autor: " + error.message);
    }
  }
}

// ==========================================================
// GESTÃO DE LIVROS
// ==========================================================
// Inicializa a aba de livros
const livrosTab = document.getElementById("livros");
livrosTab.innerHTML = `
    <h2>Gestão de Livros</h2>
    <div class="busca-container">
        <input type="text" id="busca-livro" class="caixa-busca" placeholder="Buscar por Título, Autor, ISBN ou ID do Livro...">
    </div>
    <br>
    <div class="actions">
        <button id="btn-cadastrar-livro" class="btn btn-primary">Cadastrar Novo Livro</button>
    </div>
    <div id="livros-list"></div>
`;

/**
 * Lista os livros na tabela
 */
function listarLivros() {
  const termoBusca = document.getElementById("busca-livro").value || "";
  const livrosListDiv = document.getElementById("livros-list");
  let livros = biblioteca.getLivros().map((livro) => {
    const autor = biblioteca.buscarAutorPorId(livro.autorId);
    return {
      ...livro.toJSON(),
      nomeAutor: autor ? autor.nome : "Desconhecido",
    };
  });

  // Filtra livros pelo termo de busca
  if (termoBusca) {
    const termo = termoBusca.toLowerCase();
    livros = livros.filter(
      (livro) =>
        livro.titulo.toLowerCase().includes(termo) ||
        livro.nomeAutor.toLowerCase().includes(termo) ||
        livro.isbn.toLowerCase().includes(termo) ||
        String(livro.id).includes(termo)
    );
  }

  // Ordena os livros
  handleSort(livros, sortState.livros);

  // Configura os cabeçalhos da tabela
  const headers = [
    { text: "ID", key: "id" },
    { text: "Capa", key: null },
    { text: "Título", key: "titulo" },
    { text: "Autor", key: "nomeAutor" },
    { text: "ISBN", key: "isbn" },
    { text: "Exemplares", key: null },
    { text: "Ações", key: null },
  ];

  // Cria a tabela de livros
  const tableHtml = criarTabela(
    headers,
    livros,
    (livro) => {
      const exemplaresDoLivro = biblioteca
        .getExemplares()
        .filter((ex) => ex.livroId === livro.id);
      const exemplaresDisponiveis = exemplaresDoLivro.filter(
        (ex) => ex.obterStatus() === "DISPONÍVEL"
      ).length;
      return `
            <td>${livro.id}</td>
            <td><img src="${
              livro.capaUrl || biblioteca.obterImagemPadrao("livro")
            }" alt="Capa de ${livro.titulo}" style="width: 50px;"></td>
            <td>${livro.titulo}</td>
            <td>${livro.nomeAutor}</td>
            <td>${livro.isbn}</td>
            <td>${exemplaresDisponiveis} / ${exemplaresDoLivro.length}</td>
            <td>
                <button class="btn btn-secondary btn-sm btn-alterar-livro" data-id="${
                  livro.id
                }">Alterar</button>
                <button class="btn btn-danger btn-sm btn-excluir-livro" data-id="${
                  livro.id
                }">Excluir</button>
                <button class="btn btn-info btn-sm btn-exemplares-livro" data-id="${
                  livro.id
                }">Exemplares</button>
            </td>
        `;
    },
    "livros"
  );
  livrosListDiv.innerHTML = tableHtml;

  // Adiciona event listeners para ordenação e ações
  livrosListDiv
    .querySelector("thead")
    ?.addEventListener("click", (e) =>
      handleSortClick(e, "livros", listarLivros)
    );

  livrosListDiv.querySelectorAll(".btn-alterar-livro").forEach((button) => {
    button.addEventListener("click", (e) =>
      showFormularioAlterarLivro(parseInt(e.target.dataset.id))
    );
  });

  livrosListDiv.querySelectorAll(".btn-excluir-livro").forEach((button) => {
    button.addEventListener("click", (e) =>
      excluirLivro(parseInt(e.target.dataset.id))
    );
  });

  livrosListDiv.querySelectorAll(".btn-exemplares-livro").forEach((button) => {
    button.addEventListener("click", (e) =>
      showFormularioAdicionarExemplar(parseInt(e.target.dataset.id))
    );
  });
}

// Event listener para cadastrar novo livro
document.getElementById("btn-cadastrar-livro").addEventListener("click", () => {
  const autores = biblioteca.getAutores();
  const autoresOptions = autores
    .map((autor) => `<option value="${autor.id}">${autor.nome}</option>`)
    .join("");

  const form = `
        <form id="form-livro">
            <div class="form-group"><label for="livro-titulo">Título:</label><input type="text" id="livro-titulo" required></div>
            <div class="form-group"><label for="livro-autor">Autor:</label><select id="livro-autor" required>${autoresOptions}</select></div>
            <div class="form-group"><label for="livro-isbn">ISBN:</label><input type="text" id="livro-isbn" required></div>
            <div class="form-group"><label for="livro-ano">Ano de Publicação:</label><input type="number" id="livro-ano" required></div>
            <div class="form-group"><label for="livro-genero">Gênero:</label><input type="text" id="livro-genero" required></div>
            <div class="form-group"><label for="livro-editora">Editora:</label><input type="text" id="livro-editora" required></div>
            <div class="form-group"><label for="livro-capa">Capa do Livro:</label><input type="file" id="livro-capa" accept="image/*"></div>
            <button type="submit" class="btn btn-primary">Salvar Livro</button>
        </form>
    `;
  showModal("Cadastrar Novo Livro", form);

  // Event listener para o formulário de livro
  document
    .getElementById("form-livro")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const titulo = document.getElementById("livro-titulo").value;
      const autorId = parseInt(document.getElementById("livro-autor").value);
      const isbn = document.getElementById("livro-isbn").value;
      const ano = parseInt(document.getElementById("livro-ano").value);
      const genero = document.getElementById("livro-genero").value;
      const editora = document.getElementById("livro-editora").value;
      const capaArquivo = document.getElementById("livro-capa").files[0];

      try {
        let capaUrl = biblioteca.obterImagemPadrao("livro");
        if (capaArquivo) {
          capaUrl = await ImageManager.fazerUploadImagem(capaArquivo);
        }

        const novoLivro = new Livro(
          titulo,
          autorId,
          isbn,
          ano,
          genero,
          editora,
          capaUrl
        );
        biblioteca.adicionarLivro(novoLivro);

        alert("Livro cadastrado com sucesso!");
        modal.style.display = "none";
        listarLivros();
      } catch (error) {
        alert("Erro ao cadastrar livro: " + error.message);
      }
    });
});

/**
 * Exibe o formulário para gerenciar exemplares de um livro
 * @param {number} livroId - ID do livro
 */
function showFormularioAdicionarExemplar(livroId) {
  const livro = biblioteca.buscarLivroPorId(livroId);
  if (!livro) {
    alert("Livro não encontrado.");
    return;
  }

  const exemplaresDoLivro = biblioteca
    .getExemplares()
    .filter((ex) => ex.livroId === livroId);

  // Cria a lista de exemplares existentes
  const exemplaresListHtml =
    exemplaresDoLivro.length > 0
      ? `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Localização</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${exemplaresDoLivro
                  .map((ex) => {
                    const isInativo = ex.obterStatus() === "INATIVO";
                    const statusClass = isInativo ? "status-inativo" : "";
                    return `
                    <tr>
                        <td>#${ex.id}</td>
                        <td>${ex.localizacao}</td>
                        <td class="${statusClass}">${ex.obterStatus()}</td>
                        <td>
                            <button class="btn btn-secondary btn-sm btn-status-exemplar" 
                                    data-exemplar-id="${ex.id}" 
                                    ${isInativo ? "disabled" : ""}>
                                Alterar Status
                            </button>
                            <button class="btn btn-danger btn-sm btn-excluir-exemplar" 
                                    data-exemplar-id="${ex.id}" 
                                    ${isInativo ? "disabled" : ""}>
                                Excluir
                            </button>
                        </td>
                    </tr>
                `;
                  })
                  .join("")}
            </tbody>
        </table>
    `
      : `<p>Nenhum exemplar cadastrado para este livro.</p>`;

  const formHtml = `
        <h3>Gerenciar Exemplares de: ${livro.titulo}</h3>
        <hr>
        <h4>Exemplares Existentes</h4>
        <div class="exemplares-list-container">
            ${exemplaresListHtml}
        </div>
        <hr>
        <h4>Adicionar Novo Exemplar</h4>
        <form id="form-adicionar-exemplar">
            <div class="form-group">
                <label for="exemplar-localizacao">Localização:</label>
                <input type="text" id="exemplar-localizacao" required>
            </div>
            <button type="submit" class="btn btn-primary">Adicionar Exemplar</button>
        </form>
    `;

  showModal("Gerenciar Exemplares", formHtml);

  // Event listener para adicionar exemplar
  document
    .getElementById("form-adicionar-exemplar")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      const localizacao = document.getElementById("exemplar-localizacao").value;
      try {
        const novoExemplar = new Exemplar(livroId, localizacao);
        biblioteca.adicionarExemplar(novoExemplar);
        // Atualiza a visualização
        showFormularioAdicionarExemplar(livroId);
        listarLivros();
      } catch (error) {
        alert("Erro ao adicionar exemplar: " + error.message);
      }
    });

  // Event listeners para ações nos exemplares
  document.querySelectorAll(".btn-status-exemplar").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const exemplarId = parseInt(e.target.dataset.exemplarId);
      showFormularioAlterarStatus(exemplarId, livroId);
    });
  });

  document.querySelectorAll(".btn-excluir-exemplar").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const exemplarId = parseInt(e.target.dataset.exemplarId);
      const temHistorico = biblioteca.exemplarTemHistorico(exemplarId);

      if (temHistorico) {
        // Se tem histórico, abre um modal complexo
        const modalComplexoHtml = `
            <h4>Atenção: Exemplar com Histórico</h4>
            <p>Este exemplar (#${exemplarId}) já foi emprestado e não pode ser excluído permanentemente para preservar os relatórios.</p>
            <p>A ação padrão é torná-lo <strong>INATIVO</strong>, impedindo novos empréstimos.</p>
            <p class="text-danger"><strong>Opcional:</strong> Você pode forçar a exclusão. Isso removerá o exemplar E TODOS os seus registros de empréstimo do sistema, afetando os relatórios de forma irreversível.</p>
            <div class="modal-actions">
                <button id="btn-inativar-confirma" class="btn btn-primary">Apenas Inativar</button>
                <button id="btn-forcar-exclusao-inicia" class="btn btn-danger">Forçar Exclusão</button>
                <button id="btn-cancelar-exclusao" class="btn btn-secondary">Cancelar</button>
            </div>
        `;
        showModal("Confirmar Ação", modalComplexoHtml);

        document
          .getElementById("btn-inativar-confirma")
          .addEventListener("click", () => {
            try {
              const resultado =
                biblioteca.tentarExcluirOuInativarExemplar(exemplarId);
              alert(
                `Ação concluída: Exemplar #${resultado.exemplar.id} foi ${resultado.acao}.`
              );
              showFormularioAdicionarExemplar(livroId);
              listarLivros();
            } catch (error) {
              alert("Erro: " + error.message);
            }
          });

        document
          .getElementById("btn-forcar-exclusao-inicia")
          .addEventListener("click", () => {
            if (
              confirm(
                "ALERTA FINAL!\n\nTem certeza que deseja excluir permanentemente este exemplar e todos os seus registros de empréstimo? Esta ação não pode ser desfeita e afetará os relatórios."
              )
            ) {
              try {
                biblioteca.forcarExclusaoExemplar(exemplarId);
                alert(
                  `Exemplar #${exemplarId} e seu histórico foram excluídos com sucesso.`
                );
                modal.style.display = "none"; // Fecha o modal anterior
                showFormularioAdicionarExemplar(livroId);
                listarLivros();
              } catch (error) {
                alert("Erro: " + error.message);
              }
            }
          });

        document
          .getElementById("btn-cancelar-exclusao")
          .addEventListener("click", () => {
            showFormularioAdicionarExemplar(livroId);
          });
      } else {
        // Se não tem histórico, a exclusão é direta
        if (
          confirm(
            `Este exemplar (#${exemplarId}) não possui histórico. Deseja excluí-lo permanentemente?`
          )
        ) {
          try {
            const resultado =
              biblioteca.tentarExcluirOuInativarExemplar(exemplarId);
            alert(
              `Exemplar #${resultado.exemplar.id} foi ${resultado.acao} com sucesso.`
            );
            showFormularioAdicionarExemplar(livroId);
            listarLivros();
          } catch (error) {
            alert("Erro ao excluir exemplar: " + error.message);
          }
        }
      }
    });
  });
}

/**
 * Exibe o formulário para alterar o status de um exemplar
 * @param {number} exemplarId - ID do exemplar
 * @param {number} livroId - ID do livro
 */
function showFormularioAlterarStatus(exemplarId, livroId) {
  const exemplar = biblioteca.buscarExemplarPorId(exemplarId);
  if (!exemplar) {
    alert("Exemplar não encontrado.");
    return;
  }
  const form = `
        <h4>Alterar Status do Exemplar #${exemplar.id}</h4>
        <p>Status atual: <strong>${exemplar.obterStatus()}</strong></p>
        <form id="form-alterar-status">
            <div class="form-group">
                <label for="exemplar-status">Novo Status:</label>
                <select id="exemplar-status" required>
                    <option value="DISPONÍVEL" ${
                      exemplar.obterStatus() === "DISPONÍVEL" ? "selected" : ""
                    }>Disponível</option>
                    <option value="EM_MANUTENCAO" ${
                      exemplar.obterStatus() === "EM_MANUTENCAO"
                        ? "selected"
                        : ""
                    }>Em Manutenção</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary mt-3">Salvar</button>
        </form>
    `;
  showModal("Alterar Status", form);

  // Event listener para alterar status
  document
    .getElementById("form-alterar-status")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      const novoStatus = document.getElementById("exemplar-status").value;
      try {
        biblioteca.alterarStatusExemplar(exemplarId, novoStatus);
        alert("Status do exemplar alterado com sucesso!");
        modal.style.display = "none";
        showFormularioAdicionarExemplar(livroId);
        listarLivros();
      } catch (error) {
        alert("Erro ao alterar status: " + error.message);
      }
    });
}

/**
 * Exibe o formulário para alterar um livro
 * @param {number} livroId - ID do livro a ser alterado
 */
async function showFormularioAlterarLivro(livroId) {
  const livro = biblioteca.buscarLivroPorId(livroId);
  const autores = biblioteca.getAutores();
  const autoresOptions = autores
    .map((autor) => `<option value="${autor.id}">${autor.nome}</option>`)
    .join("");

  if (!livro) {
    alert("Livro não encontrado.");
    return;
  }

  const form = `
        <form id="form-alterar-livro">
            <input type="hidden" id="livro-id" value="${livro.id}">
            <div class="form-group"><label for="livro-titulo">Título:</label><input type="text" id="livro-titulo" value="${livro.titulo}" required></div>
            <div class="form-group"><label for="livro-autor">Autor:</label>
                <select id="livro-autor" required>
                    ${autoresOptions}
                </select>
            </div>
            <div class="form-group"><label for="livro-isbn">ISBN:</label><input type="text" id="livro-isbn" value="${livro.isbn}" required></div>
            <div class="form-group"><label for="livro-ano-publicacao">Ano de Publicação:</label><input type="number" id="livro-ano-publicacao" value="${livro.anoPublicacao}" required></div>
            <div class="form-group"><label for="livro-genero">Gênero:</label><input type="text" id="livro-genero" value="${livro.genero}" required></div>
            <div class="form-group"><label for="livro-editora">Editora:</label><input type="text" id="livro-editora" value="${livro.editora}" required></div>
            <div class="form-group"><label for="livro-capa">Capa:</label><input type="file" id="livro-capa" accept="image/*"></div>
            <button type="submit" class="btn btn-primary">Salvar Alterações</button>
        </form>
    `;
  showModal("Alterar Livro", form);

  document.getElementById("livro-autor").value = livro.autorId;

  // Event listener para o formulário de alteração
  document
    .getElementById("form-alterar-livro")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const titulo = document.getElementById("livro-titulo").value;
      const autorId = parseInt(document.getElementById("livro-autor").value);
      const isbn = document.getElementById("livro-isbn").value;
      const anoPublicacao = document.getElementById(
        "livro-ano-publicacao"
      ).value;
      const genero = document.getElementById("livro-genero").value;
      const editora = document.getElementById("livro-editora").value;
      const capaArquivo = document.getElementById("livro-capa").files[0];

      try {
        let capaUrl = livro.capaUrl;
        if (capaArquivo) {
          capaUrl = await ImageManager.fazerUploadImagem(capaArquivo);
        }

        biblioteca.alterarLivro(
          livroId,
          titulo,
          autorId,
          isbn,
          anoPublicacao,
          genero,
          editora,
          capaUrl
        );
        alert("Livro alterado com sucesso!");
        modal.style.display = "none";
        listarLivros();
      } catch (error) {
        alert("Erro ao alterar livro: " + error.message);
      }
    });
}

/**
 * Exclui um livro após confirmação
 * @param {number} livroId - ID do livro a ser excluído
 */
function excluirLivro(livroId) {
  if (confirm("Tem certeza que deseja excluir este livro?")) {
    try {
      biblioteca.excluirLivro(livroId);
      alert("Livro excluído com sucesso!");
      listarLivros();
    } catch (error) {
      alert("Erro ao excluir livro: " + error.message);
    }
  }
}

// ==========================================================
// GESTÃO DE USUÁRIOS
// ==========================================================
// Inicializa a aba de usuários
const usuariosTab = document.getElementById("usuarios");
usuariosTab.innerHTML = `
    <h2>Gestão de Usuários</h2>
    <div class="busca-container">
      <input type="text" id="busca-usuario" class="caixa-busca" placeholder="Buscar por Nome, Matrícula ou ID do Usuário...">
    </div>
    <br>
    <div class="actions">
        <button id="btn-cadastrar-usuario" class="btn btn-primary">Cadastrar Novo Usuário</button>
    </div>
    <div id="usuarios-list"></div>
`;

/**
 * Lista os usuários na tabela
 */
function listarUsuarios() {
  const termoBusca = document.getElementById("busca-usuario").value || "";
  const usuariosListDiv = document.getElementById("usuarios-list");
  let usuarios = biblioteca.getUsuarios();

  // Filtra usuários pelo termo de busca
  if (termoBusca) {
    const termo = termoBusca.toLowerCase();
    usuarios = usuarios.filter(
      (usuario) =>
        usuario.nome.toLowerCase().includes(termo) ||
        usuario.matricula.toLowerCase().includes(termo) ||
        String(usuario.id).includes(termo)
    );
  }

  // Ordena os usuários
  handleSort(usuarios, sortState.usuarios);

  // Configura os cabeçalhos da tabela
  const headers = [
    { text: "ID", key: "id" },
    { text: "Foto", key: null },
    { text: "Nome", key: "nome" },
    { text: "Matrícula", key: "matricula" },
    { text: "Status", key: "status" },
    { text: "Multas", key: "multasPendentes" },
    { text: "Ações", key: null },
  ];

  // Retorna os botões de ação apropriados para o status do usuário
  const getActionButtons = (usuario) => {
    if (usuario.status === "INATIVO") {
      return `
                <button class="btn btn-success btn-sm btn-reativar-usuario" data-id="${usuario.id}">Reativar</button>
                <button class="btn btn-danger btn-sm btn-excluir-usuario" data-id="${usuario.id}">Excluir</button>
            `;
    } else {
      return `
                <button class="btn btn-secondary btn-sm btn-alterar-usuario" data-id="${usuario.id}">Alterar</button>
                <button class="btn btn-danger btn-sm btn-excluir-usuario" data-id="${usuario.id}">Excluir</button>
            `;
    }
  };

  // Cria as linhas da tabela
  const tableRows = usuarios
    .map((usuario) => {
      const isInactive = usuario.status === "INATIVO";
      const rowClass = isInactive ? "inativo" : "";
      return `
            <tr class="${rowClass}">
              <td>${usuario.id}</td>
              <td><img src="${
                usuario.fotoUrl || biblioteca.obterImagemPadrao("usuario")
              }" alt="Foto de ${usuario.nome}" style="width: 50px;"></td>
              <td>${usuario.nome}</td>
              <td>${usuario.matricula}</td>
              <td>${usuario.status}</td>
              <td>R$ ${usuario.multasPendentes.toFixed(2)}</td>
              <td>${getActionButtons(usuario)}</td>
            </tr>
        `;
    })
    .join("");

  // Cria a tabela de usuários
  const tableHtml = criarTabela(headers, usuarios, () => {}, "usuarios");
  const finalTableHtml =
    tableHtml.substring(0, tableHtml.indexOf("<tbody>") + "<tbody>".length) +
    tableRows +
    "</tbody></table>";

  usuariosListDiv.innerHTML = finalTableHtml;

  // Adiciona event listeners para ordenação e ações
  usuariosListDiv
    .querySelector("thead")
    ?.addEventListener("click", (e) =>
      handleSortClick(e, "usuarios", listarUsuarios)
    );

  usuariosListDiv.querySelectorAll(".btn-alterar-usuario").forEach((btn) => {
    btn.addEventListener("click", (e) =>
      showFormularioAlterarUsuario(parseInt(e.target.dataset.id))
    );
  });

  usuariosListDiv.querySelectorAll(".btn-excluir-usuario").forEach((btn) => {
    btn.addEventListener("click", (e) =>
      iniciarProcessoExclusaoUsuario(parseInt(e.target.dataset.id))
    );
  });

  // Event listener para reativar usuário
  usuariosListDiv.querySelectorAll(".btn-reativar-usuario").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const usuarioId = parseInt(e.target.dataset.id);
      if (confirm("Tem certeza que deseja reativar este usuário?")) {
        try {
          biblioteca.reativarUsuario(usuarioId);
          alert("Usuário reativado com sucesso!");
          listarUsuarios();
        } catch (error) {
          alert("Erro ao reativar usuário: " + error.message);
        }
      }
    });
  });
}

/**
 * Exibe o formulário para alterar um usuário
 * @param {number} usuarioId - ID do usuário a ser alterado
 */
function showFormularioAlterarUsuario(usuarioId) {
  const usuario = biblioteca.buscarUsuarioPorId(usuarioId);
  if (!usuario) {
    alert("Usuário não encontrado!");
    return;
  }

  const form = `
        <form id="form-alterar-usuario">
            <div class="form-group"><label>Tipo:</label><input type="text" value="${usuario.tipo.replace(
              "Usuario",
              ""
            )}" disabled></div>
            <div class="form-group"><label for="usuario-nome">Nome:</label><input type="text" id="usuario-nome" value="${
              usuario.nome
            }" required></div>
            <div class="form-group"><label for="usuario-matricula">Matrícula:</label><input type="text" id="usuario-matricula" value="${
              usuario.matricula
            }" required></div>
            <div class="form-group"><label for="usuario-email">E-mail:</label><input type="email" id="usuario-email" value="${
              usuario.email
            }" required></div>
            <div class="form-group"><label for="usuario-telefone">Telefone:</label><input type="text" id="usuario-telefone" value="${
              usuario.telefone
            }"></div>
            <div class="form-group"><label for="usuario-foto">Nova Foto (opcional):</label><input type="file" id="usuario-foto" accept="image/*"></div>
            <button type="submit" class="btn btn-primary">Salvar Alterações</button>
        </form>
    `;
  showModal("Alterar Usuário", form);

  // Event listener para o formulário de alteração
  document
    .getElementById("form-alterar-usuario")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const fotoArquivo = document.getElementById("usuario-foto").files[0];
      let novaFotoUrl = null;
      try {
        if (fotoArquivo) {
          novaFotoUrl = await ImageManager.fazerUploadImagem(fotoArquivo);
        }

        const dadosAtualizados = {
          nome: document.getElementById("usuario-nome").value,
          matricula: document.getElementById("usuario-matricula").value,
          email: document.getElementById("usuario-email").value,
          telefone: document.getElementById("usuario-telefone").value,
          fotoUrl: novaFotoUrl,
        };

        biblioteca.alterarUsuario(usuarioId, dadosAtualizados);
        alert("Usuário alterado com sucesso!");
        modal.style.display = "none";
        listarUsuarios();
      } catch (error) {
        alert("Erro ao alterar usuário: " + error.message);
      }
    });
}

/**
 * Inicia o processo de exclusão de um usuário
 * @param {number} usuarioId - ID do usuário a ser excluído
 */
function iniciarProcessoExclusaoUsuario(usuarioId) {
  const usuario = biblioteca.buscarUsuarioPorId(usuarioId);
  if (!usuario) return;

  if (biblioteca.usuarioTemEmprestimosAtivos(usuarioId)) {
    alert(
      "Erro: Este usuário possui empréstimos ativos e não pode ser excluído ou inativado."
    );
    return;
  }

  const temHistorico = biblioteca.usuarioTemHistorico(usuarioId);

  if (temHistorico) {
    const modalHtml = `
            <h4>Atenção: Usuário com Histórico</h4>
            <p>Este usuário (${usuario.nome}) já realizou empréstimos e não pode ser excluído permanentemente para preservar os relatórios.</p>
            <p>A ação padrão é torná-lo <strong>INATIVO</strong>.</p>
            <p class="text-danger"><strong>Opcional:</strong> Você pode forçar a exclusão. Isso removerá o usuário E TODOS os seus registros de empréstimo do sistema, afetando os relatórios de forma irreversível.</p>
            <div class="modal-actions">
                <button id="btn-inativar-confirma" class="btn btn-primary">Apenas Inativar</button>
                <button id="btn-forcar-exclusao-inicia" class="btn btn-danger">Forçar Exclusão</button>
                <button id="btn-cancelar-exclusao" class="btn btn-secondary" onclick="document.getElementById('modal').style.display='none'">Cancelar</button>
            </div>
        `;
    showModal("Confirmar Ação para Usuário", modalHtml);

    document
      .getElementById("btn-inativar-confirma")
      .addEventListener("click", () => {
        const resultado = biblioteca.tentarExcluirOuInativarUsuario(usuarioId);
        alert(`Ação concluída: Usuário foi ${resultado.acao}.`);
        modal.style.display = "none";
        listarUsuarios();
      });

    document
      .getElementById("btn-forcar-exclusao-inicia")
      .addEventListener("click", () => {
        if (
          confirm(
            "ALERTA FINAL!\n\nTem certeza que deseja excluir permanentemente este usuário e todo o seu histórico de empréstimos? Esta ação não pode ser desfeita."
          )
        ) {
          biblioteca.forcarExclusaoUsuario(usuarioId);
          alert(`Usuário e seu histórico foram excluídos com sucesso.`);
          modal.style.display = "none";
          listarUsuarios();
        }
      });
  } else {
    if (
      confirm(
        `Este usuário não possui histórico. Deseja excluí-lo permanentemente?`
      )
    ) {
      biblioteca.tentarExcluirOuInativarUsuario(usuarioId);
      alert("Usuário excluído com sucesso.");
      listarUsuarios();
    }
  }
}

// Event listener para cadastrar novo usuário
document
  .getElementById("btn-cadastrar-usuario")
  .addEventListener("click", () => {
    const form = `
        <form id="form-usuario">
            <div class="form-group"><label for="usuario-tipo">Tipo:</label><select id="usuario-tipo" required><option value="UsuarioAluno">Aluno</option><option value="UsuarioProfessor">Professor</option><option value="UsuarioFuncionario">Funcionário</option></select></div>
            <div class="form-group"><label for="usuario-nome">Nome:</label><input type="text" id="usuario-nome" required></div>
            <div class="form-group"><label for="usuario-matricula">Matrícula:</label><input type="text" id="usuario-matricula" required></div>
            <div class="form-group"><label for="usuario-email">E-mail:</label><input type="email" id="usuario-email" required></div>
            <div class="form-group"><label for="usuario-telefone">Telefone:</label><input type="text" id="usuario-telefone"></div>
            <div class="form-group"><label for="usuario-foto">Foto:</label><input type="file" id="usuario-foto" accept="image/*"></div>
            <button type="submit" class="btn btn-primary">Salvar Usuário</button>
        </form>
    `;
    showModal("Cadastrar Novo Usuário", form);

    // Event listener para o formulário de usuário
    document
      .getElementById("form-usuario")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const tipo = document.getElementById("usuario-tipo").value;
        const nome = document.getElementById("usuario-nome").value;
        const matricula = document.getElementById("usuario-matricula").value;
        const email = document.getElementById("usuario-email").value;
        const telefone = document.getElementById("usuario-telefone").value;
        const fotoArquivo = document.getElementById("usuario-foto").files[0];
        try {
          const fotoUrl = fotoArquivo
            ? await ImageManager.fazerUploadImagem(fotoArquivo)
            : biblioteca.obterImagemPadrao("usuario");
          let novoUsuario;
          switch (tipo) {
            case "UsuarioAluno":
              novoUsuario = new UsuarioAluno(
                nome,
                matricula,
                email,
                telefone,
                fotoUrl
              );
              break;
            case "UsuarioProfessor":
              novoUsuario = new UsuarioProfessor(
                nome,
                matricula,
                email,
                telefone,
                fotoUrl
              );
              break;
            case "UsuarioFuncionario":
              novoUsuario = new UsuarioFuncionario(
                nome,
                matricula,
                email,
                telefone,
                fotoUrl
              );
              break;
            default:
              throw new Error("Tipo de usuário inválido.");
          }
          biblioteca.adicionarUsuario(novoUsuario);
          alert("Usuário cadastrado com sucesso!");
          modal.style.display = "none";
          listarUsuarios();
        } catch (error) {
          alert("Erro ao cadastrar usuário: " + error.message);
        }
      });
  });

// ==========================================================
// GESTÃO DE EMPRÉSTIMOS
// ==========================================================
// Inicializa a aba de empréstimos
const emprestimosTab = document.getElementById("emprestimos");
emprestimosTab.innerHTML = `
    <h2>Gestão de Empréstimos</h2>
    <div class="filter-buttons">
        <button class="filter-btn active" data-status="TODOS">Todos</button>
        <button class="filter-btn" data-status="ATIVO">Ativos</button>
        <button class="filter-btn" data-status="ATRASADO">Atrasados</button>
        <button class="filter-btn" data-status="CONCLUÍDO">Concluídos</button>
    </div>
    <div class="actions">
        <button id="btn-realizar-emprestimo" class="btn btn-primary">Realizar Novo Empréstimo</button>
    </div>
    <div id="emprestimos-list"></div>
`;

/**
 * Lista os empréstimos na tabela
 */
function listarEmprestimos() {
  const emprestimosListDiv = document.getElementById("emprestimos-list");
  let emprestimos = biblioteca.obterEmprestimosComDadosCompletos();

  // Filtra empréstimos pelo status selecionado
  if (currentEmprestimoFilter !== "TODOS") {
    emprestimos = emprestimos.filter(
      (e) => e.status === currentEmprestimoFilter
    );
  }

  // Ordena os empréstimos
  handleSort(emprestimos, sortState.emprestimos);

  // Configura os cabeçalhos da tabela
  const headers = [
    { text: "ID", key: "id" },
    { text: "Livro", key: "livroTitulo" },
    { text: "Usuário", key: "usuarioNome" },
    { text: "Data Empréstimo", key: "dataEmprestimo" },
    { text: "Prev. Devolução", key: "dataPrevistaDevolucao" },
    { text: "Status", key: "status" },
    { text: "Ações", key: null },
  ];

  // Cria a tabela de empréstimos
  const tableHtml = criarTabela(
    headers,
    emprestimos,
    (e) => `
        <td>${e.id}</td>
        <td>${e.livroTitulo}</td>
        <td><img src="${e.usuarioFotoUrl}" alt="${
      e.usuarioNome
    }" style="width:30px;height:30px;border-radius:50%;margin-right:8px;">${
      e.usuarioNome
    }</td>
        <td>${new Date(e.dataEmprestimo).toLocaleDateString("pt-BR")}</td>
        <td>${new Date(e.dataPrevistaDevolucao).toLocaleDateString(
          "pt-BR"
        )}</td>
        <td><span class="status ${e.status.toLowerCase()}">${
      e.status
    }</span></td>
        <td>${
          e.status === "ATIVO" || e.status === "ATRASADO"
            ? `<button class="btn btn-primary btn-sm btn-devolver" data-emprestimo-id="${e.id}">Devolver</button>`
            : ""
        }</td>
    `,
    "emprestimos"
  );

  emprestimosListDiv.innerHTML = tableHtml;

  // Adiciona event listeners para ordenação e ações
  emprestimosListDiv
    .querySelector("thead")
    ?.addEventListener("click", (e) =>
      handleSortClick(e, "emprestimos", listarEmprestimos)
    );

  // Event listeners para botões de devolução
  emprestimosListDiv.querySelectorAll(".btn-devolver").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const emprestimoId = parseInt(e.target.dataset.emprestimoId);
      try {
        const resultado = bibliotecaService.processarDevolucao(
          emprestimoId,
          1.5
        );
        alert(`Devolução processada! Multa: R$ ${resultado.multa.toFixed(2)}`);
        listarEmprestimos();
        listarLivros();
        renderDashboard();
      } catch (error) {
        alert("Erro ao processar devolução: " + error.message);
      }
    });
  });
}

// Event listener para realizar novo empréstimo
document
  .getElementById("btn-realizar-emprestimo")
  .addEventListener("click", () => {
    // Filtra usuários ativos e exemplares disponíveis
    const usuarios = biblioteca
      .getUsuarios()
      .filter((u) => u.status === "ATIVO");
    const exemplares = biblioteca
      .getExemplares()
      .filter((ex) => ex.obterStatus() === "DISPONÍVEL");

    const usuariosOptions = usuarios
      .map((u) => `<option value="${u.id}">${u.nome} (${u.tipo})</option>`)
      .join("");
    const exemplaresOptions = exemplares
      .map((ex) => {
        const livro = biblioteca.buscarLivroPorId(ex.livroId);
        return `<option value="${ex.id}">${livro.titulo} (ID Exemplar: ${ex.id})</option>`;
      })
      .join("");

    const form = `
        <form id="form-emprestimo">
            <div class="form-group"><label for="emprestimo-usuario">Usuário:</label><select id="emprestimo-usuario" required>${usuariosOptions}</select></div>
            <div class="form-group"><label for="emprestimo-exemplar">Exemplar:</label><select id="emprestimo-exemplar" required>${exemplaresOptions}</select></div>
            <button type="button" id="btn-confirmar-emprestimo" class="btn btn-primary">Confirmar Empréstimo</button>
        </form>
    `;
    showModal("Realizar Novo Empréstimo", form);

    // Event listener para confirmar empréstimo
    document
      .getElementById("btn-confirmar-emprestimo")
      .addEventListener("click", () => {
        const usuarioId = parseInt(
          document.getElementById("emprestimo-usuario").value
        );
        const exemplarId = parseInt(
          document.getElementById("emprestimo-exemplar").value
        );

        const usuario = biblioteca.buscarUsuarioPorId(usuarioId);
        const exemplar = biblioteca.buscarExemplarPorId(exemplarId);
        const livro = exemplar
          ? biblioteca.buscarLivroPorId(exemplar.livroId)
          : null;

        if (!usuario || !exemplar || !livro) {
          alert(
            "Erro: Usuário ou exemplar não encontrados. Por favor, tente novamente."
          );
          return;
        }

        const confirmacaoForm = `
            <h3>Confirmar Empréstimo</h3>
            <p><strong>Usuário:</strong> ${usuario.nome} (${
          usuario.matricula
        })</p>
            <p><strong>Livro:</strong> ${livro.titulo}</p>
            <p><strong>Exemplar:</strong> #${exemplar.id}</p>
            <p><strong>Prazo:</strong> ${usuario.prazoEmprestimoDias()} dias</p>
            <button id="btn-finalizar-emprestimo" class="btn btn-primary">Confirmar</button>
            <button id="btn-cancelar-emprestimo" class="btn btn-secondary">Cancelar</button>
        `;
        showModal("Confirmação de Empréstimo", confirmacaoForm);

        // Event listener para finalizar empréstimo
        document
          .getElementById("btn-finalizar-emprestimo")
          .addEventListener("click", () => {
            try {
              bibliotecaService.realizarEmprestimo(exemplarId, usuarioId);
              alert("Empréstimo realizado com sucesso!");
              modal.style.display = "none";
              listarEmprestimos();
              listarLivros();
              renderDashboard();
            } catch (error) {
              alert("Erro ao realizar empréstimo: " + error.message);
            }
          });

        // Event listener para cancelar empréstimo
        document
          .getElementById("btn-cancelar-emprestimo")
          .addEventListener("click", () => {
            modal.style.display = "none";
            document.getElementById("btn-realizar-emprestimo").click();
          });
      });
  });

// Event listeners para filtros de empréstimos
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    currentEmprestimoFilter = e.target.dataset.status;
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    e.target.classList.add("active");
    listarEmprestimos();
  });
});

// ==========================================================
// RELATÓRIOS E ESTATÍSTICAS
// ==========================================================
/**
 * Exibe os relatórios e estatísticas
 */

function exibirRelatorios() {
  const relatoriosContainer = document.getElementById("relatorios");

  // --- TOP 10 LIVROS (código existente) ---
  const emprestimos = biblioteca.getEmprestimos();
  const contagemLivros = new Map();
  emprestimos.forEach((emp) => {
    const exemplar = biblioteca.buscarExemplarPorId(emp.exemplarId);
    if (exemplar) {
      const livroId = exemplar.livroId;
      contagemLivros.set(livroId, (contagemLivros.get(livroId) || 0) + 1);
    }
  });
  const livrosOrdenados = Array.from(contagemLivros.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  let relatorioLivrosHtml = "<h3>Top 10 Livros Mais Emprestados</h3>";
  if (livrosOrdenados.length > 0) {
    relatorioLivrosHtml += '<ol class="report-list">';
    livrosOrdenados.forEach(([livroId, contagem]) => {
      const livro = biblioteca.buscarLivroPorId(livroId);
      if (livro) {
        relatorioLivrosHtml += `
          <li>
            <img src="${
              livro.capaUrl || biblioteca.obterImagemPadrao("livro")
            }" alt="${livro.titulo}">
            <div class="report-item-info">
              <strong>${livro.titulo}</strong>
              <span>${contagem} empréstimos</span>
            </div>
          </li>`;
      }
    });
    relatorioLivrosHtml += "</ol>";
  } else {
    relatorioLivrosHtml += "<p>Nenhum empréstimo registrado ainda.</p>";
  }

  // --- TOP 10 USUÁRIOS (código existente) ---
  const contagemUsuarios = new Map();
  emprestimos.forEach((emp) => {
    const usuarioId = emp.usuarioId;
    contagemUsuarios.set(usuarioId, (contagemUsuarios.get(usuarioId) || 0) + 1);
  });
  const usuariosOrdenados = Array.from(contagemUsuarios.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  let relatorioUsuariosHtml = "<h3>Top 10 Usuários Mais Ativos</h3>";
  if (usuariosOrdenados.length > 0) {
    relatorioUsuariosHtml += '<ol class="report-list">';
    usuariosOrdenados.forEach(([usuarioId, contagem]) => {
      const usuario = biblioteca.buscarUsuarioPorId(usuarioId);
      if (usuario) {
        relatorioUsuariosHtml += `
           <li>
            <img src="${
              usuario.fotoUrl || biblioteca.obterImagemPadrao("usuario")
            }" alt="${usuario.nome}">
             <div class="report-item-info">
              <strong>${usuario.nome}</strong>
              <span>${contagem} empréstimos</span>
            </div>
          </li>`;
      }
    });
    relatorioUsuariosHtml += "</ol>";
  } else {
    relatorioUsuariosHtml += "<p>Nenhum empréstimo registrado ainda.</p>";
  }

  // --- NOVO: LÓGICA PARA O RELATÓRIO DE EMPRÉSTIMOS POR USUÁRIO ---
  const usuarios = biblioteca.getUsuarios();
  const usuariosOptionsHtml = usuarios
    .map((usuario) => `<option value="${usuario.id}">${usuario.nome}</option>`)
    .join("");

  const relatorioEmprestimosUsuarioHtml = `
    <h3>Livros Emprestados por Usuário</h3>
    <div class="form-group">
      <label for="usuario-emprestimo-select">Selecione um usuário para ver seus empréstimos:</label>
      <select id="usuario-emprestimo-select">
        <option value="">-- Selecione --</option>
        ${usuariosOptionsHtml}
      </select>
    </div>
    <div id="resultado-emprestimo-usuario" class="report-list-container"></div>
  `;

  // --- MONTAGEM FINAL DO HTML ---
  relatoriosContainer.innerHTML = `
    <h2>Relatórios e Estatísticas</h2>
    <div class="reports-container">
      <div class="report-card">${relatorioLivrosHtml}</div>
      <div class="report-card">${relatorioUsuariosHtml}</div>
      <div class="report-card">${relatorioEmprestimosUsuarioHtml}</div>
    </div>
  `;

  // --- NOVO: EVENT LISTENER PARA O FILTRO DE USUÁRIOS ---
  const selectUsuario = document.getElementById("usuario-emprestimo-select");
  selectUsuario.addEventListener("change", (e) => {
    const usuarioId = parseInt(e.target.value);
    const resultadoDiv = document.getElementById(
      "resultado-emprestimo-usuario"
    );

    if (!usuarioId) {
      resultadoDiv.innerHTML = "";
      return;
    }

    const todosEmprestimos = biblioteca.obterEmprestimosComDadosCompletos();
    const emprestimosDoUsuario = todosEmprestimos.filter(
      (emp) => emp.usuarioId === usuarioId
    );

    if (emprestimosDoUsuario.length === 0) {
      resultadoDiv.innerHTML =
        "<p>Nenhum empréstimo encontrado para este usuário.</p>";
      return;
    }

    let listaHtml = '<ul class="report-list">';
    emprestimosDoUsuario.forEach((emp) => {
      const dataEmprestimo = new Date(emp.dataEmprestimo).toLocaleDateString(
        "pt-BR"
      );
      const dataDevolucao = emp.dataRealDevolucao
        ? new Date(emp.dataRealDevolucao).toLocaleDateString("pt-BR")
        : "Pendente";

      listaHtml += `
        <li>
          <img src="${emp.livroCapaUrl}" alt="Capa do ${emp.livroTitulo}">
          <div class="report-item-info">
            <strong>${emp.livroTitulo}</strong>
            <span>Emprestado em: ${dataEmprestimo}</span>
            <span>Devolvido em: ${dataDevolucao}</span>
            <span>Status: <span class="status ${emp.status.toLowerCase()}">${
        emp.status
      }</span></span>
          </div>
        </li>
      `;
    });
    listaHtml += "</ul>";

    resultadoDiv.innerHTML = listaHtml;
  });
}
// ==========================================================
// MODO ESCURO
// ==========================================================
const themeSwitch = document.getElementById("checkbox");
themeSwitch.addEventListener("change", () =>
  document.body.classList.toggle("dark-mode")
);

// ==========================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  // Renderiza todas as seções iniciais
  renderDashboard();
  listarAutores();
  listarLivros();
  listarUsuarios();
  listarEmprestimos();
  exibirRelatorios();

  // Adiciona event listeners para busca
  document
    .getElementById("busca-autor")
    .addEventListener("keyup", () => listarAutores());
  document
    .getElementById("busca-livro")
    .addEventListener("keyup", () => listarLivros());
  document
    .getElementById("busca-usuario")
    .addEventListener("keyup", () => listarUsuarios());
});
