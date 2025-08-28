// /src/classes/Biblioteca.js

// ==========================================================
// IMPORTAÇÕES
// ==========================================================
import { Autor } from "./Autor.js";
import { Livro } from "./Livro.js";
import { Exemplar } from "./Exemplar.js";
import { UsuarioAluno } from "./UsuarioAluno.js";
import { UsuarioProfessor } from "./UsuarioProfessor.js";
import { UsuarioFuncionario } from "./UsuarioFuncionario.js";
import { Emprestimo } from "./Emprestimo.js";
import { Reserva } from "./Reserva.js";
import { LocalStorageManager } from "./LocalStorageManager.js";
import { ImagemInvalidaError } from "../errors/ImagemInvalidaError.js";

// ==========================================================
// CLASSE BIBLIOTECA (SINGLETON)
// ==========================================================
class Biblioteca {
  // Instância única (Singleton pattern)
  static #instance;

  // Arrays de dados
  #autores;
  #livros;
  #exemplares;
  #usuarios;
  #emprestimos;
  #reservas;

  // Contadores de IDs
  #nextAutorId;
  #nextLivroId;
  #nextExemplarId;
  #nextUsuarioId;
  #nextEmprestimoId;
  #nextReservaId;

  // ==========================================================
  // CONSTRUTOR E MÉTODOS SINGLETON
  // ==========================================================

  /**
   * Construtor privado (padrão Singleton)
   * @throws {Error} Se tentar criar uma nova instância diretamente
   */
  constructor() {
    if (Biblioteca.#instance) {
      throw new Error(
        "Não é possível criar uma nova instância da classe Biblioteca. Use Biblioteca.getInstance() em vez disso."
      );
    }

    // Inicializa arrays vazios
    this.#autores = [];
    this.#livros = [];
    this.#exemplares = [];
    this.#usuarios = [];
    this.#emprestimos = [];
    this.#reservas = [];

    // Carrega dados do localStorage
    this.carregarDados();

    // Define a instância única
    Biblioteca.#instance = this;
  }

  /**
   * Obtém a instância única da Biblioteca
   * @returns {Biblioteca} Instância única da Biblioteca
   */
  static getInstance() {
    if (!Biblioteca.#instance) {
      Biblioteca.#instance = new Biblioteca();
    }
    return Biblioteca.#instance;
  }

  // ==========================================================
  // MÉTODOS DE PERSISTÊNCIA E CARREGAMENTO
  // ==========================================================

