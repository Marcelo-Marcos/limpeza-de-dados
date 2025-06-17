let lista = [];
let lista2 = [];
let contador = Number(localStorage.getItem("local"));
let acumulador = [];
let porcentagem = document.getElementById("porcentagem");
let controladorDeRegistro = 0;
let colunas = 0;

porcentagem.innerText = 0 + "%";

window.onload = () => {
  adicionaDadosCarregamento("dados", lista);
  listarDados(lista);

  lista2 = localStorage.getItem("dados2").split(",");

  valor.value = lista[contador];
  if (contador === 0 || contador + 1 === lista.length) {
    contador++;

    resultadoPorcentagem(contador, "+", 0, lista.length);

    contador--;
  } else {
    resultadoPorcentagem(contador, "+", 1, lista.length);
  }
};

function adicionaDadosStringArray(valorLista, valorPalavra) {
  let controleDeFluxo = 0;
  let valor = "";

  for (let i = 0; i < valorPalavra.length; i++) {
    if (valorPalavra[i] !== " " && valorPalavra[i] !== ",") {
      controleDeFluxo = 0;
      valor += valorPalavra[i];
    } else if (valorPalavra[i] === " " || valorPalavra[i] === ",") {
      if (controleDeFluxo === 0) {
        valorLista.push(valor);
        valor = "";
      }
      controleDeFluxo = 1;
    }
  }
}

function adicionaDadosCarregamento(dadosLista, listas) {
  let valorArmazenado = localStorage.getItem(dadosLista);

  controladorDeRegistro = Number(localStorage.getItem("controle"));

  if (controladorDeRegistro !== valorArmazenado.length) {
    let palavra = valorArmazenado + " ";
    adicionaDadosStringArray(listas, palavra);

    localStorage.setItem(dadosLista, listas);

    controladorDeRegistro = valorArmazenado.length + 1;

    localStorage.setItem("controle", controladorDeRegistro);
  } else {
    let palavra = valorArmazenado;
    adicionaDadosStringArray(listas, palavra);

    localStorage.setItem(dadosLista, palavra);
  }
}

function adicionaDados(dadosLista, listas) {
  let palavra = document.getElementById("caixa").value;
  palavra += " ";

  let valorArmazenado = localStorage.getItem(dadosLista);

  console.log(valorArmazenado);

  if (palavra.length > 1) {
    if (!valorArmazenado) {
      adicionaDadosStringArray(listas, palavra);
      localStorage.setItem(dadosLista, listas);
      window.location.reload();
    } else if (valorArmazenado && palavra) {
      valorArmazenado += "," + listas;

      adicionaDadosStringArray(listas, palavra);
      localStorage.setItem(dadosLista, listas);
      window.location.reload();
    }
  } else {
    palavra = valorArmazenado;

    alert("Insira algum dado!");
    // window.location.reload();
  }
  document.getElementById("caixa").focus();
}

function resultadoPorcentagem(numero1, operador1, numero2, numero3) {
  const RESULTADO =
    operador1 === "+"
      ? ((numero1 + numero2) / numero3) * 100
      : ((numero1 - numero2) / numero3) * 100;

  return (porcentagem.innerText = RESULTADO.toFixed(2) + "%");
}

function listarDados(listandoDados) {
  if (listandoDados.length === 0) {
    alert("Sem dados para listar!");
  }

  if (listandoDados === lista) {
    lista = localStorage.getItem("dados").split(",");
    listandoDados = lista;
  } else {
    lista2 = localStorage.getItem("dados2").split(",");
    listandoDados = lista2;
  }

  let resultado = document.getElementById("resposta");
  let caixaResultado = document.querySelector(".container__resposta");

  resultado.innerText = "";
  caixaResultado.style.display = "none";

  const selecionado = localStorage.getItem("colunas");
  if (selecionado !== null) {
    const radio = document.querySelector(`input[value="${selecionado}"]`);
    if (radio) {
      radio.checked = true;
    }
  }
  if (listandoDados) {
    let contaVoltas = -1;

    colunas = Number(selecionado);
    for (var i = 0; i < listandoDados.length; i++) {
      contaVoltas++;

      if (contaVoltas === colunas) {
        caixaResultado.style.display = "block";
        resultado.textContent += "\n";
        contaVoltas = 0;
      }
      caixaResultado.style.display = "block";
      resultado.textContent += listandoDados[i] + ",";
    }
  }
}

function mostrarColunas() {
  let resultado = document.getElementById("resposta");

  resultado.innerText = "";
  const selecionado = document.querySelector('input[name="colunas"]:checked');
  localStorage.setItem("colunas", selecionado.value);
  listarDados(lista);
}

function manterOcorrencia() {
  let contaIguais = 0;

  if ((lista[0] || lista2[0]) === undefined) {
    alert("Sem dados na lista!");
    return;
  }

  for (let i = 0; i < lista.length; i++) {
    let valor1 = lista.indexOf(lista[i]);
    let valor2 = lista.lastIndexOf(lista[i]);
    if (valor1 !== valor2) {
      lista.splice(valor2, 1);
      i = 0;
      contaIguais++;
    }
  }
  mensangemDados(1, contaIguais);
}

function eliminarDados() {
  const verificador = !localStorage.getItem("dados2")
    ? alert("Não a dados na lista!")
    : 1;

  if (verificador) {
    listarDados(lista2);
    lista = localStorage.getItem("dados").split(",");
    lista2 = localStorage.getItem("dados2").split(",");
  } else {
    return verificador;
  }

  // Usando filter para remover todas as ocorrências de `lista2`
  let listaDadosFiltrados = lista.filter((item) => !lista2.includes(item));

  mensangemDados(0, listaDadosFiltrados);
}

function mensangemDados(valorFuncao, valorMensagem) {
  let recebeTamanhoDaLista = lista.length;

  if (valorFuncao === 0) {
    if (valorMensagem.length === 0) {
      localStorage.removeItem("dados");
      localStorage.removeItem("local");
    } else {
      lista = valorMensagem;
      localStorage.setItem("dados", lista);

      alert(
        "Otimizou os dados em: " +
          resultadoPorcentagem(
            recebeTamanhoDaLista,
            "-",
            valorMensagem.length,
            recebeTamanhoDaLista
          )
      );
    }
    window.location.reload();
  } else {
    alert(
      "Otimizou os dados em: " +
        resultadoPorcentagem(valorMensagem, "+", 0, recebeTamanhoDaLista)
    );

    localStorage.setItem("dados", lista);
    window.location.reload();
  }
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
  localStorage.removeItem("colunas");
  localStorage.removeItem("controle");
  localStorage.removeItem("dados");
  localStorage.removeItem("dados2");
  localStorage.removeItem("local");

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
botao.addEventListener("click", () => listarDados(lista2));

let btMais = document.getElementById("botaoMais");
btMais.addEventListener("click", () => adicionaDados("dados", lista));

let btMais2 = document.getElementById("botaoMais2");
btMais2.addEventListener("click", () => adicionaDados("dados2", lista2));

let btEliminar = document.getElementById("zeroOcorrencia");
btEliminar.addEventListener("click", eliminarDados);

let btManter = document.getElementById("umaOcorrencia");
btManter.addEventListener("click", manterOcorrencia);

let radioSelecionado = document.querySelectorAll(".botaoRadio");
radioSelecionado.forEach((radio) =>
  radio.addEventListener("change", mostrarColunas)
);
