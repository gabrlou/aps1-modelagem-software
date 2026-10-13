# Sistema de Agendamento de Consultas Médicas — APS 1

> **Universidade Federal de Goiás (UFG)** — Instituto de Informática (INF)<br>
> **Curso:** Bacharelado em Engenharia de Software<br>
> **Disciplina:** Modelagem de Software<br>
> **Professor:** Me. Diogo Oliveira Santos<br>
> **Semestre:** 2026/2

---

## 👥 Integrantes do Grupo

- Carlos Eduardo Freire da Silva
- Gabriel Henrique Lourenço Dias
- Kayque Vicente Silva
- Luiz Pedro Pereira Mendes Saraiva
- Yury Nogueira de Oliveira Silva

---

## 📌 Sobre o Repositório

Este repositório reúne os artefatos de requisitos e a modelagem formal em UML (Diagramas de Atividades, Sequência e Classes) desenvolvidos para a **APS 1** da disciplina de Modelagem de Software.

O propósito deste README é servir como um **guia instrutivo e direcionador**: apresentar a organização das pastas e orientar a navegação rápida até os documentos do projeto.

---

## 🗺️ Mapa do Repositório

```text
aps1-modelagem-software/
├── assets/                               # Diagramas renderizados em formato vetorial SVG
│   ├── DA01_Agendamento.svg              # Diagrama de Atividades (Agendamento de Consulta)
│   ├── DS01_Agendamento.svg              # Diagrama de Sequência (Agendamento de Consulta)
│   └── DC_Classes.svg                    # Diagrama de Classes (Nível Macro)
├── docs/                                 # Documentos complementares e materiais de apoio
│   ├── especificacao-requisitos.md       # Engenharia de requisitos completa (RF, RNF, RN e fluxos)
│   └── instrucao-inicial.md              # Enunciado original e diretrizes pedagógicas da APS 1
├── scripts/                              # Scripts utilitários de automação
│   └── renderizar-diagramas.js           # Script Node.js para compilar blocos PlantUML em SVG
├── .gitignore                            # Filtro do Git para ignorar arquivos locais (.DS_Store, etc.)
├── README.md                             # Guia instrutivo e direcionador do repositório
└── trabalho-modelagem-uml.md             # 📄 DOCUMENTO PRINCIPAL DE ENTREGA
```

---

## 🧭 Guia de Navegação (Onde encontrar cada conteúdo)

- 📄 **Para ler a entrega completa da APS 1:**<br>
  Acesse **[`trabalho-modelagem-uml.md`](trabalho-modelagem-uml.md)**.
  Este é o documento oficial consolidado do grupo. Ele contém:
  - Capa e identificação formal;
  - Descrição da aplicação, seus 6 módulos e o ciclo de vida da consulta médica;
  - Os três diagramas UML modelados, acompanhados de justificativa técnica e código-fonte PlantUML embutido;
  - Considerações finais do grupo e matriz de consistência;
  - Apêndice com a especificação de requisitos e dicionário de termos.

- 📋 **Para consultar a especificação detalhada de requisitos:**<br>
  Acesse **[`docs/especificacao-requisitos.md`](docs/especificacao-requisitos.md)**.
  Documento aprofundado contendo os 21 Requisitos Funcionais (`RF-01` a `RF-21`), 23 Não-Funcionais (`RNF-01` a `RNF-23`), 28 Regras de Negócio sequenciais (`RN-01` a `RN-28`) e o detalhamento passo a passo dos 5 fluxos do sistema.

- 📌 **Para consultar a instrução original do professor:**<br>
  Acesse **[`docs/instrucao-inicial.md`](docs/instrucao-inicial.md)** para visualizar o tema, requisitos de entrega e instruções de modelagem dadas em aula.

- 🖼️ **Para acessar diretamente os diagramas em SVG:**<br>
  Consulte a pasta **[`assets/`](assets/)**:
  - [DA-01 — Diagrama de Atividades](assets/DA01_Agendamento.svg)
  - [DS-01 — Diagrama de Sequência](assets/DS01_Agendamento.svg)
  - [DC — Diagrama de Classes](assets/DC_Classes.svg)

---

## 🛠️ Como Renderizar os Diagramas

Os diagramas UML são mantidos em formato PlantUML dentro de [trabalho-modelagem-uml.md](trabalho-modelagem-uml.md).

Para regerar ou atualizar as imagens SVG em [assets/](assets/):

1. **Pré-requisitos:** Node.js (v16+), Java, Graphviz (`dot`) e PlantUML (JAR ou extensão do VS Code).
2. **Execução:**
   ```bash
   node scripts/renderizar-diagramas.js
   ```
