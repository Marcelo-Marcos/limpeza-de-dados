/**
 * ========================================
 * STORE - Gerenciamento de Estado Centralizado
 * ========================================
 * Padrão Observer/Store para separar estado da UI.
 * Mantém compatibilidade com localStorage original.
 * ========================================
 */

class DataStore {
  constructor() {
    this.listeners = new Set();
    this.state = this.loadFromStorage();
    this.initDefaults();
  }

  /**
   * Carrega estado do localStorage mantendo compatibilidade
   * com chaves antigas (dados, dados2, local, controle, colunas)
   */
  loadFromStorage() {
    // Migração de chaves antigas para novas
    const legacyColuna1 = localStorage.getItem('dados');
    const legacyColuna2 = localStorage.getItem('dados2');
    const legacyIndex = localStorage.getItem('local');
    const legacyControl = localStorage.getItem('controle');
    const legacyColumns = localStorage.getItem('colunas');

    // Novas chaves (prioritárias)
    const coluna1 = localStorage.getItem('coluna1');
    const coluna2 = localStorage.getItem('coluna2');
    const currentIndex = localStorage.getItem('currentIndex');
    const columns = localStorage.getItem('columns');

    return {
      coluna1: this.parseArray(coluna1 || legacyColuna1 || '[]'),
      coluna2: this.parseArray(coluna2 || legacyColuna2 || '[]'),
      currentIndex: Number(currentIndex || legacyIndex || 0),
      columns: Number(columns || legacyColumns || 5),
      // Metadados para migração
      _migrated: !!(coluna1 || coluna2 || currentIndex || columns)
    };
  }

  /**
   * Parse seguro de array do localStorage
   */
  parseArray(value) {
    try {
      // Tenta JSON primeiro (novo formato)
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Fallback: formato antigo (string separada por vírgula)
      if (value && typeof value === 'string') {
        return value.split(',').filter(item => item.trim() !== '');
      }
    }
    return [];
  }

  /**
   * Inicializa valores padrão se necessário
   */
  initDefaults() {
    if (!this.state._migrated) {
      this.migrateLegacyData();
    }
    // Garante que currentIndex está dentro dos limites
    this.clampIndex();
  }

  /**
   * Migra dados do formato antigo para novo
   */
  migrateLegacyData() {
    const legacyKeys = ['dados', 'dados2', 'local', 'controle', 'colunas'];
    legacyKeys.forEach(key => localStorage.removeItem(key));
    
    this.save();
    this.state._migrated = true;
  }

  /**
   * Salva estado no localStorage (novo formato JSON)
   */
  save() {
    localStorage.setItem('coluna1', JSON.stringify(this.state.coluna1));
    localStorage.setItem('coluna2', JSON.stringify(this.state.coluna2));
    localStorage.setItem('currentIndex', String(this.state.currentIndex));
    localStorage.setItem('columns', String(this.state.columns));
    this.notify();
  }

  /**
   * Garante que currentIndex está dentro dos limites válidos
   */
  clampIndex() {
    const maxIndex = Math.max(0, this.state.coluna1.length - 1);
    if (this.state.currentIndex > maxIndex) {
      this.state.currentIndex = maxIndex;
    }
    if (this.state.currentIndex < 0) {
      this.state.currentIndex = 0;
    }
  }

  /**
   * Subscreve a mudanças de estado
   * @param {Function} listener - Função chamada com novo estado
   * @returns {Function} Função para cancelar subscrição
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notifica todos os listeners
   */
  notify() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  /**
   * Retorna cópia imutável do estado
   */
  getState() {
    return { ...this.state };
  }

  // ===== MUTAÇÕES DE ESTADO =====

  /**
   * Adiciona dados a uma coluna
   * @param {1|2} column - Número da coluna
   * @param {string} input - Texto bruto do usuário
   * @returns {Object} Resultado da operação
   */
  addData(column, input) {
    const trimmed = input.trim();
    if (!trimmed) {
      return { success: false, error: 'Nenhum dado fornecido' };
    }

    // Parse: separa por vírgula, espaço, nova linha
    const items = this.parseInput(trimmed);
    if (items.length === 0) {
      return { success: false, error: 'Nenhum item válido encontrado' };
    }

    const targetArray = column === 1 ? this.state.coluna1 : this.state.coluna2;
    const newArray = [...targetArray, ...items];

    if (column === 1) {
      this.state.coluna1 = newArray;
    } else {
      this.state.coluna2 = newArray;
    }

    // Ajusta índice se necessário
    this.clampIndex();
    this.save();

    return { 
      success: true, 
      added: items.length,
      total: newArray.length 
    };
  }

