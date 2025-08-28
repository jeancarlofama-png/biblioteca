// /src/classes/LocalStorageManager.js

class LocalStorageManager {
  static salvarDados(chave, dados) {
    try {
      const dadosSerializados = JSON.stringify(dados);
      localStorage.setItem(chave, dadosSerializados);
    } catch (error) {
      console.error(`Erro ao salvar dados na chave "${chave}":`, error);
    }
  }

  static carregarDados(chave) {
    try {
      const dadosSerializados = localStorage.getItem(chave);
      if (dadosSerializados) {
        return JSON.parse(dadosSerializados);
      }
      return null;
    } catch (error) {
      console.error(`Erro ao carregar dados da chave "${chave}":`, error);
      return null;
    }
  }
}

export { LocalStorageManager };
