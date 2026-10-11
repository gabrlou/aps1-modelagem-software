Preciso transformar uma descrição inicial de sistema em um documento completo de requisitos para apoiar toda a modelagem UML do projeto.

Objetivo: produzir uma especificação detalhada o suficiente para servir como base para Diagramas de Atividades, Sequência e Classes.

Gere a resposta em Markdown.

Expanda a descrição fornecida e assuma o papel de analista de requisitos. Não invente funcionalidades sem justificativa; quando fizer suposições, deixe explícito que são premissas do projeto. Utilize como base as melhores práticas do mercado nessa área.

O documento deve conter:

# Visão Geral do Sistema

* Objetivo do sistema
* Problema que resolve
* Benefícios esperados
* Escopo

# Atores

* Descrição detalhada de cada ator
* Responsabilidades
* Permissões
* Interações com o sistema

# Requisitos Funcionais

* Organizados por módulos
* Identificados por RF-01, RF-02...
* Descrição detalhada
* Regras de negócio associadas

# Requisitos Não Funcionais

* Segurança
* Usabilidade
* Desempenho
* Disponibilidade
* Escalabilidade
* Privacidade
* Auditoria

# Regras de Negócio

* Todas as regras relevantes para o domínio
* Restrições
* Validações
* Exceções

# Fluxos do Sistema

Para cada fluxo:

* Objetivo
* Pré-condições
* Fluxo principal
* Fluxos alternativos
* Fluxos de exceção
* Pós-condições

# Modelo Conceitual

* Principais entidades
* Responsabilidades de cada entidade
* Relacionamentos esperados

# Apoio ao Diagrama de Classes

Para cada classe principal:

* Responsabilidade
* Possíveis atributos
* Possíveis métodos
* Relacionamentos com outras classes

# Apoio ao Diagrama de Sequência

Identifique os principais cenários que merecem diagramas de sequência.

# Apoio ao Diagrama de Atividades

Identifique os principais processos que merecem diagramas de atividades.

# Considerações de UX

* Fluxo ideal para os usuários
* Tratamento de erros
* Feedback visual
* Confirmações
* Boas práticas de acessibilidade

# Premissas e Decisões de Projeto

Liste todas as hipóteses adotadas durante a modelagem.

O resultado deve ser suficientemente detalhado para que uma equipe consiga produzir diagramas UML consistentes sem precisar voltar à descrição original.

Descrição do sistema:

```txt
Aplicativo de Agendamento de Consultas Médicas
Descrição: Pacientes podem agendar consultas com médicos de diversas especialidades, escolher horários disponíveis, cancelar ou remarcar. Médicos gerenciam sua agenda. Secretários confirmam consultas.

Atores: Paciente, Médico, Secretário, Sistema de Notificação.

Fluxo principal sugerido:

Paciente escolhe especialidade → seleciona médico → visualiza horários disponíveis → agenda consulta → recebe confirmação → (opcional) cancela ou remarca.

Dicas de classes: Paciente, Medico, Secretario, Especialidade, Consulta, Agenda, Horario, Notificacao
```

Aqui temos as instruções dadas pelo professor:

```markdown
Objetivo do Trabalho:

Cada grupo deverá escolher um dos 4 temas propostos e, a partir da descrição da aplicação, produzir os seguintes artefatos UML:

- Diagrama de Atividades – representando o fluxo principal da aplicação.
- Diagrama de Sequência – mostrando a interação entre os atores e o sistema.
- Diagrama de Classes (macro) – apresentando as principais classes, atributos, métodos e relacionamentos.

Não é necessário implementar código. O foco está na modelagem correta, na clareza dos diagramas e na coerência entre eles.

Entregáveis:
- Capa (integrantes, tema escolhido)
- Descrição da aplicação (mínimo 1 página)
- Diagrama(s) de Atividades
- Diagrama(s) de Sequência
- Diagrama(s) de Classes
- Considerações finais do grupo
```