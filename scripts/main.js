let lista = [];
let valor = "";
let contador = Number(localStorage.getItem("local"));
let acumulador = [];
let porcentagem = document.getElementById("porcentagem");
porcentagem.innerText = 0 + "%";

//   adicionaDadosCarregamento();
//   listarDados();
//   let valor = document.getElementById("valor");
//   valor.textContent = lista[contador];
// });

window.onload = () => {
  adicionaDadosCarregamento();
  listarDados();
  let valor = document.getElementById("valor");
  valor.value = lista[contador];
};

function adicionaDadosCarregamento() {
  let palavra = document.getElementById("caixa").value;

  palavra += " ";

  let valorArmazenado = localStorage.getItem("dados");

  if (
    (valorArmazenado === " " || valorArmazenado === null) &&
    palavra !== " "
  ) {
    localStorage.setItem("dados", palavra);
  } else if (
    valorArmazenado !== " " &&
    valorArmazenado !== null &&
    palavra !== " "
  ) {
    palavra = valorArmazenado + palavra;

    localStorage.setItem("dados", palavra);
  } else if (
    (valorArmazenado !== null && valorArmazenado !== " ") ||
    palavra === " "
  ) {
    palavra = valorArmazenado;
  }

  for (let i = 0; i < palavra.length; i++) {
    if (palavra[i] !== " " && palavra[i] !== ",") {
      valor += palavra[i];
    } else {
      lista.push(valor);
      valor = "";
    }
  }
}

function adicionaDados() {
  let palavra = document.getElementById("caixa").value;

  palavra += " ";

  let valorArmazenado = localStorage.getItem("dados");

  if (
    (valorArmazenado === " " || valorArmazenado === null) &&
    palavra !== " "
  ) {
    localStorage.setItem("dados", palavra);
  } else if (
    valorArmazenado !== " " &&
    valorArmazenado !== null &&
    palavra !== " "
  ) {
    palavra = valorArmazenado + palavra;

    localStorage.setItem("dados", palavra);
  } else if (
    (valorArmazenado !== null && valorArmazenado !== " ") ||
    palavra === " "
  ) {
    alert("Insira algum dado!");
    palavra = valorArmazenado;
  }

  for (let i = 0; i < palavra.length; i++) {
    if (palavra[i] !== " " && palavra[i] !== ",") {
      valor += palavra[i];
    } else {
      lista.push(valor);
      valor = "";
    }
  }

  document.getElementById("caixa").value = "";
}

function manterOcorrencia() {
  let contaIguais = 0;
  let recebeTamanhoDaLista = lista.length;
  for (let i = 0; i < lista.length; i++) {
    let valor1 = lista.indexOf(lista[i]);
    let valor2 = lista.lastIndexOf(lista[i]);
    if (valor1 !== valor2) {
      lista.splice(valor2, 1);
      i = 0;
      contaIguais++;
    }
  }
  const RESULTADO = (contaIguais / recebeTamanhoDaLista) * 100;

  let porcentagemIguais = RESULTADO.toFixed(2) + "%";

  alert("Reduziu o tempo de análise em: " + porcentagemIguais);

  localStorage.setItem("dados", lista);
}

function eliminarOcorrencia() {
  let contaIguais = 0;
  let recebeTamanhoDaLista = lista.length;
  for (let i = 0; i < lista.length; i++) {
    let valor1 = lista.indexOf(lista[i]);
    let valor2 = lista.lastIndexOf(lista[i]);

    if (valor1 !== valor2) {
      acumulador.push(lista[i]);
      lista.splice(valor2, 1);
      i = 0;
    }

     // Usando filter para remover todas as ocorrências de `valorARemover`
     let listaDadosFiltrados = lista.filter(item => !acumulador.includes(item));


     if(listaDadosFiltrados.length === 0){
       lista = 0;
     }else{
       
       lista = listaDadosFiltrados;
     }
  }

  const RESULTADO = (lista.length / recebeTamanhoDaLista) * 100;

  let porcentagemIguais = RESULTADO.toFixed(2) + "%";

  alert("Reduziu o tempo de análise em: " + porcentagemIguais);

  localStorage.setItem("dados", lista);
}

function listarDados() {
  let resultado = document.getElementById("resposta");
  let caixaResultado = document.querySelector(".container__resposta");

  if (lista.length === 0) {
    alert("Sem dados para listar!");
  } else {
    caixaResultado.style.display = "block";
    resultado.textContent = lista;
  }
  console.log(lista);
}

function proximo() {
  let valor = document.getElementById("valor");
  valor.value = lista[contador];
  if (contador < lista.length) {
    contador++;

    localStorage.setItem("local", contador);
  } else {
    alert("Último dado da lista");
  }

  const RESULTADO = (contador / lista.length) * 100;

  porcentagem.innerText = RESULTADO.toFixed(2) + "%";

  valor.focus();
  valor.select();
}

function anterior() {
  let valor = document.getElementById("valor");
  valor.value = lista[contador];
  if (contador > 0) {
    contador--;

    localStorage.setItem("local", contador);
  } else {
    alert("Primeiro dado da lista");
  }

  const RESULTADO = (contador / lista.length) * 100;

  porcentagem.innerText = RESULTADO.toFixed(2) + "%";

  valor.focus();
  valor.select();
}

function limpaDados() {
  localStorage.removeItem("dados");
  localStorage.removeItem("local");
  //   localStorage.clear();
}

let btLimpaLocal = document.getElementById("limpaLocal");
btLimpaLocal.addEventListener("click", limpaDados);

let btProximo = document.getElementById("proximo");
btProximo.addEventListener("click", proximo);

let btAnterior = document.getElementById("anterior");
btAnterior.addEventListener("click", anterior);

let botao = document.getElementById("botao");
botao.addEventListener("click", listarDados);

let btMais = document.getElementById("botaoMais");
btMais.addEventListener("click", adicionaDados);

let btEliminar = document.getElementById("zeroOcorrencia");
btEliminar.addEventListener("click", eliminarOcorrencia);

let btManter = document.getElementById("umaOcorrencia");
btManter.addEventListener("click", manterOcorrencia);