  /**
   * Carrega todos os dados do localStorage e inicializa os contadores de ID
   */
  carregarDados() {
    // Carrega dados brutos do localStorage
    const autoresRaw = LocalStorageManager.carregarDados("autores") || [];
    const livrosRaw = LocalStorageManager.carregarDados("livros") || [];
    const exemplaresRaw = LocalStorageManager.carregarDados("exemplares") || [];
    const usuariosRaw = LocalStorageManager.carregarDados("usuarios") || [];
    const emprestimosRaw =
      LocalStorageManager.carregarDados("emprestimos") || [];
    const reservasRaw = LocalStorageManager.carregarDados("reservas") || [];

    // Configura os próximos IDs disponíveis
    this.#nextAutorId =
      autoresRaw.length > 0 ? Math.max(...autoresRaw.map((a) => a.id)) + 1 : 1;
    this.#nextLivroId =
      livrosRaw.length > 0 ? Math.max(...livrosRaw.map((l) => l.id)) + 1 : 1;
    this.#nextExemplarId =
      exemplaresRaw.length > 0
        ? Math.max(...exemplaresRaw.map((e) => e.id)) + 1
        : 1;
    this.#nextUsuarioId =
      usuariosRaw.length > 0
        ? Math.max(...usuariosRaw.map((u) => u.id)) + 1
        : 1;
    this.#nextEmprestimoId =
      emprestimosRaw.length > 0
        ? Math.max(...emprestimosRaw.map((e) => e.id)) + 1
        : 1;
    this.#nextReservaId =
      reservasRaw.length > 0
        ? Math.max(...reservasRaw.map((r) => r.id)) + 1
        : 1;

    // Converte dados brutos em instâncias de classes
    this.#autores = autoresRaw.map((a) => Autor.fromJSON(a));
    this.#livros = livrosRaw.map((l) => Livro.fromJSON(l));
    this.#exemplares = exemplaresRaw.map((e) => Exemplar.fromJSON(e));

    // Processa usuários (tipos específicos)
    this.#usuarios = usuariosRaw
      .map((u) => {
        if (!u || !u.tipo) {
          console.warn("Objeto de usuário inválido. Será ignorado.");
          return null;
        }

        try {
          const usuarioData = {
            ...u,
            id: parseInt(u.id),
            multasPendentes: parseFloat(u.multasPendentes || 0),
          };

          // Cria instância correta baseada no tipo
          switch (usuarioData.tipo) {
            case "UsuarioAluno":
              return UsuarioAluno.fromJSON(usuarioData);
            case "UsuarioProfessor":
              return UsuarioProfessor.fromJSON(usuarioData);
            case "UsuarioFuncionario":
              return UsuarioFuncionario.fromJSON(usuarioData);
            default:
              console.warn(`Tipo de usuário desconhecido: ${usuarioData.tipo}`);
              return null;
          }
        } catch (error) {
          console.error("Erro ao desserializar usuário:", u, error);
          return null;
        }
      })
      .filter((u) => u !== null);

    // Converte empréstimos e reservas
    this.#emprestimos = emprestimosRaw.map((e) => Emprestimo.fromJSON(e));
    this.#reservas = reservasRaw.map((r) => Reserva.fromJSON(r));
  }

