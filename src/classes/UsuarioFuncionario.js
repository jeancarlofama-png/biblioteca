// /src/classes/UsuarioFuncionario.js
import { Usuario } from "./Usuario.js";

class UsuarioFuncionario extends Usuario {
  constructor(nome, matricula, email, telefone, fotoUrl, id = null) {
    super(nome, matricula, email, telefone, fotoUrl, id);
  }

  limiteEmprestimos() {
    return 5;
  }
  prazoEmprestimoDias() {
    return 20;
  }

  static fromJSON(json) {
    const usuario = new UsuarioFuncionario(
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

export { UsuarioFuncionario };
