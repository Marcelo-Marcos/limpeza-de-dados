let lista = [];
let lista2 = [];
let valor = "";
let contador = Number(localStorage.getItem("local"));
let acumulador = [];
let porcentagem = document.getElementById("porcentagem");
porcentagem.innerText = 0 + "%";
let controladorDeRegistro = 0;

window.onload = () => {
  adicionaDadosCarregamento();
  adicionaDadosCarregamento2();
  listarDados();
  let valor = document.getElementById("valor");
  valor.value = lista[contador];
  if (contador === 0) {
    contador++;

    resultadoPorcentagem(contador, "+", 0, lista.length);

    contador--;
  } else if (contador + 1 === lista.length) {
    contador++;

    resultadoPorcentagem(contador, "+", 0, lista.length);

    contador--;
  } else {
    resultadoPorcentagem(contador, "+", 1, lista.length);
  }
};

//1° e 4° refatoração linhas iniciais 317
function adicionaDadosStringArray(valorPalavra) {
  let controleDeFluxo = 0;
  let palavra = valorPalavra;

  for (let i = 0; i < palavra.length; i++) {
    if (palavra[i] !== " " && palavra[i] !== ",") {
      controleDeFluxo = 0;
      valor += palavra[i];
    } else if (palavra[i] === " " || palavra[i] === ",") {
      if (controleDeFluxo === 0) {
        lista.push(valor);
        valor = "";
      }

      controleDeFluxo = 1;
    }
  }
}

function adicionaDadosStringArray2(valorPalavra) {
  let controleDeFluxo = 0;
  let palavra = valorPalavra;

  for (let i = 0; i < palavra.length; i++) {
    if (palavra[i] !== " " && palavra[i] !== ",") {
      controleDeFluxo = 0;
      valor += palavra[i];
    } else if (palavra[i] === " " || palavra[i] === ",") {
      if (controleDeFluxo === 0) {
        lista2.push(valor);
        valor = "";
      }

      controleDeFluxo = 1;
    }
  }
}

function adicionaDadosCarregamento() {
  let valorArmazenado = localStorage.getItem("dados");

  controladorDeRegistro = Number(localStorage.getItem("controle"));

  if (controladorDeRegistro !== valorArmazenado.length) {
    let palavra = valorArmazenado + " ";

    localStorage.setItem("dados", palavra);

    adicionaDadosStringArray(palavra);
    controladorDeRegistro = valorArmazenado.length + 1;

    localStorage.setItem("controle", controladorDeRegistro);
  } else {
    let palavra = valorArmazenado;

    localStorage.setItem("dados", palavra);

    adicionaDadosStringArray(palavra);
  }
}

function adicionaDadosCarregamento2() {
  let valorArmazenado = localStorage.getItem("dados2");

  controladorDeRegistro = Number(localStorage.getItem("controle"));

  if (controladorDeRegistro !== valorArmazenado.length) {
    let palavra = valorArmazenado + " ";

    localStorage.setItem("dados2", palavra);

    adicionaDadosStringArray(palavra);
    controladorDeRegistro = valorArmazenado.length + 1;

    localStorage.setItem("controle", controladorDeRegistro);
  } else {
    let palavra = valorArmazenado;

    localStorage.setItem("dados2", palavra);

    adicionaDadosStringArray2(palavra);
  }
}

function adicionaDados() {
  let palavra = document.getElementById("caixa").value;
  palavra += " ";

  let valorArmazenado = localStorage.getItem("dados");

  if (palavra.length > 1) {
    if (!valorArmazenado && palavra) {
      adicionaDadosStringArray(palavra);
      localStorage.setItem("dados", lista);
      window.location.reload();
    } else if (valorArmazenado && palavra) {
      valorArmazenado += "," + lista;

      adicionaDadosStringArray(palavra);
      localStorage.setItem("dados", lista);
      window.location.reload();
    }
  } else {
    palavra = valorArmazenado;

    alert("Insira algum dado!");
  }
  document.getElementById("caixa").focus();
}


function adicionaDados2() {
  let palavra = document.getElementById("caixa").value;
  palavra += " ";

  let valorArmazenado = localStorage.getItem("dados2");

  if (palavra.length > 1) {
    if (!valorArmazenado && palavra) {
      adicionaDadosStringArray2(palavra);
      localStorage.setItem("dados2", lista2);
      window.location.reload();
    } else if (valorArmazenado && palavra) {
      valorArmazenado += "," + lista2;

      adicionaDadosStringArray2(palavra);
      localStorage.setItem("dados2", lista2);
      window.location.reload();
    }
  } else {
    palavra = valorArmazenado;

    alert("Insira algum dado!");
  }
  document.getElementById("caixa").focus();
}

