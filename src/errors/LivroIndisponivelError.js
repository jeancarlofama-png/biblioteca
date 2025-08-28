// /src/errors/LivroIndisponivelError.js
class LivroIndisponivelError extends Error {
  constructor(message = "Livro não está disponível para empréstimo.") {
    super(message);
    this.name = "LivroIndisponivelError";
  }
}
export { LivroIndisponivelError };
