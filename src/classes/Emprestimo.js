class Emprestimo {
  #id;
  #exemplarId;
  #usuarioId;
  #dataEmprestimo;
  #dataPrevistaDevolucao;
  #dataRealDevolucao;
  #status; // ATIVO, CONCLUÍDO, ATRASADO

  constructor(exemplarId, usuarioId, prazoDias) {
    this.#id = null;
    this.#exemplarId = exemplarId;
    this.#usuarioId = usuarioId;
    this.#dataEmprestimo = new Date();

    // Calcula a data prevista de devolução
    const dataPrevista = new Date();
    dataPrevista.setDate(this.#dataEmprestimo.getDate() + prazoDias);
    this.#dataPrevistaDevolucao = dataPrevista;

    this.#dataRealDevolucao = null;
    this.#status = "ATIVO";
  }

  set id(novoId) {
    if (this.#id !== null && this.#id !== undefined) {
      console.warn(
        "O ID de um empréstimo não deve ser alterado após ser definido."
      );
      return;
    }
    this.#id = novoId;
  }

  // Getters
  get id() {
    return this.#id;
  }

  get exemplarId() {
    return this.#exemplarId;
  }

  get usuarioId() {
    return this.#usuarioId;
  }

  get dataEmprestimo() {
    return this.#dataEmprestimo;
  }

  get dataPrevistaDevolucao() {
    return this.#dataPrevistaDevolucao;
  }

  get dataRealDevolucao() {
    return this.#dataRealDevolucao;
  }

  get status() {
    return this.#status;
  }

  // Setters
  set id(novoId) {
    if (this.#id !== null && this.#id !== undefined) {
      console.warn(
        "O ID de um empréstimo não deve ser alterado após ser definido."
      );
      return;
    }
    this.#id = novoId;
  }

  set status(novoStatus) {
    if (["ATIVO", "CONCLUÍDO", "ATRASADO"].includes(novoStatus)) {
      this.#status = novoStatus;
    } else {
      throw new Error("Status de empréstimo inválido.");
    }
  }

  //Verifica se emprestimo esta atrasado util caso tenhamos multas
  // e para futura implementação de filtro de atrasados
  estaAtrasado() {
    if (this.#dataRealDevolucao) {
      return false;
    }
    const hoje = new Date();
    return hoje > this.#dataPrevistaDevolucao;
  }

  calcularMulta(taxaDiaria) {
    if (!this.estaAtrasado()) {
      return 0;
    }
    const hoje = new Date();
    const diasAtraso = Math.floor(
      (hoje - this.#dataPrevistaDevolucao) / (1000 * 60 * 60 * 24)
    );
    return diasAtraso * taxaDiaria;
  }

  registrarDevolucao() {
    this.#dataRealDevolucao = new Date();
    this.status = "CONCLUÍDO";
  }

  toJSON() {
    // converter datas
    const safeDateToISO = (date) => {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return null;
      }
      return date.toISOString();
    };
    return {
      id: this.#id,
      exemplarId: this.#exemplarId,
      usuarioId: this.#usuarioId,
      dataEmprestimo: safeDateToISO(this.#dataEmprestimo),
      dataPrevistaDevolucao: safeDateToISO(this.#dataPrevistaDevolucao),
      dataRealDevolucao: safeDateToISO(this.#dataRealDevolucao),
      status: this.#status,
    };
  }

  static fromJSON(json) {
    const emprestimo = new Emprestimo(
      parseInt(json.exemplarId, 10),
      parseInt(json.usuarioId, 10),
      0 // prazo não importa aqui, pois as datas serão restauradas
    );

    // Restaurar propriedades específicas
    emprestimo.#id = json.id; // ID real do JSON
    emprestimo.#dataEmprestimo = new Date(json.dataEmprestimo);
    emprestimo.#dataPrevistaDevolucao = new Date(json.dataPrevistaDevolucao);
    emprestimo.#dataRealDevolucao = json.dataRealDevolucao
      ? new Date(json.dataRealDevolucao)
      : null;
    emprestimo.#status = json.status;

    return emprestimo;
  }
}

export { Emprestimo };
