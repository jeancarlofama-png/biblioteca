// /src/errors/ImagemInvalidaError.js

class ImagemInvalidaError extends Error {
  constructor(message = "A imagem fornecida é inválida.") {
    super(message);
    this.name = "ImagemInvalidaError";
  }
}

export { ImagemInvalidaError };
