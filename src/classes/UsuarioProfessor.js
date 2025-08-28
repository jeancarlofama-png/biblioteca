// /src/classes/UsuarioProfessor.js
import { Usuario } from "./Usuario.js";

class UsuarioProfessor extends Usuario {
  constructor(nome, matricula, email, telefone, fotoUrl, id = null) {
    super(nome, matricula, email, telefone, fotoUrl, id);
  }

  limiteEmprestimos() {
    return 10;
  }
  prazoEmprestimoDias() {
    return 30;
  }

  static fromJSON(json) {
    const usuario = new UsuarioProfessor(
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

export { UsuarioProfessor };
