# Sistema de Agendamento de Consultas Médicas — Modelagem UML (APS 1)

> **Universidade Federal de Goiás (UFG)**<br>
> **Instituto de Informática (INF)** — Bacharelado em Engenharia de Software<br>
> **Disciplina:** Modelagem de Software<br>
> **Docente:** Me. Diogo Oliveira Santos<br>
> **Semestre Letivo:** 2026/2 — Goiânia, Outubro de 2026

---

## 👥 Integrantes do Grupo

- **Carlos Eduardo Freire da Silva**
- **Gabriel Henrique Lourenço Dias**
- **Kayque Vicente Silva**
- **Luiz Pedro Pereira Mendes Saraiva**
- **Yury Nogueira de Oliveira Silva**

---

## 📌 Visão Geral do Repositório

Este repositório reúne os artefatos de engenharia de software e a modelagem UML (estrutural e comportamental) desenvolvidos para a **APS 1** (Atividade Prática Supervisionada) da disciplina de Modelagem de Software.

O domínio abordado é um **aplicativo web de agendamento de consultas médicas** para clínicas e consultórios particulares, permitindo que pacientes pesquisem especialidades e médicos, agendem, remarquem ou cancelem consultas, além de oferecer ferramentas de gestão de grade para os médicos, apoio de recepção para secretários e controle de acessos para administradores.

### Principais Atores do Sistema
- **Paciente:** Usuário autenticado que consulta o catálogo médico, agenda consultas em horários livres e gerencia seus agendamentos.
- **Médico:** Profissional de saúde que gerencia sua grade de horários, visualiza a fila diária e atende os pacientes.
- **Secretário:** Operador da clínica responsável pelo contato receptivo/ativo, triagem de confirmações e suporte presencial.
- **Administrador:** Gestor responsável pelo cadastro de profissionais e secretários e manutenção de especialidades ativas.
- **Sistema de Notificação:** Ator secundário e automatizado responsável pelo disparo assíncrono de mensagens por E-mail e WhatsApp.

---

## 📂 Estrutura de Arquivos

| Arquivo / Diretório | Descrição |
| :--- | :--- |
| [**`trabalho-modelagem-uml.md`**](trabalho-modelagem-uml.md) | **Documento Principal de Entrega da APS 1.** Contém capa formal, introdução e descrição da aplicação, os 6 módulos funcionais, ciclo de vida da consulta, códigos-fonte PlantUML dos diagramas com justificativas técnicas, considerações finais, matriz de consistência cruzada e apêndices (especificação completa e glossário). |
| [**`docs/especificacao-requisitos.md`**](docs/especificacao-requisitos.md) | **Especificação Completa de Requisitos de Software.** Detalha os 21 Requisitos Funcionais (`RF-01` a `RF-21`), 23 Requisitos Não-Funcionais (`RNF-01` a `RNF-23`), 28 Regras de Negócio sequenciais (`RN-01` a `RN-28`), 5 fluxos de eventos (`F-01` a `F-05`), modelo conceitual e mapeamento de apoio aos diagramas. |
| [**`docs/instrucao-inicial.md`**](docs/instrucao-inicial.md) | Orientações didáticas, critérios de avaliação e diretrizes fornecidas pelo professor da disciplina para a elaboração do trabalho. |
| [**`assets/`**](assets/) | Diretório contendo os diagramas renderizados em formato vetorial SVG a partir dos blocos PlantUML. |
| [**`scripts/renderizar-diagramas.js`**](scripts/renderizar-diagramas.js) | Script de automação em Node.js que extrai os blocos PlantUML do documento principal e compila os arquivos SVG em `assets/`. |
| [**`.gitignore`**](.gitignore) | Regras para desconsiderar arquivos de sistema operacional (como `.DS_Store`) e metadados de IDEs no controle de versão. |

---

## 📊 Diagramas Modelados

Os artefatos UML foram construídos com foco em rastreabilidade, clareza e coerência mútua entre classes, atividades e trocas de mensagens:

### 1. Diagrama de Atividades — Agendamento de Consulta (`DA-01`)
Modela o fluxo operacional de agendamento de uma nova consulta pelo paciente.

