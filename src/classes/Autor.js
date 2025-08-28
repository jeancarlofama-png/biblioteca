// /src/classes/Autor.js

import { ImagemInvalidaError } from "../errors/ImagemInvalidaError.js";

class Autor {
  #id;
  #nome;
  #nacionalidade;
  #dataNascimento;
  #fotoUrl;

  constructor(nome, nacionalidade, dataNascimento, fotoUrl, id = null) {
    this.#id = id;
    this.#nome = nome;
    this.#nacionalidade = nacionalidade;
    this.#dataNascimento = dataNascimento;
    this.fotoUrl = fotoUrl;
  }

  // Getters
  get id() {
    return this.#id;
  }

  get nome() {
    return this.#nome;
  }

  get nacionalidade() {
    return this.#nacionalidade;
  }

  get dataNascimento() {
    return this.#dataNascimento;
  }

  get fotoUrl() {
    return this.#fotoUrl;
  }

  // Setters
  set id(novoId) {
    if (this.#id !== null) {
      console.warn(
        "O ID de um autor não deve ser alterado após a sua criação."
      );
      return;
    }
    this.#id = novoId;
  }

  set nome(novoNome) {
    if (!novoNome || typeof novoNome !== "string") {
      throw new Error("O nome do autor é inválido.");
    }
    this.#nome = novoNome;
  }

  set nacionalidade(novaNacionalidade) {
    if (!novaNacionalidade || typeof novaNacionalidade !== "string") {
      throw new Error("A nacionalidade do autor é inválida.");
    }
    this.#nacionalidade = novaNacionalidade;
  }

  set dataNascimento(novaData) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(novaData)) {
      throw new Error("A data de nascimento deve estar no formato AAAA-MM-DD.");
    }
    this.#dataNascimento = novaData;
  }

  set fotoUrl(novaUrl) {
    const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    if (novaUrl && !urlRegex.test(novaUrl)) {
      console.error("URL de foto do autor inválida. URL ignorada.");
      this.#fotoUrl = "";
      return;
    }
    this.#fotoUrl = novaUrl;
  }

  toJSON() {
    return {
      id: this.#id,
      nome: this.#nome,
      nacionalidade: this.#nacionalidade,
      dataNascimento: this.#dataNascimento,
      fotoUrl: this.#fotoUrl,
    };
  }

  static fromJSON(json) {
    return new Autor(
      json.nome,
      json.nacionalidade,
      json.dataNascimento,
      json.fotoUrl,
      json.id
    );
  }
}

export { Autor };
