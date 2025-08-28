// /src/classes/Exemplar.js

import { Livro } from "./Livro.js";

// Representa uma cópia física de um livro,
// visto que um livro pode ter mais de uma copia disponivel

class Exemplar {
  #id;
  #livroId;
  #status; // DISPONÍVEL, EMPRESTADO, RESERVADO, EM_MANUTENCAO
  #localizacao;
  #historicoExemplar; // Array de objetos de histórico xxx

  constructor(livroId, localizacao, id = null) {
    if (typeof livroId !== "number" || livroId <= 0) {
      throw new Error("O ID do livro é inválido.");
    }

    this.#id = id;
    this.#livroId = livroId;
    this.#status = "DISPONÍVEL"; // Status inicial
    this.#localizacao = localizacao;
    this.#historicoExemplar = [];
  }
  obterStatus() {
    return this.#status;
  }
  // Getters
  get id() {
    return this.#id;
  }

  get livroId() {
    return this.#livroId;
  }

  get localizacao() {
    return this.#localizacao;
  }

  get historicoExemplar() {
    return this.#historicoExemplar;
  }

  //Setters
  set id(novoId) {
    if (this.#id !== null) {
      console.warn(
        "O ID de um exemplar não deve ser alterado após a sua criação."
      );
      return;
    }
    this.#id = novoId;
  }

  // controle de status
  set status(novoStatus) {
    const statusPermitidos = [
      "DISPONÍVEL",
      "EMPRESTADO",
      "RESERVADO",
      "EM_MANUTENCAO",
      "INATIVO",
    ];
    if (!statusPermitidos.includes(novoStatus)) {
      throw new Error("Status inválido.");
    }
    this.#status = novoStatus;
  }

  // Define o status do exemplar como EMPRESTADO.

  emprestar() {
    if (this.#status !== "DISPONÍVEL" && this.#status !== "RESERVADO") {
      throw new Error("O exemplar não pode ser emprestado neste momento.");
    }
    this.#status = "EMPRESTADO";
  }

  devolver() {
    this.#status = "DISPONÍVEL";
  }

  reservar() {
    if (this.#status !== "DISPONÍVEL") {
      throw new Error(
        "O exemplar só pode ser reservado se estiver disponível."
      );
    }
    this.#status = "RESERVADO";
  }

  colocarEmManutencao() {
    this.#status = "EM_MANUTENCAO";
  }

  inativar() {
    if (this.#status === "EMPRESTADO" || this.#status === "RESERVADO") {
      throw new Error(
        "Não é possível inativar um exemplar que está emprestado ou reservado."
      );
    }
    this.#status = "INATIVO";
  }

  //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  adicionarRegistroHistorico(registro) {
    this.#historicoExemplar.push(registro);
  }

  toJSON() {
    return {
      id: this.#id,
      livroId: this.#livroId,
      status: this.#status,
      localizacao: this.#localizacao,
      historicoExemplar: this.#historicoExemplar,
    };
  }

  static fromJSON(json) {
    const exemplar = new Exemplar(json.livroId, json.localizacao, json.id);
    exemplar.#status = json.status;
    exemplar.#historicoExemplar = json.historicoExemplar;
    return exemplar;
  }
}

export { Exemplar };