  /**
   * Salva todos os dados no localStorage
   */
  salvarDados() {
    LocalStorageManager.salvarDados("autores", this.#autores);
    LocalStorageManager.salvarDados("livros", this.#livros);
    LocalStorageManager.salvarDados("exemplares", this.#exemplares);
    LocalStorageManager.salvarDados("usuarios", this.#usuarios);
    LocalStorageManager.salvarDados("emprestimos", this.#emprestimos);
    LocalStorageManager.salvarDados("reservas", this.#reservas);
  }

  // ==========================================================
  // MÉTODOS DE GERAÇÃO DE IDs
  // ==========================================================

  /**
   * Gera um novo ID para o tipo de entidade especificado
   * @param {string} tipo - Tipo de entidade ("autor", "livro", "exemplar", "usuario", "emprestimo", "reserva")
   * @returns {number} Novo ID único
   * @throws {Error} Se o tipo de entidade for inválido
   */
  gerarNovoId(tipo) {
    switch (tipo) {
      case "autor":
        return this.#nextAutorId++;
      case "livro":
        return this.#nextLivroId++;
      case "exemplar":
        return this.#nextExemplarId++;
      case "usuario":
        return this.#nextUsuarioId++;
      case "emprestimo":
        return this.#nextEmprestimoId++;
      case "reserva":
        return this.#nextReservaId++;
      default:
        throw new Error("Tipo de entidade inválido para geração de ID.");
    }
  }

  // ==========================================================
  // GESTÃO DE AUTORES
  // ==========================================================

  /**
   * Adiciona um novo autor à biblioteca
   * @param {Autor} autor - Instância de Autor a ser adicionada
   */
  adicionarAutor(autor) {
    autor.id = this.gerarNovoId("autor");
    this.#autores.push(autor);
    this.salvarDados();
  }

  /**
   * Altera os dados de um autor existente
   * @param {number} id - ID do autor a ser alterado
   * @param {string} novoNome - Novo nome do autor
   * @param {string} novaNacionalidade - Nova nacionalidade do autor
   * @param {string} novaDataNascimento - Nova data de nascimento do autor
   * @param {string} novaFotoUrl - Nova URL da foto do autor
   * @throws {Error} Se o autor não for encontrado
   */
  alterarAutor(
    id,
    novoNome,
    novaNacionalidade,
    novaDataNascimento,
    novaFotoUrl
  ) {
    const autor = this.buscarAutorPorId(id);
    if (!autor) {
      throw new Error("Autor não encontrado.");
    }

    // Atualiza as propriedades do autor
    autor.nome = novoNome;
    autor.nacionalidade = novaNacionalidade;
    autor.dataNascimento = novaDataNascimento;
    autor.fotoUrl = novaFotoUrl;

    this.salvarDados();
  }

  /**
   * Exclui um autor da biblioteca
   * @param {number} id - ID do autor a ser excluído
   * @throws {Error} Se o autor não for encontrado ou tiver livros associados
   */
  excluirAutor(id) {
    // Verifica se existem livros associados ao autor
    const livrosDoAutor = this.#livros.filter((livro) => livro.autorId === id);
    if (livrosDoAutor.length > 0) {
      throw new Error(
        "Não é possível excluir o autor, pois existem livros cadastrados em seu nome."
      );
    }

    // Encontra e remove o autor
    const index = this.#autores.findIndex((autor) => autor.id === id);
    if (index === -1) {
      throw new Error("Autor não encontrado.");
    }
    this.#autores.splice(index, 1);
    this.salvarDados();
  }

  // ==========================================================
  // GESTÃO DE LIVROS
  // ==========================================================

  /**
   * Adiciona um novo livro à biblioteca
   * @param {Livro} livro - Instância de Livro a ser adicionada
   */
  adicionarLivro(livro) {
    livro.id = this.gerarNovoId("livro");
    this.#livros.push(livro);
    this.salvarDados();
  }

  /**
   * Altera os dados de um livro existente
   * @param {number} id - ID do livro a ser alterado
   * @param {string} novoTitulo - Novo título do livro
   * @param {number} novoAutorId - Novo ID do autor do livro
   * @param {string} novoIsbn - Novo ISBN do livro
   * @param {number} novoAnoPublicacao - Novo ano de publicação do livro
   * @param {string} novoGenero - Novo gênero do livro
   * @param {string} novaEditora - Nova editora do livro
   * @param {string} novaCapaUrl - Nova URL da capa do livro
   * @throws {Error} Se o livro não for encontrado
   */
  alterarLivro(
    id,
    novoTitulo,
    novoAutorId,
    novoIsbn,
    novoAnoPublicacao,
    novoGenero,
    novaEditora,
    novaCapaUrl
  ) {
    const livro = this.buscarLivroPorId(id);
    if (!livro) {
      throw new Error("Livro não encontrado.");
    }

    // Atualiza as propriedades do livro
    livro.titulo = novoTitulo;
    livro.autorId = novoAutorId;
    livro.isbn = novoIsbn;
    livro.anoPublicacao = novoAnoPublicacao;
    livro.genero = novoGenero;
    livro.editora = novaEditora;
    livro.capaUrl = novaCapaUrl;

    this.salvarDados();
  }

  /**
   * Exclui um livro da biblioteca
   * @param {number} id - ID do livro a ser excluído
   * @throws {Error} Se o livro não for encontrado ou tiver exemplares/reservas associados
   */
  excluirLivro(id) {
    // Verifica se existem exemplares associados ao livro
    const exemplaresDoLivro = this.#exemplares.filter(
      (ex) => ex.livroId === id
    );
    // Verifica se existem reservas associadas ao livro
    const reservasDoLivro = this.#reservas.filter(
      (reserva) => reserva.livroId === id
    );

    if (exemplaresDoLivro.length > 0) {
      throw new Error(
        "Não é possível excluir o livro, pois existem exemplares cadastrados para ele."
      );
    }

    if (reservasDoLivro.length > 0) {
      throw new Error(
        "Não é possível excluir o livro, pois existem reservas ativas para ele."
      );
    }

    // Encontra e remove o livro
    const index = this.#livros.findIndex((livro) => livro.id === id);
    if (index === -1) {
      throw new Error("Livro não encontrado.");
    }

    this.#livros.splice(index, 1);
    this.salvarDados();
  }

  // ==========================================================
  // GESTÃO DE EXEMPLARES
  // ==========================================================

  /**
   * Adiciona um novo exemplar à biblioteca
   * @param {Exemplar} exemplar - Instância de Exemplar a ser adicionada
   */
  adicionarExemplar(exemplar) {
    exemplar.id = this.gerarNovoId("exemplar");
    this.#exemplares.push(exemplar);
    this._atualizarContadorExemplares(exemplar.livroId);
    this.salvarDados();
  }

  /**
   * Obtém todos os exemplares de um livro específico
   * @param {number} livroId - ID do livro
   * @returns {Array<Exemplar>} Array de exemplares do livro
   */
  _getExemplaresDoLivro(livroId) {
    return this.#exemplares.filter((ex) => ex.livroId === livroId);
  }

  /**
   * Altera o status de um exemplar
   * @param {number} id - ID do exemplar
   * @param {string} novoStatus - Novo status do exemplar
   * @throws {Error} Se o exemplar não for encontrado ou não puder ter seu status alterado
   */
  alterarStatusExemplar(id, novoStatus) {
    const exemplar = this.buscarExemplarPorId(id);
    if (!exemplar) {
      throw new Error("Exemplar não encontrado.");
    }

    // Verifica se o exemplar pode ter seu status alterado
    if (
      exemplar.obterStatus() !== "DISPONÍVEL" &&
      exemplar.obterStatus() !== "EM_MANUTENCAO"
    ) {
      throw new Error(
        "Não é possível alterar o status de um exemplar emprestado ou reservado."
      );
    }

    exemplar.status = novoStatus;
    this._atualizarContadorExemplares(exemplar.livroId);
    this.salvarDados();
  }

  /**
   * Verifica se um exemplar tem histórico de empréstimos
   * @param {number} exemplarId - ID do exemplar
   * @returns {boolean} True se o exemplar tem histórico, False caso contrário
   */
  exemplarTemHistorico(exemplarId) {
    return this.#emprestimos.some((e) => e.exemplarId === exemplarId);
  }

  /**
   * Tenta excluir ou inativar um exemplar
   * @param {number} id - ID do exemplar
   * @returns {Object} Resultado da operação com ação realizada e exemplar
   * @throws {Error} Se o exemplar não for encontrado ou estiver emprestado/reservado
   */
  tentarExcluirOuInativarExemplar(id) {
    const exemplar = this.buscarExemplarPorId(id);
    if (!exemplar) {
      throw new Error("Exemplar não encontrado.");
    }

    // Verifica se o exemplar está disponível para exclusão/inativação
    if (
      exemplar.obterStatus() === "EMPRESTADO" ||
      exemplar.obterStatus() === "RESERVADO"
    ) {
      throw new Error(
        "Não é possível excluir ou inativar um exemplar emprestado ou reservado."
      );
    }

    if (this.exemplarTemHistorico(id)) {
      // Tem histórico, então inativa
      exemplar.inativar();
      this.salvarDados();
      return { acao: "inativado", exemplar };
    } else {
      // Não tem histórico, exclui permanentemente
      const index = this.#exemplares.findIndex((ex) => ex.id === id);
      this.#exemplares.splice(index, 1);
      this.salvarDados();
      return { acao: "excluido", exemplar };
    }
  }

  /**
   * Força a exclusão de um exemplar e todo seu histórico
   * @param {number} id - ID do exemplar
   * @throws {Error} Se o exemplar não for encontrado
   */
  forcarExclusaoExemplar(id) {
    const exemplar = this.buscarExemplarPorId(id);
    if (!exemplar) {
      throw new Error("Exemplar não encontrado.");
    }

    // 1. Remove todos os registros de empréstimo associados
    this.#emprestimos = this.#emprestimos.filter((e) => e.exemplarId !== id);

    // 2. Remove o exemplar
    const index = this.#exemplares.findIndex((ex) => ex.id === id);
    this.#exemplares.splice(index, 1);

    this.salvarDados();
  }

  /**
   * Obtém dados completos de um empréstimo (com informações do livro e usuário)
   * @param {Emprestimo} emprestimo - Instância de Emprestimo
   * @returns {Object} Dados completos do empréstimo
   */
  obterDadosCompletosEmprestimo(emprestimo) {
    const exemplar = this.buscarExemplarPorId(emprestimo.exemplarId);
    const livro = exemplar ? this.buscarLivroPorId(exemplar.livroId) : null;
    const usuario = this.buscarUsuarioPorId(emprestimo.usuarioId);

    return {
      ...emprestimo.toJSON(),
      livroTitulo: livro ? livro.titulo : "Livro não encontrado",
      livroCapaUrl: livro ? livro.capaUrl : this.obterImagemPadrao("livro"),
      usuarioNome: usuario ? usuario.nome : "Usuário não encontrado",
      usuarioFotoUrl: usuario
        ? usuario.fotoUrl
        : this.obterImagemPadrao("usuario"),
    };
  }

  /**
   * Obtém todos os empréstimos com dados completos
   * @returns {Array<Object>} Array de empréstimos com dados completos
   */
  obterEmprestimosComDadosCompletos() {
    return this.#emprestimos.map((emprestimo) =>
      this.obterDadosCompletosEmprestimo(emprestimo)
    );
  }

  /**
   * Atualiza o contador de exemplares disponíveis para um livro
   * @param {number} livroId - ID do livro
   * @private
   */
  _atualizarContadorExemplares(livroId) {
    const livro = this.buscarLivroPorId(livroId);
    if (livro) {
      const exemplaresDoLivro = this._getExemplaresDoLivro(livroId);
      const disponiveis = exemplaresDoLivro.filter(
        (ex) => ex.obterStatus() === "DISPONÍVEL"
      ).length;
      livro.atualizarExemplaresDisponiveis(disponiveis);
    }
  }

  // ==========================================================
  // GESTÃO DE USUÁRIOS
  // ==========================================================

  /**
   * Adiciona um novo usuário à biblioteca
   * @param {Usuario} usuario - Instância de Usuario a ser adicionada
   */
  adicionarUsuario(usuario) {
    usuario.id = this.gerarNovoId("usuario");
    this.#usuarios.push(usuario);
    this.salvarDados();
  }

  /**
   * Reativa um usuário inativo
   * @param {number} id - ID do usuário
   * @returns {Usuario} Usuário reativado
   * @throws {Error} Se o usuário não for encontrado ou não estiver inativo
   */
  reativarUsuario(id) {
    const usuario = this.buscarUsuarioPorId(id);
    if (!usuario) {
      throw new Error("Usuário não encontrado.");
    }
    if (usuario.status !== "INATIVO") {
      throw new Error("Este usuário não está inativo.");
    }
    usuario.reativar();
    this.salvarDados();
    return usuario;
  }

  /**
   * Altera os dados de um usuário existente
   * @param {number} id - ID do usuário
   * @param {Object} novosDados - Novos dados do usuário
   * @throws {Error} Se o usuário não for encontrado
   */
  alterarUsuario(id, novosDados) {
    const usuario = this.buscarUsuarioPorId(id);
    if (!usuario) {
      throw new Error("Usuário não encontrado.");
    }

    // Atualiza as propriedades do usuário
    usuario.nome = novosDados.nome;
    usuario.matricula = novosDados.matricula;
    usuario.email = novosDados.email;
    usuario.telefone = novosDados.telefone;

    // Atualiza a foto apenas se uma nova URL for fornecida
    if (novosDados.fotoUrl) {
      usuario.fotoUrl = novosDados.fotoUrl;
    }

    this.salvarDados();
  }

  /**
   * Verifica se um usuário tem empréstimos ativos
   * @param {number} usuarioId - ID do usuário
   * @returns {boolean} True se o usuário tem empréstimos ativos, False caso contrário
   */
  usuarioTemEmprestimosAtivos(usuarioId) {
    return this.#emprestimos.some(
      (e) => e.usuarioId === usuarioId && e.status === "ATIVO"
    );
  }

  /**
   * Verifica se um usuário tem histórico de empréstimos
   * @param {number} usuarioId - ID do usuário
   * @returns {boolean} True se o usuário tem histórico, False caso contrário
   */
  usuarioTemHistorico(usuarioId) {
    return this.#emprestimos.some((e) => e.usuarioId === usuarioId);
  }

  /**
   * Tenta excluir ou inativar um usuário
   * @param {number} id - ID do usuário
   * @returns {Object} Resultado da operação com ação realizada e usuário
   * @throws {Error} Se o usuário não for encontrado ou tiver empréstimos ativos
   */
  tentarExcluirOuInativarUsuario(id) {
    const usuario = this.buscarUsuarioPorId(id);
    if (!usuario) throw new Error("Usuário não encontrado.");

    if (this.usuarioTemEmprestimosAtivos(id)) {
      throw new Error(
        "Não é possível inativar ou excluir um usuário com empréstimos ativos."
      );
    }

    if (this.usuarioTemHistorico(id)) {
      // Tem histórico, inativa
      usuario.inativar();
      this.salvarDados();
      return { acao: "inativado", usuario };
    } else {
      // Não tem histórico, exclui
      const index = this.#usuarios.findIndex((u) => u.id === id);
      this.#usuarios.splice(index, 1);
      this.salvarDados();
      return { acao: "excluido", usuario };
    }
  }

  /**
   * Força a exclusão de um usuário e todo seu histórico
   * @param {number} id - ID do usuário
   * @throws {Error} Se o usuário não for encontrado ou tiver empréstimos ativos
   */
  forcarExclusaoUsuario(id) {
    const usuario = this.buscarUsuarioPorId(id);
    if (!usuario) throw new Error("Usuário não encontrado.");

    if (this.usuarioTemEmprestimosAtivos(id)) {
      throw new Error(
        "Não é possível forçar a exclusão de um usuário com empréstimos ativos."
      );
    }

    // 1. Remove o histórico de empréstimos
    this.#emprestimos = this.#emprestimos.filter((e) => e.usuarioId !== id);

    // 2. Remove o usuário
    const index = this.#usuarios.findIndex((u) => u.id === id);
    this.#usuarios.splice(index, 1);

    this.salvarDados();
  }

  // ==========================================================
  // MÉTODOS DE BUSCA (LEITURA)
  // ==========================================================

  /**
   * Obtém todos os autores
   * @returns {Array<Autor>} Array de autores
   */
  getAutores() {
    return [...this.#autores];
  }

  /**
   * Obtém todos os livros
   * @returns {Array<Livro>} Array de livros
   */
  getLivros() {
    return [...this.#livros];
  }

  /**
   * Obtém todos os exemplares
   * @returns {Array<Exemplar>} Array de exemplares
   */
  getExemplares() {
    return [...this.#exemplares];
  }

  /**
   * Obtém todos os usuários
   * @returns {Array<Usuario>} Array de usuários
   */
  getUsuarios() {
    return [...this.#usuarios];
  }

  /**
   * Obtém todos os empréstimos
   * @returns {Array<Emprestimo>} Array de empréstimos
   */
  getEmprestimos() {
    return [...this.#emprestimos];
  }

  /**
   * Obtém todas as reservas
   * @returns {Array<Reserva>} Array de reservas
   */
  getReservas() {
    return [...this.#reservas];
  }

  /**
   * Busca um autor por ID
   * @param {number} id - ID do autor
   * @returns {Autor|undefined} Autor encontrado ou undefined
   */
  buscarAutorPorId(id) {
    return this.#autores.find((autor) => autor.id === id);
  }

  /**
   * Busca um livro por ID
   * @param {number} id - ID do livro
   * @returns {Livro|undefined} Livro encontrado ou undefined
   */
  buscarLivroPorId(id) {
    return this.#livros.find((livro) => livro.id === id);
  }

  /**
   * Busca um exemplar por ID
   * @param {number} id - ID do exemplar
   * @returns {Exemplar|undefined} Exemplar encontrado ou undefined
   */
  buscarExemplarPorId(id) {
    return this.#exemplares.find((ex) => ex.id === id);
  }

  /**
   * Busca um usuário por ID
   * @param {number} id - ID do usuário
   * @returns {Usuario|undefined} Usuário encontrado ou undefined
   */
  buscarUsuarioPorId(id) {
    return this.#usuarios.find((u) => u.id == id);
  }

  /**
   * Busca um empréstimo por ID
   * @param {number} id - ID do empréstimo
   * @returns {Emprestimo|undefined} Empréstimo encontrado ou undefined
   */
  buscarEmprestimoPorId(id) {
    return this.#emprestimos.find((e) => e.id === id);
  }

  // ==========================================================
  // MÉTODOS DE VALIDAÇÃO E UTILITÁRIOS
  // ==========================================================

  /**
   * Valida se uma URL de imagem é válida
   * @param {string} url - URL da imagem
   * @throws {ImagemInvalidaError} Se a URL for inválida
   */
  validarImagemUrl(url) {
    const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    if (url && !urlRegex.test(url)) {
      throw new ImagemInvalidaError("A URL da imagem fornecida é inválida.");
    }
  }

  /**
   * Obtém a URL da imagem padrão para um tipo específico
   * @param {string} tipo - Tipo de entidade ("autor", "usuario", "livro")
   * @returns {string} URL da imagem padrão
   */
  obterImagemPadrao(tipo) {
    switch (tipo) {
      case "autor":
        return "https://jeancoelho.com.br/biblioteca/JC_Biblioteca/assets/images/foto.jpeg";
      case "usuario":
        return "https://jeancoelho.com.br/biblioteca/JC_Biblioteca/assets/images/foto.jpeg";
      case "livro":
        return "https://jeancoelho.com.br/biblioteca/JC_Biblioteca/assets/images/capa.jpeg";
      default:
        return "https://jeancoelho.com.br/biblioteca/JC_Biblioteca/assets/images/foto.jpeg";
    }
  }

  /**
   * Busca livros por título (busca parcial case-insensitive)
   * @param {string} titulo - Título ou parte do título a ser buscado
   * @returns {Array<Livro>} Array de livros que correspondem à busca
   */
  buscarLivroPorTitulo(titulo) {
    return this.#livros.filter((livro) =>
      livro.titulo.toLowerCase().includes(titulo.toLowerCase())
    );
  }

  /**
   * Adiciona um novo empréstimo à biblioteca
   * @param {Emprestimo} emprestimo - Instância de Emprestimo a ser adicionada
   * @throws {Error} Se o objeto não for uma instância de Emprestimo
   */
  adicionarEmprestimo(emprestimo) {
    if (!(emprestimo instanceof Emprestimo)) {
      throw new Error("O objeto deve ser uma instância de Emprestimo");
    }

    if (emprestimo.id === null) {
      emprestimo.id = this.gerarNovoId("emprestimo");
    }
    this.#emprestimos.push(emprestimo);
    this.salvarDados();
  }

  /**
   * Limpa todos os dados da biblioteca (apenas para testes/debug)
   */
  limparDados() {
    this.#autores = [];
    this.#livros = [];
    this.#exemplares = [];
    this.#usuarios = [];
    this.#emprestimos = [];
    this.#reservas = [];
    this.salvarDados();
  }
}

export { Biblioteca };
