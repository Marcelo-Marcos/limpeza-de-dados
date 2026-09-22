/**
 * ========================================
 * UI - Camada de Apresentação
 * ========================================
 * Responsável por toda interação com DOM,
 * renderização, toasts, estados de loading,
 * acessibilidade e feedback visual.
 * ========================================
 */

class UI {
  constructor(store) {
    this.store = store;
    this.elements = {};
    this.unsubscribe = null;
    this.init();
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.bindKeyboardShortcuts();
    this.unsubscribe = this.store.subscribe(state => this.render(state));
    this.render(this.store.getState());
  }

  /**
   * Cache de elementos DOM para performance
   */
  cacheElements() {
    this.elements = {
      // Input
      dataInput: document.getElementById('data-input'),
      btnAddCol1: document.getElementById('btn-add-col1'),
      btnAddCol2: document.getElementById('btn-add-col2'),
      
      // Navegação
      btnPrev: document.getElementById('btn-prev'),
      btnNext: document.getElementById('btn-next'),
      currentValue: document.getElementById('current-value'),
      navCurrentLabel: document.getElementById('nav-current-label'),
      
      // Controles - Radio
      radioInputs: document.querySelectorAll('.radio-option__input[name="columns"]'),
      
      // Controles - Botões de ação
      btnKeepOne: document.getElementById('btn-keep-one'),
      btnRemoveAll: document.getElementById('btn-remove-all'),
      btnClear: document.getElementById('btn-clear'),
      
      // Resultados
      resultsSection: document.getElementById('results-section'),
      resultsOutput: document.getElementById('results-output'),
      resultsEmpty: document.getElementById('results-empty'),
      totalItems: document.getElementById('total-items'),
      
      // Progresso
      progressFill: document.getElementById('progress-fill'),
      progressText: document.getElementById('progress-text'),
      progressBar: document.querySelector('.app__progress'),
      
      // Toast container
      toastContainer: document.getElementById('toast-container'),
    };
  }

