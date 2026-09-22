# 🧹 Otimizador de Dados 20.14

> **Ferramenta web para otimização e limpeza de dados duplicados** — Interface moderna, acessível e sem dependências externas.

![Versão](https://img.shields.io/badge/version-20.14-blue)
![Licença](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-stable-brightgreen)
![Acessibilidade](https://img.shields.io/badge/a11y-WCAG%202.1%20AA-purple)

---

## 📋 Visão Geral

O **Otimizador de Dados 20.14** é uma aplicação web single-page (SPA) desenvolvida em **Vanilla JavaScript** para processamento, deduplicação e organização de listas de dados. Ideal para limpar bases de dados, remover entradas duplicadas e preparar dados para importação em outros sistemas.

### ✨ Principais Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| **Duas Colunas de Dados** | Entrada separada para lista principal (Coluna 1) e lista de referência (Coluna 2) |
| **Navegação por Itens** | Navegue item a item com botões ou teclas de seta (←/→) |
| **Manter 1 Ocorrência** | Remove duplicatas mantendo apenas uma ocorrência de cada item único |
| **Eliminar Duplicatas** | Remove da Coluna 1 todos os itens que existem na Coluna 2 |
| **Limpar Tudo** | Reset completo de ambas as colunas |
| **Visualização em Grade** | Exibição configurável: 1, 5, 10, 15 ou 20 colunas |
| **Persistência Local** | Dados salvos automaticamente no `localStorage` (sobrevive a recarregamentos) |
| **Migração Automática** | Compatível com dados de versões antigas (formato legado) |
| **Barra de Progresso** | Acompanhamento visual da posição na lista |
| **Atalhos de Teclado** | Operações rápidas sem mouse |
| **Notificações Toast** | Feedback visual para ações e erros |
| **Acessibilidade Completa** | ARIA, skip links, foco visível, leitores de tela |
