# Sistema de Agendamento de Consultas Médicas — APS 1

<table width="100%">
  <thead>
    <tr>
      <th width="50%" align="left">🎓 Identificação Acadêmica</th>
      <th width="50%" align="left">👥 Integrantes do Grupo</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td valign="top">
        <strong>Instituição:</strong> Universidade Federal de Goiás (UFG)<br>
        <strong>Unidade:</strong> Instituto de Informática (INF)<br>
        <strong>Curso:</strong> Bacharelado em Engenharia de Software<br>
        <strong>Disciplina:</strong> Modelagem de Software (APS 1)<br>
        <strong>Docente:</strong> Me. Diogo Oliveira Santos<br>
        <strong>Período Letivo:</strong> 2026/2
      </td>
      <td valign="top">
        • Carlos Eduardo Freire da Silva<br>
        • Gabriel Henrique Lourenço Dias<br>
        • Kayque Vicente Silva<br>
        • Luiz Pedro Pereira Mendes Saraiva<br>
        • Yury Nogueira de Oliveira Silva
      </td>
    </tr>
  </tbody>
</table>

---

## 📌 Visão Geral

Este repositório contém a especificação de requisitos e os artefatos de modelagem UML (Diagramas de Atividades, Sequência e Classes) desenvolvidos para a **APS 1** da disciplina de Modelagem de Software.

O projeto disponibiliza duas versões integradas do trabalho:
1. **Documento em Markdown ([trabalho-modelagem-uml.md](trabalho-modelagem-uml.md)):** versão navegável diretamente pelo GitHub.
2. **Relatório Acadêmico ABNT ([latex/trabalho-modelagem-uml.pdf](latex/trabalho-modelagem-uml.pdf)):** versão tipográfica oficial diagramada em LaTeX conforme as normas NBR 14724, NBR 6024 e NBR 6027.

---

## 🗂️ Estrutura do Repositório

```text
aps1-modelagem-software/
├── assets/
│   ├── DA01_Agendamento.pdf
│   ├── DA01_Agendamento.puml
│   ├── DA01_Agendamento.svg
│   ├── DC_Classes.pdf
│   ├── DC_Classes.puml
│   ├── DC_Classes.svg
│   ├── DS01_Agendamento.pdf
│   ├── DS01_Agendamento.puml
│   └── DS01_Agendamento.svg
├── docs/
│   ├── especificacao-requisitos.md
│   └── instrucao-inicial.md
├── latex/
│   ├── trabalho-modelagem-uml.pdf
│   └── trabalho-modelagem-uml.tex
├── scripts/
│   ├── compilar.sh
│   └── renderizar-diagramas.js
├── .gitignore
├── README.md
└── trabalho-modelagem-uml.md
```

---

## 🧭 Guia de Navegação

- 📑 **[latex/trabalho-modelagem-uml.pdf](latex/trabalho-modelagem-uml.pdf):** Relatório oficial compilado em formato ABNT (NBR 14724 / NBR 6023).
- 📄 **[trabalho-modelagem-uml.md](trabalho-modelagem-uml.md):** Documentação completa consolidada para navegação no GitHub.
- 📋 **[docs/especificacao-requisitos.md](docs/especificacao-requisitos.md):** Engenharia de requisitos detalhada (RF, RNF, RN e fluxos operacionais).
- 📖 **[docs/instrucao-inicial.md](docs/instrucao-inicial.md):** Enunciado oficial e diretrizes da atividade.
- 🖼️ **[assets/](assets/):** Diagramas renderizados em SVG/PDF e fontes PlantUML (`DA-01`, `DS-01` e `DC`).

---

## 🛠️ Como Compilar o PDF Oficial

Para compilar o relatório acadêmico e atualizar o [latex/trabalho-modelagem-uml.pdf](latex/trabalho-modelagem-uml.pdf), basta executar o script unificado na raiz do projeto:

```bash
./scripts/compilar.sh
```

O script utiliza o **Tectonic**, que gerencia os pacotes automaticamente, resolve o sumário em uma única passada e gera o PDF final sem deixar arquivos temporários.

* **Instalação do Tectonic:**
  * **macOS:** `brew install tectonic`
  * **Linux / Windows:** [tectonic-typesetting.github.io](https://tectonic-typesetting.github.io/)

> **Compilação no Overleaf:** Se preferir compilar na nuvem, basta fazer upload das pastas `latex/` e `assets/`. O compilador padrão compila o documento diretamente.

---

## ⚙️ Atualização dos Diagramas (Opcional)

Todos os diagramas já se encontram compilados e prontos em [assets/](assets/). Caso precise alterar algum código PlantUML no futuro e regerar os SVGs:

```bash
node scripts/renderizar-diagramas.js
```
