// /src/classes/Reserva.js

class Reserva {
  #id;
  #livroId;
  #usuarioId;
  #dataReserva;
  #dataExpiracao;
  #status; // ATIVA, CONCLUÍDA, EXPIRADA

  constructor(livroId, usuarioId, prazoExpiracaoDias) {
    if (typeof livroId !== "number" || typeof usuarioId !== "number") {
      throw new Error("IDs de livro e usuário devem ser numéricos.");
    }

    this.#id = Reserva.gerarNovoId();
    this.#livroId = livroId;
    this.#usuarioId = usuarioId;
    this.#dataReserva = new Date();

    const dataExpiracao = new Date(this.#dataReserva);
    dataExpiracao.setDate(this.#dataReserva.getDate() + prazoExpiracaoDias);
    this.#dataExpiracao = dataExpiracao;

    this.#status = "ATIVA";
  }

  static gerarNovoId() {
    return nextId++;
  }

  // Getters
  get id() {
    return this.#id;
  }
  get livroId() {
    return this.#livroId;
  }
  get usuarioId() {
    return this.#usuarioId;
  }
  get dataReserva() {
    return this.#dataReserva;
  }
  get dataExpiracao() {
    return this.#dataExpiracao;
  }
  get status() {
    return this.#status;
  }

  // Setters para controle do status
  set status(novoStatus) {
    if (["ATIVA", "CONCLUÍDA", "EXPIRADA"].includes(novoStatus)) {
      this.#status = novoStatus;
    } else {
      throw new Error("Status de reserva inválido.");
    }
  }

  estaAtiva() {
    return this.#status === "ATIVA";
  }

  //se a data ed expiração da reserva ja passou
  expirar() {
    if (this.estaAtiva() && new Date() > this.#dataExpiracao) {
      this.status = "EXPIRADA";
      console.log(
        `Reserva ID ${this.#id} para o livro ID ${this.#livroId} expirou.`
      );
    }
  }

  toJSON() {
    return {
      id: this.#id,
      livroId: this.#livroId,
      usuarioId: this.#usuarioId,
      dataReserva: this.#dataReserva.toISOString(),
      dataExpiracao: this.#dataExpiracao.toISOString(),
      status: this.#status,
    };
  }
}

export { Reserva };
