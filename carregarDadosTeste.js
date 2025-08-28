import { Biblioteca } from "./src/classes/Biblioteca.js";
import { Autor } from "./src/classes/Autor.js";
import { Livro } from "./src/classes/Livro.js";
import { Exemplar } from "./src/classes/Exemplar.js";
import { UsuarioAluno } from "./src/classes/UsuarioAluno.js";
import { UsuarioProfessor } from "./src/classes/UsuarioProfessor.js";
import { UsuarioFuncionario } from "./src/classes/UsuarioFuncionario.js";

/**
 * Popula o sistema com dados de teste para Autores, Livros, Exemplares e Usuários.
 */
function popularDadosDeTeste() {
  console.log("Iniciando a carga de dados de teste...");
  const biblioteca = Biblioteca.getInstance();

  // Limpar o LocalStorage antes de popular
  biblioteca.limparDados();

  // --- 1. POPULAR AUTORES ---
  const autoresData = [
    [
      "Gabriel García Márquez",
      "Colombiana",
      "1927-03-06",
      "https://github.com/jeancarlofama-png/biblioteca/tree/main/assets/images/assets/images/foto.jpeg",
    ],
    [
      "Machado de Assis",
      "Brasileira",
      "1839-06-21",
      "http://127.0.0.1:5500/assets/images/foto.jpeg",
    ],
    [
      "Clarice Lispector",
      "Brasileira",
      "1920-12-10",
      "http://127.0.0.1:5500/assets/images/foto.jpeg",
    ],
    [
      "George Orwell",
      "Britânica",
      "1903-06-25",
      "http://127.0.0.1:5500/assets/images/foto.jpeg",
    ],
    [
      "Isaac Asimov",
      "Russo-Americana",
      "1920-01-02",
      "http://127.0.0.1:5500/assets/images/foto.jpeg",
    ],
    [
      "Agatha Christie",
      "Britânica",
      "1890-09-15",
      "http://127.0.0.1:5500/assets/images/foto.jpeg",
    ],
    [
      "J.K. Rowling",
      "Britânica",
      "1965-07-31",
      "http://127.0.0.1:5500/assets/images/foto.jpeg",
    ],
    [
      "Stephen King",
      "Americana",
      "1947-09-21",
      "http://127.0.0.1:5500/assets/images/foto.jpeg",
    ],
    [
      "Haruki Murakami",
      "Japonesa",
      "1949-01-12",
      "http://127.0.0.1:5500/assets/images/foto.jpeg",
    ],
    [
      "Guimarães Rosa",
      "Brasileira",
      "1908-06-25",
      "http://127.0.0.1:5500/assets/images/foto.jpeg",
    ],
    [
      "Jane Austen",
      "Britânica",
      "1775-12-16",
      "http://127.0.0.1:5500/assets/images/foto.jpeg",
    ],

    [
      "Tolkien",
      "Britânica",
      "1892-01-03",
      "http://127.0.0.1:5500/assets/images/foto.jpeg",
    ],
    [
      "C.S. Lewis",
      "Britânica",
      "1898-11-29",
      "http://127.0.0.1:5500/assets/images/foto.jpeg",
    ],
    [
      "L. M. Montgomery",
      "Canadense",
      "1874-11-30",
      "http://127.0.0.1:5500/assets/images/foto.jpeg",
    ],
    [
      "Antoine de Saint-Exupéry",
      "Francesa",
      "1900-06-29",
      "http://127.0.0.1:5500/assets/images/foto.jpeg",
    ],
    [
      "Sun Tzu",
      "Chinesa",
      "544-01-01",
      "http://127.0.0.1:5500/assets/images/foto.jpeg",
    ],
    [
      "Laozi",
      "Chinesa",
      "604-01-01",
      "http://127.0.0.1:5500/assets/images/foto.jpeg",
    ],
    [
      "Confúcio",
      "Chinesa",
      "551-09-28",
      "http://127.0.0.1:5500/assets/images/foto.jpeg",
    ],
    [
      "Platão",
      "Grega",
      "428-01-01",
      "http://127.0.0.1:5500/assets/images/foto.jpeg",
    ],
    [
      "Aristóteles",
      "Grega",
      "384-01-01",
      "http://127.0.0.1:5500/assets/images/foto.jpeg",
    ],
  ];
  autoresData.forEach((data) => biblioteca.adicionarAutor(new Autor(...data)));
  console.log(`✅ ${autoresData.length} autores carregados.`);

  const autores = biblioteca.getAutores();

  // --- 2. POPULAR LIVROS E EXEMPLARES ---
  const livrosData = [
    [
      "Cem Anos de Solidão",
      autores[0].id,
      "978-0307474728",
      1967,
      "Realismo Mágico",
      "Sudamericana",
      "http://127.0.0.1:5500/assets/images/capa.jpeg",
    ],
    [
      "Memórias Póstumas de Brás Cubas",
      autores[1].id,
      "978-8574480004",
      1881,
      "Romance",
      "Ateliê Editorial",
      "http://127.0.0.1:5500/assets/images/capa.jpeg",
    ],
    [
      "A Hora da Estrela",
      autores[2].id,
      "978-8532507858",
      1977,
      "Ficção Filosófica",
      "Rocco",
      "http://127.0.0.1:5500/assets/images/capa.jpeg",
    ],
    [
      "1984",
      autores[3].id,
      "978-0451524935",
      1949,
      "Distopia",
      "Signet Classic",
      "http://127.0.0.1:5500/assets/images/capa.jpeg",
    ],
    [
      "Fundação",
      autores[4].id,
      "978-0553293357",
      1951,
      "Ficção Científica",
      "Bantam Spectra",
      "http://127.0.0.1:5500/assets/images/capa.jpeg",
    ],
    [
      "E Não Sobrou Nenhum",
      autores[5].id,
      "978-0062073488",
      1939,
      "Mistério",
      "William Morrow",
      "http://127.0.0.1:5500/assets/images/capa.jpeg",
    ],
    [
      "Harry Potter e a Pedra Filosofal",
      autores[6].id,
      "978-0747532743",
      1997,
      "Fantasia",
      "Bloomsbury",
      "http://127.0.0.1:5500/assets/images/capa.jpeg",
    ],
    [
      "A Coisa",
      autores[7].id,
      "978-0451169518",
      1986,
      "Terror",
      "Viking",
      "http://127.0.0.1:5500/assets/images/capa.jpeg",
    ],
    [
      "Kafka à Beira-Mar",
      autores[8].id,
      "978-0385343455",
      2002,
      "Ficção",
      "Knopf",
      "http://127.0.0.1:5500/assets/images/capa.jpeg",
    ],
    [
      "Grande Sertão: Veredas",
      autores[9].id,
      "978-8520935541",
      1956,
      "Romance",
      "Nova Fronteira",
      "http://127.0.0.1:5500/assets/images/capa.jpeg",
    ],
    [
      "Orgulho e Preconceito",
      autores[10].id,
      "978-0141439518",
      1813,
      "Romance",
      "Penguin",
      "http://127.0.0.1:5500/assets/images/capa.jpeg",
    ],
    [
      "O Hobbit",
      autores[11].id,
      "978-0618053267",
      1937,
      "Fantasia",
      "Allen & Unwin",
      "http://127.0.0.1:5500/assets/images/capa.jpeg",
    ],
    [
      "As Crônicas de Nárnia",
      autores[12].id,
      "978-0064471190",
      1950,
      "Fantasia",
      "Geoffrey Bles",
      "http://127.0.0.1:5500/assets/images/capa.jpeg",
    ],
    [
      "Anne de Green Gables",
      autores[13].id,
      "978-0553213133",
      1908,
      "Ficção",
      "L.C. Page & Co.",
      "http://127.0.0.1:5500/assets/images/capa.jpeg",
    ],
    [
      "O Pequeno Príncipe",
      autores[14].id,
      "978-0156013928",
      1943,
      "Fábula",
      "Reynal & Hitchcock",
      "http://127.0.0.1:5500/assets/images/capa.jpeg",
    ],
    [
      "A Arte da Guerra",
      autores[15].id,
      "978-0195014761",
      -500,
      "Filosofia",
      "Penguin",
      "http://127.0.0.1:5500/assets/images/capa.jpeg",
    ],
    [
      "Tao Te Ching",
      autores[16].id,
      "978-0385038317",
      -600,
      "Filosofia",
      "Penguin",
      "http://127.0.0.1:5500/assets/images/capa.jpeg",
    ],
    [
      "Analectos de Confúcio",
      autores[17].id,
      "978-0486443493",
      -500,
      "Filosofia",
      "Dover",
      "http://127.0.0.1:5500/assets/images/capa.jpeg",
    ],
    [
      "A República",
      autores[18].id,
      "978-0872200000",
      -380,
      "Filosofia",
      "Hackett",
      "http://127.0.0.1:5500/assets/images/capa.jpeg",
    ],
    [
      "Ética a Nicômaco",
      autores[19].id,
      "978-0140449490",
      -350,
      "Filosofia",
      "Penguin",
      "http://127.0.0.1:5500/assets/images/capa.jpeg",
    ],
  ];
  livrosData.forEach((data) => {
    const novoLivro = new Livro(...data);
    biblioteca.adicionarLivro(novoLivro);

    const numExemplares = Math.floor(Math.random() * 5) + 1; // 1 a 5 exemplares por livro
    for (let i = 0; i < numExemplares; i++) {
      const exemplar = new Exemplar(novoLivro.id, `Estante A${i + 1}`);
      biblioteca.adicionarExemplar(exemplar);
    }
  });
  console.log(`✅ ${livrosData.length} livros e seus exemplares carregados.`);

  // --- 3. POPULAR USUÁRIOS ---
  const usuarios = [
    new UsuarioAluno(
      "João da Silva",
      "A101",
      "joao@email.com",
      "9999-1111",
      "http://127.0.0.1:5500/assets/images/foto.jpeg"
    ),
    new UsuarioAluno(
      "Maria Souza",
      "A102",
      "maria@email.com",
      "9999-2222",
      "http://127.0.0.1:5500/assets/images/foto.jpeg"
    ),
    new UsuarioAluno(
      "Carlos Pereira",
      "A103",
      "carlos@email.com",
      "9999-3333",
      "http://127.0.0.1:5500/assets/images/foto.jpeg"
    ),
    new UsuarioAluno(
      "Ana Lima",
      "A104",
      "ana@email.com",
      "9999-4444",
      "http://127.0.0.1:5500/assets/images/foto.jpeg"
    ),
    new UsuarioProfessor(
      "Dr. Ricardo Santos",
      "P201",
      "ricardo@email.com",
      "8888-1111",
      "http://127.0.0.1:5500/assets/images/foto.jpeg"
    ),
    new UsuarioProfessor(
      "Dra. Fernanda Costa",
      "P202",
      "fernanda@email.com",
      "8888-2222",
      "http://127.0.0.1:5500/assets/images/foto.jpeg"
    ),
    new UsuarioProfessor(
      "Prof. José Oliveira",
      "P203",
      "jose@email.com",
      "8888-3333",
      "http://127.0.0.1:5500/assets/images/foto.jpeg"
    ),
    new UsuarioProfessor(
      "Profa. Paula Almeida",
      "P204",
      "paula@email.com",
      "8888-4444",
      "http://127.0.0.1:5500/assets/images/foto.jpeg"
    ),
    new UsuarioFuncionario(
      "Pedro Rocha",
      "F301",
      "pedro@email.com",
      "7777-1111",
      "http://127.0.0.1:5500/assets/images/foto.jpeg"
    ),
    new UsuarioFuncionario(
      "Julia Gomes",
      "F302",
      "julia@email.com",
      "7777-2222",
      "http://127.0.0.1:5500/assets/images/foto.jpeg"
    ),
    new UsuarioFuncionario(
      "Lucia Martins",
      "F303",
      "lucia@email.com",
      "7777-3333",
      "http://127.0.0.1:5500/assets/images/foto.jpeg"
    ),
    new UsuarioFuncionario(
      "Fernando Silva",
      "F304",
      "fernando@email.com",
      "7777-4444",
      "http://127.0.0.1:5500/assets/images/foto.jpeg"
    ),
  ];
  usuarios.forEach((usuario) => biblioteca.adicionarUsuario(usuario));
  console.log(`✅ ${usuarios.length} usuários carregados.`);

  console.log(
    "Carga de dados de teste finalizada. Verifique o LocalStorage e a interface."
  );

  // Agora, você pode verificar se os dados foram salvos corretamente.
  console.log("Dados salvos:", {
    autores: biblioteca.getAutores().length,
    livros: biblioteca.getLivros().length,
    exemplares: biblioteca.getExemplares().length,
    usuarios: biblioteca.getUsuarios().length,
  });
}

// Expõe a função para ser chamada pelo HTML
window.popularDadosDeTeste = popularDadosDeTeste;
window.limparDados = () => {
  const biblioteca = Biblioteca.getInstance();
  biblioteca.limparDados();
  console.log("LocalStorage limpo com sucesso!");
  alert("LocalStorage limpo com sucesso!");
};
