/**
 * ========================================
 * APP - Inicialização Principal
 * ========================================
 * Ponto de entrada da aplicação.
 * Inicializa Store e UI, configura debug.
 * ========================================
 */

// Copia o item atual quando o usuário navega pelos botões Próximo/Anterior.
function copiarTexto(texto) {
  if (!texto) return;

  const copiarComFallback = () => {
    const campoTemporario = document.createElement('textarea');
    campoTemporario.value = texto;
    campoTemporario.setAttribute('readonly', '');
    campoTemporario.style.position = 'fixed';
    campoTemporario.style.left = '-9999px';
    campoTemporario.style.top = '0';
    document.body.appendChild(campoTemporario);
    campoTemporario.focus();
    campoTemporario.select();

    let copiado = false;
    try {
      copiado = document.execCommand('copy');
    } catch (erro) {
      console.warn('Não foi possível copiar automaticamente:', erro);
    }

    campoTemporario.remove();
    if (!copiado) {
      console.warn('A cópia automática não foi suportada por este navegador.');
    }
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(texto).catch(copiarComFallback);
  } else {
    copiarComFallback();
  }
}

// Aguarda DOM pronto
document.addEventListener('DOMContentLoaded', () => {
  // Inicializa Store (já criada em store.js como singleton)
  const store = window.store;

  // Inicializa UI
  const ui = new window.UI(store);

  // A cópia é acionada pelo clique, aproveitando a permissão temporária do navegador.
  [ui.elements.btnPrev, ui.elements.btnNext].forEach((botao) => {
    botao.addEventListener('click', () => {
      const valorAtual = store.getCurrentItem();
      if (valorAtual !== null) {
        copiarTexto(String(valorAtual));
      }
    });
  });

  // Expõe para debug no console
  window.app = {
    store,
    ui,
    // Helpers para debug
    getState: () => store.getState(),
    addTestData: () => {
      store.addData(1, 'item1, item2, item3, item4, item5, item6, item7');
      store.addData(2, 'item3, item5, item8');
    },
    clearAll: () => store.clearAll(),
  };

  // Log de boas-vindas no console
  console.log('%c🚀 Otimizador de Dados 20.14', 'font-size: 16px; font-weight: bold; color: #2563eb;');
  console.log('%cComandos de debug disponíveis em window.app:', 'color: #6b7280;');
  console.log('  - app.getState()        // Estado atual');
  console.log('  - app.addTestData()     // Adiciona dados de teste');
  console.log('  - app.clearAll()        // Limpa tudo');
  console.log('');
  console.log('Atalhos de teclado:');
  console.log('  ← / →          Navegar itens');
  console.log('  Ctrl+K         Manter 1 ocorrência');
  console.log('  Ctrl+D         Eliminar duplicatas');
  console.log('  Ctrl+Delete    Limpar tudo');
  console.log('  Escape         Focar input');

  // Verifica se há dados migrados e avisa
  const state = store.getState();
  if (state.coluna1.length > 0 || state.coluna2.length > 0) {
    console.log(`📦 Dados carregados: Coluna 1 (${state.coluna1.length}), Coluna 2 (${state.coluna2.length})`);
  }
});

// Tratamento global de erros não capturados
window.addEventListener('error', (event) => {
  console.error('Erro não tratado:', event.error);
  // Em produção, poderia enviar para serviço de monitoramento
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rejeitada não tratada:', event.reason);
  event.preventDefault(); // Evita log padrão do browser
});
