// /src/classes/Usuario.js

class Usuario {
  #id;
  #nome;
  #matricula;
  #email;
  #telefone;
  #fotoUrl;
  #historicoEmprestimos;
  #multasPendentes;
  #tipo;
  #status; // << NOVO

  constructor(nome, matricula, email, telefone, fotoUrl, id = null) {
    if (new.target === Usuario) {
      throw new Error(
        "Não é possível instanciar a classe Usuario diretamente..."
      );
    }

    this.#id = id;
    this.#nome = nome;
    this.#matricula = matricula;
    this.#email = email;
    this.#telefone = telefone;
    this.#fotoUrl = fotoUrl;
    this.#historicoEmprestimos = [];
    this.#multasPendentes = 0;
    this.#tipo = this.constructor.name;
    this.#status = "ATIVO";
  }

  // Getters
  get status() {
    return this.#status;
  }

  // Getters
  get id() {
    return this.#id !== undefined ? this.#id : null;
  }
  get nome() {
    return this.#nome !== undefined ? this.#nome : null;
  }
  get matricula() {
    return this.#matricula;
  }
  get email() {
    return this.#email;
  }
  get telefone() {
    return this.#telefone;
  }
  get fotoUrl() {
    return this.#fotoUrl;
  }
  get historicoEmprestimos() {
    return this.#historicoEmprestimos;
  }
  get multasPendentes() {
    return this.#multasPendentes;
  }
  get tipo() {
    return this.#tipo;
  }

  // Setters
  set id(novoId) {
    if (this.#id !== null) {
      console.warn(
        "O ID de um usuário não deve ser alterado após a sua criação."
      );
      return;
    }
    this.#id = novoId;
  }

  set nome(novoNome) {
    this.#nome = novoNome;
  }

  set matricula(novaMatricula) {
    this.#matricula = novaMatricula;
  }

  set email(novoEmail) {
    this.#email = novoEmail;
  }

  set telefone(novoTelefone) {
    this.#telefone = novoTelefone;
  }

  set fotoUrl(novaUrl) {
    this.#fotoUrl = novaUrl;
  }

  inativar() {
    this.#status = "INATIVO";
  }

  reativar() {
    this.#status = "ATIVO";
  }

  // Métodos Abstratos
  limiteEmprestimos() {
    throw new Error(
      "O método limiteEmprestimos() deve ser implementado na classe filha."
    );
  }
  prazoEmprestimoDias() {
    throw new Error(
      "O método prazoEmprestimoDias() deve ser implementado na classe filha."
    );
  }

  adicionarEmprestimo(emprestimo) {
    this.#historicoEmprestimos.push(emprestimo);
  }
  registrarDevolucao(emprestimoId) {}
  adicionarMulta(valor) {
    if (valor > 0) {
      this.#multasPendentes += valor;
    }
  }
  pagarMulta(valorPago) {
    this.#multasPendentes -= valorPago;
    if (this.#multasPendentes < 0) {
      this.#multasPendentes = 0;
    }
    return this.#multasPendentes;
  }
  podeFazerEmprestimo() {
    return this.#multasPendentes === 0;
  }
  carregarDadosSerializados(historicoEmprestimos, multasPendentes, status) {
    if (historicoEmprestimos) {
      this.#historicoEmprestimos = historicoEmprestimos;
    }
    if (multasPendentes !== undefined) {
      this.#multasPendentes = parseFloat(multasPendentes);
    }
    if (status) {
      this.#status = status;
    }
  }

  toJSON() {
    return {
      id: this.#id,
      nome: this.#nome,
      matricula: this.#matricula,
      email: this.#email,
      telefone: this.#telefone,
      fotoUrl: this.#fotoUrl,
      historicoEmprestimos: this.#historicoEmprestimos,
      multasPendentes: this.#multasPendentes,
      tipo: this.#tipo,
      status: this.#status,
    };
  }

  static fromJSON(json, constructor) {
    const usuario = new constructor(
      json.nome,
      json.matricula,
      json.email,
      json.telefone,
      json.fotoUrl,
      parseInt(json.id)
    );
    usuario.carregarDadosSerializados(
      json.historicoEmprestimos,
      json.multasPendentes,
      json.status // Passa o status
    );
    return usuario;
  }
}

export { Usuario };
