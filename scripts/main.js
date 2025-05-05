let lista = [];
let lista2 = [];
let valor = "";
let contador = Number(localStorage.getItem("local"));
let acumulador = [];
let porcentagem = document.getElementById("porcentagem");
porcentagem.innerText = 0 + "%";
let controladorDeRegistro = 0;
let colunas = 0;

window.onload = () => {
  adicionaDadosCarregamento();
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
}

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

function adicionaDados() {
  let palavra = document.getElementById("caixa").value;
   palavra += " ";

  let valorArmazenado = localStorage.getItem("dados");

  if (palavra.length > 0) {
    if (!valorArmazenado) {
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
  console.log(palavra)
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
      alert("Dados adicionados!");
      window.location.reload();
    } else if (valorArmazenado && palavra) {
     
      adicionaDadosStringArray2(palavra);
      
      valorArmazenado += "," + lista2;

      localStorage.setItem("dados2", valorArmazenado);
      alert("Dados adicionados!");
      window.location.reload();
    }
  } else {
    palavra = valorArmazenado;

    alert("Insira algum dado!");
  }
  document.getElementById("caixa").focus();
}

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
  
const selecionado = localStorage.getItem("colunas");
if (selecionado !== null) {
  const radio = document.querySelector(`input[value="${selecionado}"]`);
  if (radio){
  radio.checked = true;
  
}
} 
  if (lista.length === 0) {
    alert("Sem dados para listar!");
  } else {
    let contaVoltas = -1;
    
    colunas = Number(selecionado);
    for (var i = 0; i < lista.length; i++) {
      contaVoltas ++;
      
      if(contaVoltas === colunas) {
        caixaResultado.style.display = "block";
        resultado.textContent+= "\n";
        contaVoltas = 0;
      }
    caixaResultado.style.display = "block";
    resultado.textContent += lista[i]+",";
    }
  }
}

function mostrarColunas() {
  let resultado = document.getElementById("resposta");
  
  resultado.innerText = "";
    const selecionado = document.querySelector('input[name="colunas"]:checked');
    localStorage.setItem("colunas",selecionado.value);
    listarDados();
  }

function manterOcorrencia() {
  let contaIguais = 0;
  
if (lista[0] === undefined) {
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
    mensangemDados(1,contaIguais);
      }
      
function listaDados2() {
  alert("Dados na lista 2: "+localStorage.getItem("dados2").split(","));
}

function eliminarDados() {

   const verificador = !localStorage.getItem("dados2")? alert("Não a dados na lista!"): 1;
   
   if(verificador)
   {
    listaDados2();
    lista = localStorage.getItem("dados").split(",");
    lista2 = localStorage.getItem("dados2").split(",");
   }else{
     return verificador;
   }

  // Usando filter para remover todas as ocorrências de `lista2`
  let listaDadosFiltrados = lista.filter(item => !lista2.includes(item));
  
  console.log(listaDadosFiltrados)
  mensangemDados(0,listaDadosFiltrados);

    }

function mensangemDados(valorFuncao,valorMensagem){
      
      let recebeTamanhoDaLista = lista.length;

      if(valorFuncao === 0){

      if (valorMensagem.length === 0) {
        localStorage.removeItem("dados");
        localStorage.removeItem("local");
      }
      else {
    
        lista = valorMensagem;
        localStorage.setItem("dados", lista);
      
      
          alert("Otimizou os dados em: " + resultadoPorcentagem(
      recebeTamanhoDaLista,
      "-",
      valorMensagem.length,
      recebeTamanhoDaLista
    ))
            }
            window.location.reload();
    }
    else{
      alert("Otimizou os dados em: " + resultadoPorcentagem(valorMensagem, "+", 0, recebeTamanhoDaLista));
        
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
botao.addEventListener("click", listaDados2);

let btMais = document.getElementById("botaoMais");
btMais.addEventListener("click", adicionaDados);

let btMais2 = document.getElementById("botaoMais2");
btMais2.addEventListener("click", adicionaDados2);

let btEliminar = document.getElementById("zeroOcorrencia");
btEliminar.addEventListener("click", eliminarDados);

let btManter = document.getElementById("umaOcorrencia");
btManter.addEventListener("click", manterOcorrencia);

let radioSelecionado = document.querySelectorAll(".botaoRadio");
 radioSelecionado.forEach( radio=> radio.addEventListener("change",mostrarColunas));
