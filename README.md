Sistema de Gestão de Biblioteca
Este é um projeto de front-end que simula um sistema completo para gerenciamento de uma biblioteca. Ele foi desenvolvido utilizando JavaScript puro , HTML e CSS, com foco em Programação Orientada a Objetos para estruturar a lógica do sistema.

Objetivo do Projeto
O objetivo principal é criar uma aplicação web interativa para administrar as operações de uma biblioteca, permitindo o gerenciamento de livros, autores, usuários e empréstimos de forma eficiente e organizada. A aplicação persiste os dados localmente no navegador usando o LocalStorage.

Funcionalidades Principais
Gestão de Autores: Cadastro, alteração e exclusão de autores.

Gestão de Livros: Cadastro, alteração e exclusão de livros, com associação a um autor.

Gestão de Exemplares: Adição de múltiplas cópias (exemplares fisicos) para cada livro.
Vi a nescessidade de inclusão de exemplares por imaginar que uma biblioteca pode ter mais de um exemplar do mesmo livro e não faria sentido a duplicidade de titulos.

Gestão de Usuários: Sistema de usuários com 3 perfis diferentes (Aluno, Professor, Funcionário), cada um com suas próprias regras de empréstimo (limite de livros e prazo de devolução).

Controle de Empréstimos: Lógica para realizar empréstimos e processar devoluções.

Cálculo de Multas: Cálculo automático de multas para devoluções em atraso.

Dashboard Interativa: Uma página principal que exibe os livros disponíveis em formato de "vitrine" e permite realizar empréstimos sem acessar a aba emp´retimos.

Relatórios: Geração de relatórios, incluindo os livros mais emprestados, os usuários mais ativos e um filtro para visualizar todos os empréstimos de um usuário específico.

Persistência de Dados: Todas as informações são salvas no LocalStorage do navegador, mantendo o estado da aplicação entre as sessões.

🚀 Como Rodar o Projeto
Como este projeto utiliza Módulos JavaScript (import/export), ele precisa ser executado a partir de um servidor web local para funcionar corretamente.

Pré-requisitos:

Um navegador de internet moderno (Chrome, Firefox, Edge, etc.).

Um servidor web local.

Usando a Extensão "Live Server" no VS Code
Instale a extensão Live Server no Visual Studio Code.

Abra a pasta do projeto no VS Code.

A titulo de testes a biblioteca pode ser carregada inicialmete através do arquivo carregarDadosTeste.html

Clique com o botão direito no arquivo index.html.

Selecione a opção "Open with Live Server".

O projeto será aberto automaticamente no seu navegador, clique em "Popular LocalStorage".

Feche a janela e volte ao VS Code.

Clique com o botão direito no arquivo index.html.

Selecione a opção "Open with Live Server".

O projeto será aberto automaticamente no seu navegador.

🏛️ Estrutura das Classes
A arquitetura do sistema é orientada a objetos, dividida em classes com responsabilidades bem definidas.

Entidades Principais (Modelos de Dados)
Autor: Representa um autor, com informações como nome, nacionalidade e foto.

Livro: Representa a obra literária, contendo dados como título, ISBN, gênero e a referência ao seu autor.

Exemplar: Representa uma cópia física de um Livro. É o exemplar que é efetivamente emprestado.

Emprestimo: Registra a operação de empréstimo, associando um Usuario a um Exemplar, com datas e status.

Reserva: Modela a reserva de um Livro por um Usuario.

Hierarquia de Usuários
Usuario: Classe abstrata que define a estrutura base para todos os usuários, com atributos como nome, matrícula e métodos para controle de multas e status.

UsuarioAluno, UsuarioProfessor, UsuarioFuncionario: Classes concretas que herdam de Usuario e implementam as regras de negócio específicas para cada perfil, como o limite de empréstimos e o prazo para devolução.

Classes de Orquestração e Lógica
Biblioteca: É o coração do sistema, implementada como um Singleton. Gerencia todas as listas de entidades (livros, autores, usuários, etc.), gera IDs e centraliza o acesso aos dados. É responsável por carregar e salvar os dados no LocalStorage.

BibliotecaService: Contém a lógica de negócio para operações mais complexas que envolvem múltiplas entidades, como realizarEmprestimo e processarDevolucao, garantindo que todas as regras e validações sejam cumpridas.

Classes Utilitárias (Helpers)
LocalStorageManager: Classe estática responsável exclusivamente por serializar e salvar dados no LocalStorage, e por carregar e desserializar os dados.

Controlador da Interface (UI)
app.js: Embora não seja uma classe, este arquivo atua como o controlador da interface. Ele instancia as classes de serviço, gerencia os eventos do DOM (cliques, formulários), e chama os métodos apropriados para renderizar dinamicamente o conteúdo na tela.
