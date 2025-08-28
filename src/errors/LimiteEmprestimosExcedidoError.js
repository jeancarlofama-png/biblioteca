// /src/errors/LimiteEmprestimosExcedidoError.js
class LimiteEmprestimosExcedidoError extends Error {
  constructor(message = "O usuário excedeu o limite de empréstimos.") {
    super(message);
    this.name = "LimiteEmprestimosExcedidoError";
  }
}
export { LimiteEmprestimosExcedidoError };