  /**
   * Parse de entrada do usuário (vírgula, espaço, nova linha)
   */
  parseInput(input) {
    return input
      .split(/[\s,]+/)  // Separa por whitespace ou vírgula
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  /**
   * Navega para item anterior/próximo
   * @param {'prev'|'next'} direction 
   * @returns {Object} Novo índice e valor
   */
  navigate(direction) {
    const maxIndex = this.state.coluna1.length - 1;
    
    if (maxIndex < 0) {
      return { success: false, error: 'Nenhum dado para navegar' };
    }

    if (direction === 'next') {
      if (this.state.currentIndex < maxIndex) {
        this.state.currentIndex++;
      } else {
        return { success: false, error: 'Último item da lista', atEnd: true };
      }
    } else {
      if (this.state.currentIndex > 0) {
        this.state.currentIndex--;
      } else {
        return { success: false, error: 'Primeiro item da lista', atStart: true };
      }
    }

    this.save();
    return { 
      success: true, 
      index: this.state.currentIndex,
      value: this.state.coluna1[this.state.currentIndex],
      total: this.state.coluna1.length
    };
  }

  /**
   * Define número de colunas para exibição
   */
  setColumns(columns) {
    const validColumns = [1, 5, 10, 15, 20];
    if (!validColumns.includes(columns)) {
      return { success: false, error: 'Número de colunas inválido' };
    }
    this.state.columns = columns;
    this.save();
    return { success: true, columns };
  }

  /**
   * Mantém apenas uma ocorrência de cada item (remove duplicatas mantendo 1)
   */
  keepOneOccurrence() {
    if (this.state.coluna1.length === 0) {
      return { success: false, error: 'Nenhum dado na lista' };
    }

    const originalLength = this.state.coluna1.length;
    const seen = new Set();
    const unique = [];

    for (const item of this.state.coluna1) {
      if (!seen.has(item)) {
        seen.add(item);
        unique.push(item);
      }
    }

    const removed = originalLength - unique.length;
    this.state.coluna1 = unique;
    this.clampIndex();
    this.save();

    return { 
      success: true, 
      removed,
      remaining: unique.length,
      originalLength
    };
  }

  /**
   * Remove todas as ocorrências de itens que aparecem na coluna 2
   */
  removeAllDuplicates() {
    if (this.state.coluna1.length === 0) {
      return { success: false, error: 'Nenhum dado na coluna 1' };
    }
    if (this.state.coluna2.length === 0) {
      return { success: false, error: 'Nenhum dado na coluna 2 para comparar' };
    }

    const originalLength = this.state.coluna1.length;
    const toRemove = new Set(this.state.coluna2);
    const filtered = this.state.coluna1.filter(item => !toRemove.has(item));
    const removed = originalLength - filtered.length;

    this.state.coluna1 = filtered;
    this.clampIndex();
    this.save();

    return { 
      success: true, 
      removed,
      remaining: filtered.length,
      originalLength
    };
  }

  /**
   * Limpa todos os dados
   */
  clearAll() {
    this.state.coluna1 = [];
    this.state.coluna2 = [];
    this.state.currentIndex = 0;
    this.save();
    return { success: true };
  }

  /**
   * Calcula porcentagem de progresso
   */
  getProgress() {
    const total = this.state.coluna1.length;
    if (total === 0) return 0;
    return ((this.state.currentIndex + 1) / total) * 100;
  }

  /**
   * Obtém item atual para navegação
   */
  getCurrentItem() {
    if (this.state.coluna1.length === 0) return null;
    return this.state.coluna1[this.state.currentIndex];
  }

  /**
   * Obtém dados para exibição (coluna 1 ou 2)
   */
  getDisplayData(column = 1) {
    return column === 1 ? this.state.coluna1 : this.state.coluna2;
  }
}

// Exporta instância singleton
window.DataStore = DataStore;
const store = new DataStore();
window.store = store;