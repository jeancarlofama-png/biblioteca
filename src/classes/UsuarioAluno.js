// /src/classes/UsuarioAluno.js
import { Usuario } from "./Usuario.js";

class UsuarioAluno extends Usuario {
  constructor(nome, matricula, email, telefone, fotoUrl, id = null) {
    super(nome, matricula, email, telefone, fotoUrl, id);
  }

  limiteEmprestimos() {
    return 3;
  }
  prazoEmprestimoDias() {
    return 15;
  }

  static fromJSON(json) {
    const usuario = new UsuarioAluno(
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
      json.status
    );
    return usuario;
  }
}

export { UsuarioAluno };
