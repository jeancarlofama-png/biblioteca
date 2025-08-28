// /src/classes/ImageManager.js

import { ImagemInvalidaError } from "../errors/ImagemInvalidaError.js";

// Gerencia o upload e a validação de imagens.

class ImageManager {
  // Converte um arquivo de imagem local para uma string Base64.

  static async fazerUploadImagem(arquivo) {
    if (!ImageManager.validarImagem(arquivo)) {
      throw new ImagemInvalidaError(
        "O arquivo selecionado não é uma imagem válida ou é muito grande."
      );
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        resolve(e.target.result); // Resolve com a string Base64
      };

      reader.onerror = (e) => {
        reject(new ImagemInvalidaError("Erro ao ler o arquivo de imagem."));
      };

      reader.readAsDataURL(arquivo);
    });
  }

  static validarImagem(arquivo) {
    const tiposPermitidos = ["image/jpeg", "image/png", "image/gif"];
    const tamanhoMaximo = 2 * 1024 * 1024; // 2 MB

    if (!arquivo) return false;

    if (!tiposPermitidos.includes(arquivo.type)) {
      console.error("Tipo de arquivo não permitido:", arquivo.type);
      return false;
    }

    if (arquivo.size > tamanhoMaximo) {
      console.error("Tamanho do arquivo excede o limite (2MB):", arquivo.size);
      return false;
    }

    return true;
  }
}

export { ImageManager };
