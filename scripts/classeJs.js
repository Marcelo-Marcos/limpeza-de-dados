class Pessoa {
  constructor(cpf, nome) {
    this.cpf = cpf;
    this.nome = nome;
  }

  exibirDados() {
    return `Nome: ${this.nome}, CPF: ${this.cpf}`;
  }
}

// Exemplo de uso:
const pessoa1 = new Pessoa('', '');
//pessoa1.nome = "Marcos";
//pessoa1.exibirDados();


