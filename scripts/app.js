/**
 * ========================================
 * APP - Inicialização Principal
 * ========================================
 * Ponto de entrada da aplicação.
 * Inicializa Store e UI, configura debug.
 * ========================================
 */

// Aguarda DOM pronto
document.addEventListener('DOMContentLoaded', () => {
  // Inicializa Store (já criada em store.js como singleton)
  const store = window.store;
  
  // Inicializa UI
  const ui = new window.UI(store);
  
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