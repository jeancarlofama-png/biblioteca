// /src/errors/UsuarioComMultaError.js
class UsuarioComMultaError extends Error {
  constructor(
    message = "Usuário com multas pendentes não pode fazer empréstimos."
  ) {
    super(message);
    this.name = "UsuarioComMultaError";
  }
}
export { UsuarioComMultaError };