- **Raias (Swimlanes):** `Paciente`, `Sistema` e `Sistema de Notificação`.
- **Destaques:**
  - Paralelismo com barras de sincronização (*fork* e *join*) para emissão do comprovante em tela enquanto as mensagens assíncronas por E-mail e WhatsApp são processadas de forma independente (`RNF-12`).
  - Tratamento de exceções e fluxos alternativos (indisponibilidade de horários, concorrência no slot, expiração de sessão e falha de notificação que não anula o agendamento, conforme `RN-27`).
- **Rastreabilidade:** `RF-02`, `RF-06` a `RF-10`, `RF-20`, `RF-21` (Fluxo `F-01`); Regras `RN-10` a `RN-13`, `RN-16`, `RN-18`, `RN-25`, `RN-27`.

![DA-01 — Diagrama de Atividades: Agendamento de Consulta](assets/DA01_Agendamento.svg)

---

### 2. Diagrama de Sequência — Agendamento de Consulta (`DS-01`)
Demonstra a ordenação temporal das mensagens e a colaboração entre os objetos de domínio durante o processo de reserva.

- **Participantes:** `Paciente` (ator principal), `Sistema` (controlador de aplicação), `Agenda`, `Horario`, `Consulta`, `Auditoria`, `Sistema de Notificacao` e entidades de entrega `Notificacao` (`EMAIL` e `WHATSAPP`).
- **Destaques:**
  - Instanciação de objetos (`<<create>>`) para novas consultas e registros de notificação.
  - Fragmentos combinados: `alt` para validação de disponibilidade e tratamento de horários ocupados; `par` para despacho assíncrono paralelo multicanal.
  - Registro de auditoria transacional imutável (`Auditoria.registrar`) com data/hora e identificador de autor.
- **Rastreabilidade:** `RF-06` a `RF-10`, `RF-20`, `RF-21` (Fluxo `F-01`); Regras `RN-10`, `RN-11`, `RN-13`, `RN-16`, `RN-18`, `RN-25`, `RN-27`.

![DS-01 — Diagrama de Sequência: Agendamento de Consulta](assets/DS01_Agendamento.svg)

---

### 3. Diagrama de Classes — Nível Macro (`DC`)
Apresenta a estrutura estática do domínio clínico, mapeando entidades, atributos tipados, operações com visibilidade (`+`, `-`, `#`), multiplicidades e relacionamentos conceituais.

- **Entidades Centrais:** `Usuario` (classe base abstrata), `Paciente`, `Medico`, `Secretario`, `Administrador`, `Especialidade`, `Agenda`, `Horario`, `Consulta`, `Notificacao` e `Auditoria`.
- **Destaques:**
  - Herança formal a partir de `Usuario`, garantindo especialização dos atores da clínica.
  - Composição forte entre `Agenda` e `Horario` (o ciclo de vida dos slots é dependente da agenda do médico).
  - Tipagem com tipos enumerados (`PerfilUsuario`, `StatusHorario`, `StatusConsulta`, `CanalNotificacao`, `StatusNotificacao`).
  - Métodos essenciais de validação e controle de concorrência (`Horario.ocupar()`, `Horario.liberar()`).
- **Rastreabilidade:** Cobertura de todos os requisitos funcionais e não-funcionais, com destaque para regras de consulta/horário (`RN-11` a `RN-13`, `RN-16` a `RN-18`), autoria (`RN-21`, `RN-26`) e auditoria (`RNF-22`, `RNF-23`).

![Diagrama de Classes (Nível Macro)](assets/DC_Classes.svg)

---

## 🛠️ Como Renderizar os Diagramas

Os diagramas utilizam código **PlantUML** embutido no arquivo [trabalho-modelagem-uml.md](trabalho-modelagem-uml.md). Para regerar os arquivos SVG da pasta [assets/](assets/):

### Pré-requisitos
- **Node.js** (versão 16 ou superior)
- **Java** instalado e configurado nas variáveis de ambiente
- **Graphviz (`dot`)** instalado no sistema operacional (necessário para o layout do Diagrama de Classes)
- **PlantUML JAR** (detectado automaticamente pela extensão PlantUML do VS Code ou via variável de ambiente `PLANTUML_JAR`)

### Comando de Execução
Na raiz do projeto, execute:
```bash
node scripts/renderizar-diagramas.js
```
O script processará os blocos `@startuml ... @enduml` do documento principal e atualizará os arquivos `.svg` correspondentes em `assets/`.
