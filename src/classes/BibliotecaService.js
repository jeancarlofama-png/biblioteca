// /src/classes/BibliotecaService.js

// ==========================================================
// IMPORTAÇÕES
// ==========================================================
import { Biblioteca } from "./Biblioteca.js";
import { Exemplar } from "./Exemplar.js";
import { Emprestimo } from "./Emprestimo.js";
import { LivroIndisponivelError } from "../errors/LivroIndisponivelError.js";
import { LimiteEmprestimosExcedidoError } from "../errors/LimiteEmprestimosExcedidoError.js";
import { UsuarioComMultaError } from "../errors/UsuarioComMultaError.js";

// ==========================================================
// CLASSE BIBLIOTECA SERVICE
// ==========================================================
/**
 * Serviço responsável por gerenciar as operações de empréstimo e devolução da biblioteca
 * Atua como uma camada de serviço entre a interface e a classe Biblioteca
 */
class BibliotecaService {
  // ==========================================================
  // CONSTRUTOR
  // ==========================================================

  /**
   * Cria uma nova instância do serviço da biblioteca
   * Obtém a instância singleton da Biblioteca
   */
  constructor() {
    this.biblioteca = Biblioteca.getInstance();
  }

  // ==========================================================
  // MÉTODOS DE EMPRÉSTIMO
  // ==========================================================

  /**
   * Realiza um empréstimo de exemplar para um usuário
   * @param {number} exemplarId - ID do exemplar a ser emprestado
   * @param {number} usuarioId - ID do usuário que está realizando o empréstimo
   * @returns {Emprestimo} O objeto Emprestimo criado
   * @throws {Error} Se o usuário não for encontrado
   * @throws {UsuarioComMultaError} Se o usuário tiver multas pendentes
   * @throws {LivroIndisponivelError} Se o exemplar não estiver disponível
   * @throws {LimiteEmprestimosExcedidoError} Se o usuário excedeu seu limite de empréstimos
   */
  realizarEmprestimo(exemplarId, usuarioId) {
    // Log para debug (pode ser removido em produção)
    console.log("Buscando usuário ID:", usuarioId, "Tipo:", typeof usuarioId);

    // 1. Validar se o usuário existe e está habilitado
    const usuario = this.biblioteca.buscarUsuarioPorId(usuarioId);
    console.log("Usuário encontrado:", usuario);

    if (!usuario) {
      throw new Error("Usuário não encontrado.");
    }

    if (!usuario.podeFazerEmprestimo()) {
      throw new UsuarioComMultaError(
        "Usuário com multas pendentes não pode fazer empréstimos."
      );
    }

    // 2. Validar se o exemplar existe e está disponível
    const exemplar = this.biblioteca.buscarExemplarPorId(exemplarId);
    if (!exemplar || exemplar.obterStatus() !== "DISPONÍVEL") {
      throw new LivroIndisponivelError(
        "O exemplar não está disponível para empréstimo."
      );
    }

    // 3. Validar limite de empréstimos do usuário
    const emprestimosAtivos = this.biblioteca
      .getEmprestimos()
      .filter((e) => e.usuarioId === usuarioId && e.status === "ATIVO").length;

    if (emprestimosAtivos >= usuario.limiteEmprestimos()) {
      throw new LimiteEmprestimosExcedidoError(
        "Limite de empréstimos do usuário excedido."
      );
    }

    // 4. Criar o registro de empréstimo
    const livro = this.biblioteca.buscarLivroPorId(exemplar.livroId);
    const emprestimo = new Emprestimo(
      exemplar.id,
      usuario.id,
      usuario.prazoEmprestimoDias()
    );

    // 5. Atualizar status do exemplar e registrar no histórico do usuário
    exemplar.emprestar();
    usuario.adicionarEmprestimo(emprestimo);

    // 6. Persistir os dados
    this.biblioteca.adicionarEmprestimo(emprestimo);
    this.biblioteca.salvarDados();

    return emprestimo;
  }

  // ==========================================================
  // MÉTODOS DE DEVOLUÇÃO
  // ==========================================================

  /**
   * Processa a devolução de um empréstimo e calcula multas se aplicável
   * @param {number} emprestimoId - ID do empréstimo a ser devolvido
   * @param {number} taxaDiaria - Taxa diária de multa por atraso
   * @returns {Object} Objeto com valor da multa e mensagem de status
   * @throws {Error} Se o empréstimo não for encontrado
   */
  processarDevolucao(emprestimoId, taxaDiaria) {
    // 1. Buscar e validar o empréstimo
    const emprestimo = this.biblioteca.buscarEmprestimoPorId(emprestimoId);
    if (!emprestimo) {
      throw new Error("Empréstimo não encontrado.");
    }

    // 2. Verificar se o empréstimo já foi devolvido
    if (emprestimo.status === "CONCLUÍDO") {
      return { multa: 0, mensagem: "Empréstimo já foi devolvido." };
    }

    // 3. Calcula a multa se houver atraso
    let multa = 0;
    if (emprestimo.estaAtrasado()) {
      multa = emprestimo.calcularMulta(taxaDiaria);

      // 4. Adiciona a multa ao usuário
      const usuario = this.biblioteca.buscarUsuarioPorId(emprestimo.usuarioId);
      if (usuario) {
        usuario.adicionarMulta(multa);
      }
    }

    // 5. Atualiza o status do empréstimo como concluído
    emprestimo.registrarDevolucao();

    // 6. Atualiza o status do exemplar como disponível
    const exemplar = this.biblioteca.buscarExemplarPorId(emprestimo.exemplarId);
    if (exemplar) {
      exemplar.devolver();
    }

    // 7. Persiste as alterações
    this.biblioteca.salvarDados();

    return {
      multa,
      mensagem: "Devolução processada com sucesso.",
    };
  }
}

// ==========================================================
// EXPORTAÇÃO
// ==========================================================
export { BibliotecaService };