  /**
   * Vincula eventos DOM
   */
  bindEvents() {
    const { elements } = this;
    
    // Input - Enter para adicionar
    elements.dataInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleAddData(1); // Default: coluna 1
      }
    });
    
    // Botões de adicionar
    elements.btnAddCol1.addEventListener('click', () => this.handleAddData(1));
    elements.btnAddCol2.addEventListener('click', () => this.handleAddData(2));
    
    // Navegação
    elements.btnPrev.addEventListener('click', () => this.handleNavigate('prev'));
    elements.btnNext.addEventListener('click', () => this.handleNavigate('next'));
    
    // Radio buttons - mudança de colunas
    elements.radioInputs.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.handleSetColumns(Number(e.target.value));
        }
      });
    });
    
    // Botões de ação
    elements.btnKeepOne.addEventListener('click', () => this.handleKeepOne());
    elements.btnRemoveAll.addEventListener('click', () => this.handleRemoveAll());
    elements.btnClear.addEventListener('click', () => this.handleClear());
    
    // Foco no input ao carregar
    elements.dataInput.focus();
  }

  /**
   * Atalhos de teclado globais
   */
  bindKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ignora se estiver digitando em input/textarea
      const active = document.activeElement;
      if (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.handleNavigate('prev');
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.handleNavigate('next');
          break;
        case 'Delete':
        case 'Backspace':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.handleClear();
          }
          break;
        case 'k':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.handleKeepOne();
          }
          break;
        case 'd':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.handleRemoveAll();
          }
          break;
        case 'Escape':
          this.elements.dataInput.blur();
          this.elements.dataInput.focus();
          break;
      }
    });
  }

  // ===== HANDLERS =====

  /**
   * Adiciona dados à coluna especificada
   */
  handleAddData(column) {
    const input = this.elements.dataInput.value;
    const btn = column === 1 ? this.elements.btnAddCol1 : this.elements.btnAddCol2;
    
    this.setButtonLoading(btn, true);
    
    // Pequeno delay para feedback visual
    setTimeout(() => {
      const result = this.store.addData(column, input);
      this.setButtonLoading(btn, false);
      
      if (result.success) {
        this.showToast(
          `${result.added} item(ns) adicionado(s) à Coluna ${column}. Total: ${result.total}`,
          'success'
        );
        this.elements.dataInput.value = '';
        this.elements.dataInput.focus();
      } else {
        this.showToast(result.error, 'error');
        this.shakeInput();
      }
    }, 100);
  }

  /**
   * Navega entre itens
   */
  handleNavigate(direction) {
    const result = this.store.navigate(direction);
    
    if (result.success) {
      this.announceToScreenReader(
        `Item ${result.index + 1} de ${result.total}: ${result.value}`
      );
    } else {
      this.showToast(result.error, 'warning');
      if (result.atEnd || result.atStart) {
        this.announceToScreenReader(result.error);
      }
    }
  }

  /**
   * Define número de colunas
   */
  handleSetColumns(columns) {
    const result = this.store.setColumns(columns);
    if (result.success) {
      this.showToast(`Exibição alterada para ${columns} coluna(s)`, 'info');
    }
  }

  /**
   * Mantém uma ocorrência
   */
  handleKeepOne() {
    const btn = this.elements.btnKeepOne;
    this.setButtonLoading(btn, true);
    
    setTimeout(() => {
      const result = this.store.keepOneOccurrence();
      this.setButtonLoading(btn, false);
      
      if (result.success) {
        this.showToast(
          `${result.removed} duplicata(s) removida(s). ${result.remaining} item(ns) restante(s).`,
          'success'
        );
        this.announceToScreenReader(
          `Otimização concluída. ${result.removed} duplicatas removidas. ${result.remaining} itens restantes.`
        );
      } else {
        this.showToast(result.error, 'error');
      }
    }, 100);
  }

  /**
   * Remove todas duplicatas
   */
  handleRemoveAll() {
    const btn = this.elements.btnRemoveAll;
    this.setButtonLoading(btn, true);
    
    setTimeout(() => {
      const result = this.store.removeAllDuplicates();
      this.setButtonLoading(btn, false);
      
      if (result.success) {
        this.showToast(
          `${result.removed} item(ns) removido(s). ${result.remaining} item(ns) restante(s).`,
          'success'
        );
        this.announceToScreenReader(
          `Eliminação concluída. ${result.removed} itens removidos. ${result.remaining} itens restantes.`
        );
      } else {
        this.showToast(result.error, 'error');
      }
    }, 100);
  }

  /**
   * Limpa tudo
   */
  handleClear() {
    const btn = this.elements.btnClear;
    this.setButtonLoading(btn, true);
    
    setTimeout(() => {
      const result = this.store.clearAll();
      this.setButtonLoading(btn, false);
      
      if (result.success) {
        this.showToast('Todos os dados foram limpos', 'success');
        this.announceToScreenReader('Todos os dados foram limpos');
        this.elements.dataInput.focus();
      }
    }, 100);
  }

  // ===== RENDERIZAÇÃO =====

  /**
   * Renderiza toda a UI baseada no estado
   */
  render(state) {
    this.renderNavigation(state);
    this.renderResults(state);
    this.renderProgress(state);
    this.renderRadioButtons(state);
    this.updateButtonStates(state);
  }

  /**
   * Renderiza controles de navegação
   */
  renderNavigation(state) {
    const { elements } = this;
    const hasData = state.coluna1.length > 0;
    const currentItem = state.coluna1[state.currentIndex];
    
    // Habilita/desabilita botões
    elements.btnPrev.disabled = !hasData || state.currentIndex === 0;
    elements.btnNext.disabled = !hasData || state.currentIndex >= state.coluna1.length - 1;
    
    // Valor atual
    if (hasData && currentItem !== undefined) {
      elements.currentValue.value = currentItem;
      elements.currentValue.textContent = currentItem;
      elements.navCurrentLabel.textContent = `Item ${state.currentIndex + 1} de ${state.coluna1.length}`;
    } else {
      elements.currentValue.value = '';
      elements.currentValue.textContent = '';
      elements.navCurrentLabel.textContent = 'Nenhum item';
    }
  }

  /**
   * Renderiza área de resultados
   */
  renderResults(state) {
    const { elements } = this;
    const data = state.coluna1;
    const columns = state.columns;
    
    if (data.length === 0) {
      elements.resultsSection.hidden = true;
      elements.resultsEmpty.hidden = false;
      elements.resultsOutput.textContent = '';
      elements.totalItems.textContent = 'Total: 0 itens';
      return;
    }
    
    elements.resultsSection.hidden = false;
    elements.resultsEmpty.hidden = true;
    elements.totalItems.textContent = `Total: ${data.length} item(ns)`;
    
    // Formata saída em colunas
    const formatted = this.formatColumns(data, columns);
    elements.resultsOutput.textContent = formatted;
    
    // Destaca item atual
    this.highlightCurrentItem(state.currentIndex, columns);
  }

  /**
   * Formata array em colunas
   */
  formatColumns(data, columns) {
    if (columns === 1) {
      return data.map((item, i) => `${i + 1}. ${item}`).join('\n');
    }
    
    const rows = [];
    for (let i = 0; i < data.length; i += columns) {
      const row = data.slice(i, i + columns);
      rows.push(row.map((item, j) => `${i + j + 1}. ${item}`).join('  |  '));
    }
    return rows.join('\n');
  }

  /**
   * Destaca item atual na saída (via span com classe)
   * Nota: Como usamos textContent, não podemos destacar facilmente.
   * Alternativa: usar innerHTML com spans coloridos.
   */
  highlightCurrentItem(currentIndex, columns) {
    const { resultsOutput } = this.elements;
    const data = this.store.getState().coluna1;
    
    if (data.length === 0) return;
    
    // Reconstrói com destaque no item atual
    let html = '';
    for (let i = 0; i < data.length; i += columns) {
      const rowItems = [];
      for (let j = 0; j < columns && (i + j) < data.length; j++) {
        const idx = i + j;
        const item = data[idx];
        const prefix = `${idx + 1}. `;
        
        if (idx === currentIndex) {
          rowItems.push(`<span class="highlight-current">${prefix}${this.escapeHtml(item)}</span>`);
        } else {
          rowItems.push(`${prefix}${this.escapeHtml(item)}`);
        }
      }
      html += rowItems.join('  |  ') + '\n';
    }
    
    resultsOutput.innerHTML = html;
  }

  /**
   * Escape HTML para prevenir XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Renderiza barra de progresso
   */
  renderProgress(state) {
    const { elements } = this;
    const progress = this.store.getProgress();
    
    elements.progressFill.style.width = `${progress}%`;
    elements.progressText.textContent = `${progress.toFixed(1)}%`;
    
    // Atualiza ARIA
    elements.progressBar.setAttribute('aria-valuenow', progress.toFixed(1));
  }

  /**
   * Renderiza radio buttons
   */
  renderRadioButtons(state) {
    this.elements.radioInputs.forEach(radio => {
      radio.checked = Number(radio.value) === state.columns;
    });
  }

  /**
   * Atualiza estados dos botões
   */
  updateButtonStates(state) {
    const { elements } = this;
    const hasCol1Data = state.coluna1.length > 0;
    const hasCol2Data = state.coluna2.length > 0;
    
    elements.btnKeepOne.disabled = !hasCol1Data;
    elements.btnRemoveAll.disabled = !hasCol1Data || !hasCol2Data;
    elements.btnClear.disabled = !hasCol1Data && !hasCol2Data;
  }

  // ===== FEEDBACK VISUAL =====

  /**
   * Mostra toast notification
   */
  showToast(message, type = 'info') {
    const { toastContainer } = this.elements;
    
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    
    const icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    };
    
    toast.innerHTML = `
      <span class="toast__icon" aria-hidden="true">${icons[type] || icons.info}</span>
      <span class="toast__message">${this.escapeHtml(message)}</span>
      <button class="toast__close" aria-label="Fechar notificação">&times;</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove após 5 segundos
    const timeout = setTimeout(() => this.removeToast(toast), 5000);
    
    // Botão fechar
    toast.querySelector('.toast__close').addEventListener('click', () => {
      clearTimeout(timeout);
      this.removeToast(toast);
    });
  }

  /**
   * Remove toast com animação
   */
  removeToast(toast) {
    toast.style.animation = 'slideIn 0.2s ease-in reverse';
    setTimeout(() => toast.remove(), 200);
  }

  /**
   * Animação de shake no input (erro)
   */
  shakeInput() {
    const input = this.elements.dataInput;
    input.classList.add('input-error');
    input.style.animation = 'shake 0.4s ease-in-out';
    
    setTimeout(() => {
      input.style.animation = '';
      input.classList.remove('input-error');
    }, 400);
  }

  /**
   * Loading state no botão
   */
  setButtonLoading(button, loading) {
    if (loading) {
      button.classList.add('btn--loading');
      button.disabled = true;
    } else {
      button.classList.remove('btn--loading');
      button.disabled = false;
    }
  }

  /**
   * Anúncio para leitores de tela (ARIA live region)
   */
  announceToScreenReader(message) {
    // Cria elemento temporário para anúncio
    const announcer = document.createElement('div');
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'visually-hidden';
    announcer.textContent = message;
    document.body.appendChild(announcer);
    
    setTimeout(() => announcer.remove(), 1000);
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

// Exporta para uso global
window.UI = UI;