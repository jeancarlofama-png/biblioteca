// /src/classes/Livro.js

class Livro {
  #id;
  #autorId;
  #exemplaresDisponiveis;

  constructor(
    titulo,
    autorId,
    isbn,
    anoPublicacao,
    genero,
    editora,
    capaUrl,
    id = null
  ) {
    if (typeof autorId !== "number") {
      throw new Error("O ID do autor deve ser um número.");
    }

    this.#id = id;
    this.titulo = titulo;
    this.#autorId = autorId;
    this.isbn = isbn;
    this.anoPublicacao = anoPublicacao;
    this.genero = genero;
    this.editora = editora;
    this.capaUrl = capaUrl;

    this.#exemplaresDisponiveis = 0;
  }

  // Getters e setters
  get id() {
    return this.#id;
  }

  get autorId() {
    return this.#autorId;
  }

  get exemplaresDisponiveis() {
    return this.#exemplaresDisponiveis;
  }

  set id(novoId) {
    if (this.#id !== null) {
      console.warn(
        "O ID de um livro não deve ser alterado após a sua criação."
      );
      return;
    }
    this.#id = novoId;
  }
  set autorId(novoAutorId) {
    if (typeof novoAutorId !== "number" || novoAutorId <= 0) {
      throw new Error("O ID do autor deve ser um número válido.");
    }
    this.#autorId = novoAutorId;
  }

  atualizarExemplaresDisponiveis(quantidade) {
    this.#exemplaresDisponiveis = quantidade;
  }

  toJSON() {
    return {
      id: this.#id,
      titulo: this.titulo,
      autorId: this.#autorId,
      isbn: this.isbn,
      anoPublicacao: this.anoPublicacao,
      genero: this.genero,
      editora: this.editora,
      capaUrl: this.capaUrl,
      exemplaresDisponiveis: this.#exemplaresDisponiveis,
    };
  }

  static fromJSON(json) {
    const livro = new Livro(
      json.titulo,
      json.autorId,
      json.isbn,
      json.anoPublicacao,
      json.genero,
      json.editora,
      json.capaUrl,
      json.id
    );
    livro.atualizarExemplaresDisponiveis(json.exemplaresDisponiveis);
    return livro;
  }
}

export { Livro };