//3° refatoração linhas iniciais 317
function resultadoPorcentagem(numero1, operador1, numero2, numero3) {
  const RESULTADO =
    operador1 === "+"
      ? ((numero1 + numero2) / numero3) * 100
      : ((numero1 - numero2) / numero3) * 100;
      
  return porcentagem.innerText = RESULTADO.toFixed(2) + "%";
  
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
}

//5° refatoração linhas iniciais 317
function eliminaDados(valorFuncao) {
  let contaIguais = 0;
  let recebeTamanhoDaLista = lista.length;
  
if (lista[0] === undefined) {
    alert("Sem dados na lista!");
    return;
  } 
  
  for (let i = 0; i < lista.length; i++) {
    let valor1 = lista.indexOf(lista[i]);
    let valor2 = lista.lastIndexOf(lista[i]);
    if (valor1 !== valor2 && valorFuncao === 1) {
      lista.splice(valor2, 1);
      i = 0;
      contaIguais++;
    }
    // else if (valor1 !== valor2 && valorFuncao === 0) {
    //   acumulador.push(lista[i]);
    //   lista.splice(valor2, 1);
    //   i = 0;
    // }
    }
    
    if(valorFuncao === 1)
    {
      
alert("Otimizou os dados em: " + resultadoPorcentagem(contaIguais, "+", 0, recebeTamanhoDaLista));

  localStorage.setItem("dados", lista);
    }
     else if(valorFuncao === 0)
  {
    console.log(lista2[0]);
        // Usando filter para remover todas as ocorrências de `lista2`
  let listaDadosFiltrados = lista.filter(item => !lista2.includes(item));
  
  if (listaDadosFiltrados.length === 0) {
    localStorage.removeItem("dados");
    localStorage.removeItem("local");
  }
  else {

    // console.log(listaDadosFiltrados);
    lista = listaDadosFiltrados;
    localStorage.setItem("dados", lista);
  
  
      alert("Otimizou os dados em: " + resultadoPorcentagem(
  recebeTamanhoDaLista,
  "-",
  listaDadosFiltrados.length,
  recebeTamanhoDaLista
));
    }
    }
    window.location.reload();
    
}

function proximo() {
  let valor = document.getElementById("valor");

  if (lista[contador] === undefined) {
    alert("Sem dados para navegar!");
    contador = contador;
  } else if (contador < lista.length && lista.length - contador > 1) {
    contador++;

    localStorage.setItem("local", contador);

    resultadoPorcentagem(contador, "+", 1, lista.length);
  } else if (contador < lista.length && lista.length - contador === 1) {
    localStorage.setItem("local", contador);

    resultadoPorcentagem(contador, "+", 1, lista.length);

    alert("Último dado da lista");
  } else if (contador === lista.length) {
    const RESULTADO = (contador / lista.length) * 100;

    porcentagem.innerText = RESULTADO.toFixed(2) + "%";
    contador--;

    localStorage.setItem("local", contador);
  } else {
    resultadoPorcentagem(contador, "+", 0, lista.length);
  }

  if (lista[contador] !== undefined) {
    valor.value = lista[contador];
  }

  valor.focus();
  valor.select();
}

function anterior() {
  let valor = document.getElementById("valor");

  if (lista.length === 0) {
    alert("Sem dados para navegar!");
    contador = contador;
  } else if (contador > 0) {
    contador--;

    localStorage.setItem("local", contador);
    resultadoPorcentagem(contador, "+", 1, lista.length);
  } else if (contador === 0) {
    contador++;

    resultadoPorcentagem(contador, "+", 0, lista.length);

    contador--;

    localStorage.setItem("local", contador);

    alert("Primeiro dado da lista");
  } else {
    resultadoPorcentagem(contador, "+", 0, lista.length);
  }

  if (lista.length > 0) {
    valor.value = lista[contador];
  }
  valor.focus();
  valor.select();
}

function limpaDados() {
  localStorage.removeItem("dados");
  localStorage.removeItem("local");
  localStorage.removeItem("dados2");

  window.location.reload();

  alert("Dados apagados!");
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

let btMais2 = document.getElementById("botaoMais2");
btMais2.addEventListener("click", adicionaDados2);


let btEliminar = document.getElementById("zeroOcorrencia");
btEliminar.addEventListener("click", () => eliminaDados(0));

let btManter = document.getElementById("umaOcorrencia");
btManter.addEventListener("click", () => eliminaDados(1));
