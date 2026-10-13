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

O objetivo deste documento é orientar a estrutura de arquivos e facilitar o acesso aos entregáveis do projeto.

---

## 🗂️ Estrutura do Repositório

```text
aps1-modelagem-software/
├── assets/                               # Diagramas compilados em formato vetorial SVG
│   ├── DA01_Agendamento.svg              # Diagrama de Atividades (Agendamento de Consulta)
│   ├── DS01_Agendamento.svg              # Diagrama de Sequência (Agendamento de Consulta)
│   └── DC_Classes.svg                    # Diagrama de Classes (Nível Macro)
├── docs/                                 # Documentação complementar de apoio
│   ├── especificacao-requisitos.md       # Engenharia de requisitos detalhada (RF, RNF, RN e fluxos)
│   └── instrucao-inicial.md              # Enunciado e critérios pedagógicos da atividade
├── scripts/                              # Utilitários de automação
│   └── renderizar-diagramas.js           # Script Node.js para compilar PlantUML em SVG
├── .gitignore                            # Configuração de arquivos ignorados pelo Git
├── README.md                             # Guia do repositório e navegação
└── trabalho-modelagem-uml.md             # Documento principal de entrega
```

---

## 🧭 Guia de Navegação

- 📄 **Documento Principal de Entrega:**<br>
  Acesse [trabalho-modelagem-uml.md](trabalho-modelagem-uml.md) para consultar o trabalho completo consolidado, incluindo capa, descrição da aplicação, módulos do sistema, ciclo de vida da consulta, códigos PlantUML com justificativas técnicas, análise de consistência e apêndices normativos.

- 📋 **Especificação Completa de Requisitos:**<br>
  Acesse [docs/especificacao-requisitos.md](docs/especificacao-requisitos.md) para consultar os 21 Requisitos Funcionais (`RF-01` a `RF-21`), 23 Não-Funcionais (`RNF-01` a `RNF-23`), 28 Regras de Negócio (`RN-01` a `RN-28`) e o detalhamento dos 5 fluxos operacionais.

- 📖 **Diretrizes da Atividade:**<br>
  Acesse [docs/instrucao-inicial.md](docs/instrucao-inicial.md) para visualizar o enunciado oficial e as orientações fornecidas pelo professor.

- 🖼️ **Visualização Direta dos Diagramas:**<br>
  Os arquivos vetoriais estão disponíveis no diretório [assets/](assets/):
  - [DA-01 — Diagrama de Atividades](assets/DA01_Agendamento.svg)
  - [DS-01 — Diagrama de Sequência](assets/DS01_Agendamento.svg)
  - [DC — Diagrama de Classes](assets/DC_Classes.svg)

---

## ⚙️ Renderização dos Diagramas

Os diagramas são mantidos em formato PlantUML dentro de [trabalho-modelagem-uml.md](trabalho-modelagem-uml.md). Para regerar os arquivos SVG:

1. **Requisitos:** Node.js (v16+), Java, Graphviz (`dot`) e PlantUML.
2. **Execução:**
   ```bash
   node scripts/renderizar-diagramas.js
   ```
