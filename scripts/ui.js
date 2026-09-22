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
    this.initTheme(); // Inicializa tema
    this.unsubscribe = this.store.subscribe(state => this.render(state));
    this.render(this.store.getState());
  }

  /**
   * Inicializa tema (claro/escuro) baseado no localStorage ou preferência do sistema
   */
  initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      document.documentElement.classList.toggle('dark-mode', savedTheme === 'dark');
      document.documentElement.classList.toggle('light-mode', savedTheme === 'light');
    } else if (prefersDark) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.add('light-mode');
    }
    
    // Atualiza ícone do botão
    this.updateThemeIcon();
  }

  /**
   * Alterna entre tema claro e escuro
   */
  toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark-mode');
    document.documentElement.classList.toggle('light-mode', !isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    this.updateThemeIcon();
    this.showToast(isDark ? 'Modo escuro ativado' : 'Modo claro ativado', 'info');
  }

  /**
   * Atualiza ícone do botão de tema
   */
  updateThemeIcon() {
    const isDark = document.documentElement.classList.contains('dark-mode');
    this.elements.themeToggle.setAttribute('aria-label', isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro');
    this.elements.themeToggle.title = isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro';
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
      resultsTable: document.getElementById('results-table'),
      resultsTableWrapper: document.getElementById('results-table-wrapper'),
      resultsThead: document.getElementById('results-thead'),
      resultsTbody: document.getElementById('results-tbody'),
      resultsEmpty: document.getElementById('results-empty'),
      totalItems: document.getElementById('total-items'),
      btnExport: document.getElementById('btn-export'),
      
      // Progresso
      progressFill: document.getElementById('progress-fill'),
      progressText: document.getElementById('progress-text'),
      progressBar: document.querySelector('.app__progress'),
      
      // Toast container
      toastContainer: document.getElementById('toast-container'),
      
      // Theme toggle
      themeToggle: document.getElementById('theme-toggle'),
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
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', () => this.toggleTheme());
    
    // Exportar planilha
    elements.btnExport.addEventListener('click', () => this.handleExport());
    
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
      
      // Scroll para o item atual na tabela
      this.scrollToCurrentItem();
    } else {
      this.showToast(result.error, 'warning');
      if (result.atEnd || result.atStart) {
        this.announceToScreenReader(result.error);
      }
    }
  }

  /**
   * Scroll para o item atual na tabela
   * Rola apenas o wrapper da tabela (não a página)
   */
  scrollToCurrentItem() {
    const { elements } = this;

    requestAnimationFrame(() => {
      const target = elements.resultsTbody.querySelector('.is-current');
      const wrapper = elements.resultsTableWrapper;

      if (!target || !wrapper) return;

      const targetRect = target.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();

      // Centraliza horizontalmente
      const deltaX = (targetRect.left + targetRect.width / 2) -
                     (wrapperRect.left + wrapperRect.width / 2);
      // Centraliza verticalmente
      const deltaY = (targetRect.top + targetRect.height / 2) -
                     (wrapperRect.top + wrapperRect.height / 2);

      wrapper.scrollTo({
        left: wrapper.scrollLeft + deltaX,
        top: wrapper.scrollTop + deltaY,
        behavior: 'smooth',
      });
    });
  }

  /**
   * Define número de colunas
   */
  handleSetColumns(columns) {
    const result = this.store.setColumns(columns);
    if (result.success) {
      this.showToast(`Exibição alterada para ${columns} coluna(s)`, 'info');
      
      // Scroll para o item atual após mudança de layout
      this.scrollToCurrentItem();
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

  // ===== EXPORTAÇÃO =====

  /**
   * Exporta a tabela de resultados como planilha CSV.
   * Reproduz exatamente o layout exibido: blocos "Coluna N" com ID + CÓDIGO.
   * Usa separador ";" e BOM UTF-8 para compatibilidade com Excel pt-BR.
   */
  handleExport() {
    const { elements } = this;
    const state = this.store.getState();
    const data = state.coluna1;
    const columns = state.columns;

    if (data.length === 0) {
      this.showToast('Nenhum dado para exportar', 'warning');
      return;
    }

    this.setButtonLoading(elements.btnExport, true);

    setTimeout(() => {
      try {
        const rows = this.buildExportRows(data, columns);
        const csv = rows
          .map(row => row.map(cell => this.csvCell(cell)).join(';'))
          .join('\r\n');

        // BOM para o Excel reconhecer UTF-8 (acentos corretos)
        const content = '\ufeff' + csv;
        const filename = `resultado-${columns}col-${this.exportTimestamp()}.csv`;

        this.downloadFile(content, filename, 'text/csv;charset=utf-8;');

        this.setButtonLoading(elements.btnExport, false);
        this.showToast(`Planilha exportada: ${data.length} item(ns)`, 'success');
        this.announceToScreenReader(
          `Exportação concluída. Arquivo ${filename} gerado com ${data.length} itens.`
        );
      } catch (error) {
        this.setButtonLoading(elements.btnExport, false);
        this.showToast('Erro ao exportar a planilha', 'error');
        console.error('Erro na exportação:', error);
      }
    }, 100);
  }

  /**
   * Monta as linhas da planilha replicando a tabela de resultados
   * @returns {Array<Array<string>>}
   */
  buildExportRows(data, columns) {
    const rows = [];

    // Linha 1: grupos "Coluna N" (célula mesclada -> nome + vazio)
    const groupRow = [];
    for (let c = 0; c < columns; c++) {
      groupRow.push(`Coluna ${c + 1}`, '');
    }
    rows.push(groupRow);

    // Linha 2: rótulos ID / CÓDIGO
    const labelRow = [];
    for (let c = 0; c < columns; c++) {
      labelRow.push('ID', 'CÓDIGO');
    }
    rows.push(labelRow);

    // Linhas de dados (com preenchimento vazio na última linha)
    for (let rowStart = 0; rowStart < data.length; rowStart += columns) {
      const row = [];
      for (let c = 0; c < columns; c++) {
        const idx = rowStart + c;
        if (idx < data.length) {
          row.push(String(idx + 1), data[idx]);
        } else {
          row.push('', '');
        }
      }
      rows.push(row);
    }

    return rows;
  }

  /**
   * Escapa uma célula para CSV (aspas duplicadas quando necessário)
   */
  csvCell(value) {
    const str = value === null || value === undefined ? '' : String(value);
    if (/[";\r\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  /**
   * Timestamp para nome do arquivo: YYYY-MM-DD_HH-MM-SS
   */
  exportTimestamp() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
           `_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  }

  /**
   * Dispara o download de um arquivo no navegador
   */
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Libera a memória
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
   * Renderiza área de resultados (tabela)
   */
  renderResults(state) {
    const { elements } = this;
    const data = state.coluna1;
    const columns = state.columns;
    const currentIndex = state.currentIndex;
    
    if (data.length === 0) {
      elements.resultsSection.hidden = true;
      elements.resultsEmpty.hidden = false;
      elements.resultsTbody.innerHTML = '';
      elements.totalItems.textContent = 'Total: 0 itens';
      return;
    }
    
    elements.resultsSection.hidden = false;
    elements.resultsEmpty.hidden = true;
    elements.totalItems.textContent = `Total: ${data.length} item(ns)`;
    
    // Atualiza atributo data-columns para controlar layout CSS
    elements.resultsTable.setAttribute('data-columns', columns);
    
    // Renderiza tabela
    this.renderTable(data, columns, currentIndex);
  }

  /**
   * Renderiza tabela de resultados
   * Estrutura idêntica ao modelo da planilha:
   *   |      Coluna 1      |      Coluna 2      | ...
   *   |  ID  |   CÓDIGO     |  ID  |   CÓDIGO    | ...
   *   |  1   |   154665     |  2   |   526899    | ...
   */
  renderTable(data, columns, currentIndex) {
    const { elements } = this;

    this.renderTableHead(columns);
    this.renderTableBody(data, columns, currentIndex);
  }

  /**
   * Renderiza o cabeçalho da tabela (2 linhas: grupos + ID/CÓDIGO)
   */
  renderTableHead(columns) {
    const { elements } = this;

    let groupsRow = '';
    let labelsRow = '';

    for (let c = 0; c < columns; c++) {
      groupsRow += `<th class="col-group" colspan="2" scope="colgroup">Coluna ${c + 1}</th>`;
      labelsRow += `<th class="col-id" scope="col">ID</th>`;
      labelsRow += `<th class="col-code" scope="col">CÓDIGO</th>`;
    }

    elements.resultsThead.innerHTML = `
      <tr class="results__head-groups">${groupsRow}</tr>
      <tr class="results__head-labels">${labelsRow}</tr>
    `;
  }

  /**
   * Renderiza o corpo da tabela.
   * Os itens fluem horizontalmente entre os blocos "Coluna N"
   * e quebram para a próxima linha ao completar o número de colunas.
   */
  renderTableBody(data, columns, currentIndex) {
    const { elements } = this;
    let html = '';

    for (let rowStart = 0; rowStart < data.length; rowStart += columns) {
      let rowHtml = '';

      for (let c = 0; c < columns; c++) {
        const idx = rowStart + c;
        const hasItem = idx < data.length;
        const isCurrent = hasItem && idx === currentIndex;
        const currentClass = isCurrent ? ' is-current' : '';

        if (hasItem) {
          rowHtml += `<td class="cell-index${currentClass}">${idx + 1}</td>`;
          rowHtml += `<td class="cell-code${currentClass}">${this.escapeHtml(data[idx])}</td>`;
        } else {
          // Células vazias para completar a linha (como na planilha)
          rowHtml += `<td class="cell-index cell-empty" aria-hidden="true"></td>`;
          rowHtml += `<td class="cell-code cell-empty" aria-hidden="true"></td>`;
        }
      }

      html += `<tr>${rowHtml}</tr>`;
    }

    elements.resultsTbody.innerHTML = html;
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
    elements.btnExport.disabled = !hasCol1Data;
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