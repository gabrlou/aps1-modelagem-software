# Especificação de Requisitos — Aplicativo de Agendamento de Consultas Médicas

> **Documento:** APS 1 — Modelagem de Software
> **Fonte:** descrição inicial (`instrucao-inicial.md`) + instruções do professor
> **Finalidade:** servir de base para a modelagem UML (Diagramas de Atividades, Sequência e Classes)
> **Versão:** 1.0

---

## Sumário

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Atores](#2-atores)
3. [Requisitos Funcionais](#3-requisitos-funcionais)
4. [Requisitos Não Funcionais](#4-requisitos-não-funcionais)
5. [Regras de Negócio](#5-regras-de-negócio)
6. [Fluxos do Sistema](#6-fluxos-do-sistema)
7. [Modelo Conceitual](#7-modelo-conceitual)
8. [Apoio ao Diagrama de Classes](#8-apoio-ao-diagrama-de-classes)
9. [Apoio ao Diagrama de Sequência](#9-apoio-ao-diagrama-de-sequência)
10. [Apoio ao Diagrama de Atividades](#10-apoio-ao-diagrama-de-atividades)
11. [Considerações de UX](#11-considerações-de-ux)
12. [Premissas e Decisões de Projeto](#12-premissas-e-decisões-de-projeto)

---

## 1. Visão Geral do Sistema

### 1.1 Objetivo do sistema

Disponibilizar um aplicativo que permita a **marcação, consulta, remarcação e cancelamento de consultas médicas** de forma autônoma pelo paciente, com a agenda sendo gerenciada pelo médico (ou em seu nome pelo secretário) e com confirmação automatizada das consultas agendadas.

### 1.2 Problema que resolve

Os atuais processos de agendamento em clínicas e consultórios costumam ser realizados por telefone ou presencialmente, o que gera:

- **Filas e congestionamento** no atendimento da recepção;
- **Alta taxa de faltas** por ausência de lembrete ao paciente;
- **Conflitos de agenda** por dupla marcação e erros de anotação manual;
- **Dificuldade de remarcação/cancelamento**, que exige novo contato telefônico;
- **Perda de disponibilidade**: horários vagos não são rapidamente preenchidos;
- **Falta de histórico centralizado** para auditoria e estatísticas.

### 1.3 Benefícios esperados

| Benefício | Descrição |
|---|---|
| Autonomia do paciente | Agenda, remarcou e cancela 24/7 sem depender da recepção |
| Redução de faltas | Notificações de confirmação e lembrete antes da consulta |
| Agenda consistente | Regras de negócio impedem conflito e sobreposição de horários |
| Melhor uso da agenda | Cancelamentos liberam o horário imediatamente para outros pacientes |
| Rastreabilidade | Histórico de alterações e eventos de notificação armazenados |
| Padronização | Dados de consulta, especialidade e médico em formato único |

### 1.4 Escopo

**Dentro do escopo:**

- Cadastro e consulta de pacientes, médicos, especialidades e secretários;
- Visualização de horários disponíveis por especialidade/médico;
- Agendamento, cancelamento e remarcação de consultas;
- Gestão da agenda do médico (bloqueio de horários, definição de disponibilidade);
- Confirmação de consultas pelo secretário;
- Notificações (agendamento, confirmação, lembrete, cancelamento, remarcação);
- Consulta de histórico de consultas do paciente e do médico.

**Fora do escopo (nesta versão):**

- Prontuário eletrônico, prescrições e resultados de exames;
- Pagamento, faturamento, convênios e emitente de nota fiscal;
- Teleconsulta/vídeo;
- Cadastro de clínicas/estabelecimentos múltiplos (multi-tenant);
- Aplicativo nativo para relojoaria de dispositivos — considera-se **web app responsivo** (ver Premissa P-01).

---

## 2. Atores

### 2.1 Paciente

- **Descrição:** pessoa que busca atendimento médico e utiliza o aplicativo para agendar, visualizar, remarcar ou cancelar suas próprias consultas.
- **Responsabilidades:**
  - Cadastrar-se e manter seus dados de contato atualizados;
  - Buscar médico por especialidade;
  - Visualizar horários disponíveis;
  - Agendar, remarcar e cancelar suas consultas;
  - Confirmar ou recusar o lembrete de consulta.
- **Permissões:**
  - Ler/alterar **apenas** seus próprios dados;
  - Ler o catálogo de especialidades e a agenda **disponível** dos médicos (não a agenda completa);
  - Criar, ler, remarcar e cancelar **somente** consultas em que é o paciente titular.
- **Interações com o sistema:**
  - Login/identificação → busca de especialidade → seleção de médico → visualização de horários → confirmação do agendamento → recebimento de notificação → (opcional) cancelamento/remarcação.

### 2.2 Médico

- **Descrição:** profissional habilitado que presta o serviço de consulta e é responsável pela disponibilidade da própria agenda e pelo encerramento das consultas.
- **Responsabilidades:**
  - Definir sua disponibilidade semanal (dias e faixas de atendimento);
  - Bloquear/desbloquear horários específicos (férias, imprevistos);
  - Visualizar sua agenda diária/semanal;
  - Iniciar e encerrar consultas;
  - Visualizar histórico de suas consultas.
- **Permissões:**
  - Ler e alterar **apenas** sua própria agenda e seus dados cadastrais;
  - Ler dados do paciente **apenas** no contexto de consultas agendadas para ele;
  - **Não** pode agendar consulta em nome do paciente (ação exclusiva do paciente/secretário);
  - **Não** pode acessar agendas de outros médicos.
- **Interações com o sistema:**
  - Login → gerenciar disponibilidade → visualizar agenda → atender consulta → registrar status da consulta → (opcional) solicitar remarcação.

### 2.3 Secretário

- **Descrição:** profissional da recepção que apoia a gestão operacional da agenda, especialmente na confirmação de consultas.
- **Responsabilidades:**
  - Confirmar consultas agendadas (por telefone/presencialmente);
  - Visualizar a agenda geral da clínica (dos médicos habilitados);
  - Visualizar dados de pacientes necessários ao atendimento;
  - Auxiliar no agendamento e remarcação presencial/telefônica (premissa P-06).
- **Permissões:**
  - Ler agenda de todos os médicos cadastrados;
  - Alterar o **status** de confirmação de consultas;
  - Criar/alterar consultas **em nome do paciente** (com suas próprias credenciais registradas no histórico);
  - **Não** pode alterar a disponibilidade de agenda do médico (exceto bloqueios operacionais autorizados — ver RN-14);
  - **Não** pode apagar consultas (apenas cancelar, com registro de motivo).
- **Interações com o sistema:**
  - Login → visualização da agenda → seleção da consulta → confirmação → registro no histórico → notificação ao paciente (quando aplicável).

### 2.4 Sistema de Notificação (ator secundário/automático)

- **Descrição:** subsistema ou serviço externo responsável por disparar mensagens ao paciente e ao médico. Ator **não humano**.
- **Responsabilidades:**
  - Enviar notificação de **agendamento**;
  - Enviar notificação de **confirmação**;
  - Enviar **lembrete** (pré-consulta);
  - Enviar notificação de **cancelamento/remarcação**;
  - Registrar o resultado (enviado/falhou) de cada disparo.
- **Permissões:**
  - Ler os dados mínimos necessários da consulta (destinatário, horário, médico, especialidade, status);
  - **Não** pode alterar status de consulta nem dados cadastrais.
- **Interações com o sistema:**
  - Recebe **evento** do módulo de agendamento → envia mensagem pelo canal preferido (e-mail/SMS/push) → grava o retorno → em caso de falha, sinaliza para reprocessamento.

> **Observação de modelagem:** como ator de sistema, será representado como **ator estereotipado `<<system>>`** (ou como objeto/参与者 externo) nos diagramas de sequência.

---

## 3. Requisitos Funcionais

### 3.1 Módulo de Cadastro e Autenticação

| ID | Requisito | Descrição detalhada | Regras de negócio |
|---|---|---|---|
| RF-01 | Cadastrar paciente | O sistema deve permitir o cadastro de paciente com nome, CPF, data de nascimento, e-mail, telefone e senha. | RN-01, RN-02, RN-03 |
| RF-02 | Autenticar usuário | O sistema deve autenticar paciente, médico e secretário por e-mail + senha, diferenciando perfis. | RN-04, RN-22 |
| RF-03 | Recuperar senha | O sistema deve permitir redefinição de senha por link enviado ao e-mail cadastrado. | RN-05 |
| RF-04 | Gerenciar cadastro de médico | O sistema deve permitir cadastrar médico com nome, CRM, especialidade(s) e contato, restrito a administradores/secretários autorizados. | RN-06, RN-07 |
| RF-05 | Gerenciar especialidades | O sistema deve manter o catálogo de especialidades (nome, descrição, status ativo/inativo). | RN-08 |

### 3.2 Módulo de Consulta de Médicos e Especialidades

| ID | Requisito | Descrição detalhada | Regras de negócio |
|---|---|---|---|
| RF-06 | Listar especialidades | O sistema deve exibir todas as especialidades ativas para busca. | RN-08 |
| RF-07 | Listar médicos por especialidade | Dada uma especialidade, o sistema deve listar os médicos ativos que a atendem. | RN-06, RN-09 |
| RF-08 | Exibir horários disponíveis | Para cada médico, o sistema deve exibir apenas os horários **livres** dentro da sua disponibilidade, considerando o horário atual. | RN-10, RN-11, RN-12 |

### 3.3 Módulo de Agendamento

| ID | Requisito | Descrição detalhada | Regras de negócio |
|---|---|---|---|
| RF-09 | Agendar consulta | O paciente deve poder agendar consulta selecionando especialidade → médico → data → horário livre, com confirmação final antes do envio. | RN-10, RN-12, RN-13, RN-15 |
| RF-10 | Confirmar agendamento | Após a reserva bem-sucedida, o sistema deve exibir resumo da consulta e disparar notificação de agendamento. | RN-16, RN-20 |
| RF-11 | Visualizar minhas consultas | O paciente deve poder listar suas consultas futuras e passadas com respectivo status. | RN-17 |
| RF-12 | Cancelar consulta | O paciente (ou secretário) deve poder cancelar uma consulta futura, informando motivo opcional, liberando o horário. | RN-18, RN-19 |
| RF-13 | Remarcar consulta | O sistema deve permitir remarcar uma consulta futura, validando o novo horário como uma nova reserva. | RN-18, RN-19, RN-12 |

### 3.4 Módulo de Agenda do Médico

| ID | Requisito | Descrição detalhada | Regras de negócio |
|---|---|---|---|
| RF-14 | Definir disponibilidade | O médico deve poder definir dias da semana e faixas horárias de atendimento, com antecedência mínima configurável. | RN-10, RN-21 |
| RF-15 | Bloquear horário | O médico deve poder bloquear um horário específico já disponível (sem consulta), tornando-o indisponível. | RN-11, RN-21 |
| RF-16 | Visualizar agenda | O médico e o secretário devem poder visualizar a agenda em visão diária/semanal, com status de cada consulta. | RN-17 |
| RF-17 | Encerrar consulta | O médico deve poder marcar a consulta como **realizada** (com ou sem observações simples) ao final do atendimento. | RN-23 |

### 3.5 Módulo de Confirmação (Secretário)

| ID | Requisito | Descrição detalhada | Regras de negócio |
|---|---|---|---|
| RF-18 | Confirmar consulta | O secretário deve poder confirmar uma consulta com status *agendada*, alterando-a para *confirmada* e registrando quem confirmou e quando. | RN-16, RN-24 |
| RF-19 | Visualizar pendências | O sistema deve listar as consultas pendentes de confirmação, filtráveis por médico, data e status. | RN-24 |

### 3.6 Módulo de Notificação

| ID | Requisito | Descrição detalhada | Regras de negócio |
|---|---|---|---|
| RF-20 | Notificar eventos | O sistema deve disparar notificações nos eventos: agendada, confirmada, cancelada, remarcada, lembrete pré-consulta. | RN-20, RN-25 |
| RF-21 | Registrar notificações | Cada notificação deve ser persistida com destinatário, evento, canal, data/hora e status de entrega. | RN-25 |

---

## 4. Requisitos Não Funcionais

### 4.1 Segurança

| ID | Requisito |
|---|---|
| RNF-01 | Senhas armazenadas com hash (bcrypt/argon2), nunca em texto puro. |
| RNF-02 | Comunicação obrigatoriamente via HTTPS/TLS 1.2+. |
| RNF-03 | Controle de acesso baseado em perfil (RBAC): cada rota/ação validada contra o papel do usuário. |
| RNF-04 | Bloqueio temporário da conta após 5 tentativas de login falhas consecutivas. |
| RNF-05 | Sessões com expiração (token JWT de curta duração + refresh token revogável). |

### 4.2 Usabilidade

| ID | Requisito |
|---|---|
| RNF-06 | Fluxo de agendamento completo em **no máximo 5 passos** (especialidade → médico → horário → resumo → confirmação). |
| RNF-07 | Interface responsiva (mobile-first), funcionando em telas de 320px a 1920px. |
| RNF-08 | Mensagens de erro claras, em linguagem simples e sem jargão técnico. |
| RNF-09 | Prazo médio de tarefas: carregamento de tela ≤ 2 s (ver RNF-14). |

### 4.3 Desempenho

| ID | Requisito |
|---|---|
| RNF-10 | Tempo de resposta das APIs ≤ 500 ms no percentil 95 (P95) sob carga de 200 usuários simultâneos. |
| RNF-11 | Busca de horários disponíveis deve considerar no máximo 90 dias à frente. |
| RNF-12 | Disparo de notificações deve ser assíncrono (fila), não bloqueando a transação de agendamento. |

### 4.4 Disponibilidade

| ID | Requisito |
|---|---|
| RNF-13 | Disponibilidade de 99,5% em horário comercial (06h–22h), conforme SLA do serviço. |
| RNF-14 | Tempo de carregamento de página ≤ 2 s (P90). |
| RNF-15 | Backup diário automatizado com retenção de 30 dias e procedimento de restore testado. |

### 4.5 Escalabilidade

| ID | Requisito |
|---|---|
| RNF-16 | Arquitetura stateless nas APIs para permitir réplicas horizontais. |
| RNF-17 | Cache de catálogo de especialidades/médicos (TTL ≥ 5 min). |
| RNF-18 | Índices em consultas por (medico_id, data, horario) e (paciente_id, data). |

### 4.6 Privacidade

| ID | Requisito |
|---|---|
| RNF-19 | Dados pessoais tratados conforme LGPD; coleta limitada ao necessário (minimização). |
| RNF-20 | O paciente pode solicitar exportação ou exclusão dos seus dados, respeitando retenção legal de registros de saúde (art. 14 da Lei 13.787/2018 aplicado por analogia). |
| RNF-21 | Dados de saúde e histórico de consultas não expostos em URLs, logs ou payloads de notificação além do mínimo. |

### 4.7 Auditoria

| ID | Requisito |
|---|---|
| RNF-22 | Log de auditoria imutável para eventos: criar, confirmar, cancelar, remarcar, bloquear horário e alterar cadastro. |
| RNF-23 | Todo evento registra: **quem** (usuário/perfil), **o quê** (ação + entidade), **quando** (data/hora UTC) e **de onde** (IP/user-agent). |
| RNF-24 | Logs de auditoria com retenção mínima de 5 anos. |

---

## 5. Regras de Negócio

### 5.1 Identificação e acesso

| ID | Regra |
|---|---|
| **RN-01** | O CPF deve ter 11 dígitos, ser válido (módulo 11) e **único** no cadastro de pacientes. |
| **RN-02** | O e-mail deve ser válido e **único** por usuário no sistema. |
| **RN-03** | A senha deve ter no mínimo 8 caracteres, contendo ao menos 1 letra e 1 número. |
| **RN-04** | O sistema autentica por e-mail + senha e deriva o perfil (PACIENTE, MEDICO, SECRETARIO) do cadastro. |
| **RN-05** | Links de redefinição de senha expiram em 30 minutos e são de uso único. |
| **RN-22** | Após 5 falhas consecutivas de login, a conta é bloqueada por 15 minutos. |

### 5.2 Cadastros e catálogo

| ID | Regra |
|---|---|
| **RN-06** | Todo médico deve ter **ao menos uma** especialidade ativa para aparecer nas buscas. |
| **RN-07** | O par (CRM, UF) do médico é **único** no sistema. |
| **RN-08** | Só são exibidas especialidades com `status = ATIVA`. |
| **RN-09** | Paciente, médico e secretário só são exibidos com `status = ATIVO`; cadastro inativo não pode gerar novas consultas. |

### 5.3 Disponibilidade e horários

| ID | Regra |
|---|---|
| **RN-10** | Um horário só é considerado **disponível** se: pertencer à disponibilidade do médico, estar dentro do expediente configurado, não estiver bloqueado e **não houver consulta ativa** (AGENDADA, CONFIRMADA ou EM_ANDAMENTO) naquele slot. |
| **RN-11** | Cada horário de consulta ocupa um **slot fixo de 30 minutos** (ver Premissa P-04), sem sobreposição entre consultas do mesmo médico. |
| **RN-12** | Não é permitido agendar em data/hora **anterior ao momento atual** nem com antecedência superior a **90 dias**. |
| **RN-21** | Alterações de disponibilidade ou bloqueios que atinjam consultas já existentes **não** as cancelam automaticamente; o sistema deve sinalizar conflito e exigir tratamento manual. |

### 5.4 Ciclo de vida da consulta

| ID | Regra |
|---|---|
| **RN-13** | Toda consulta nasce com status `AGENDADA` e está sempre associada a **1 paciente, 1 médico, 1 especialidade e 1 slot de horário**. |
| **RN-15** | A **remarcação** é modelada como: cancelamento da consulta original (status `REMARCADA`, com vínculo para a nova) + criação de nova consulta — garantindo histórico completo. |
| **RN-16** | Apenas uma consulta pode ocupar o mesmo (médico, data, horário) com status ativo. |
| **RN-17** | Consultas passadas com status `AGENDADA` transicionam automaticamente para `NAO_REALIZADA` após o fim do slot. |
| **RN-18** | Cancelamento/remarcação só é permitido **até 2 horas antes** do horário da consulta (ver Premissa P-05). |
| **RN-19** | Cancelamentos e remarcações exigem **confirmação explícita** do usuário e registram autor, data e motivo. |
| **RN-23** | Somente o médico titular pode marcar consulta como `REALIZADA`; o status final só transiciona a partir de `CONFIRMADA` ou `EM_ANDAMENTO`. |

**Máquina de estados do status da consulta:**

```text
AGENDADA ──confirmar──▶ CONFIRMADA ──iniciar──▶ EM_ANDAMENTO ──encerrar──▶ REALIZADA
   │                        │                        │
   │                        └──── ausência ───────────┼────▶ NAO_REALIZADA
   │                                                  │
   ├──cancelar──▶ CANCELADA                          │
   └──remarcar──▶ REMARCADA ──(gera nova)──▶ AGENDADA ┘
```

> Transições inválidas (ex.: cancelar `REALIZADA`) devem ser rejeitadas pela aplicação.

### 5.5 Confirmação e notificação

| ID | Regra |
|---|---|
| **RN-14** | Bloqueios operacionais de horário feitos pelo secretário exigem justificativa e ficam registrados em auditoria. *(Premissa P-07)* |
| **RN-20** | Todo evento de mudança de status da consulta dispara **uma** notificação ao paciente; eventos de confirmação também notificam o médico. |
| **RN-24** | Somente **secretário** (ou o próprio médico) pode confirmar consulta; a confirmação registra o autor e o timestamp. |
| **RN-25** | Falha no envio de notificação **não** desfaz a transação principal; a notificação entra em fila de nova tentativa (até 3 tentativas com backoff). |
| **RN-26** | O lembrete é disparado **24 h antes** do horário da consulta, apenas para status `CONFIRMADA` ou `AGENDADA`. |

### 5.6 Restrições, validações e exceções (síntese)

- **Validações de entrada:** CPF, e-mail, senha, data futura, CRM duplicado, horário dentro do expediente.
- **Restrições de integridade:** unicidade de slot por médico; FK obrigatórias de paciente/médico/especialidade.
- **Exceções de domínio:**
  - `HorarioIndisponivelException` — slot foi ocupado/bloqueado entre a listagem e a confirmação (corrida de usuários);
  - `ForaDaJanelaDeCancelamentoException` — tentativa de cancelar/remarcar com menos de 2 h;
  - `ConflitoDeAgendaException` — nova disponibilidade/bloqueio colide com consulta existente;
  - `NaoAutorizadoException` — usuário tentando operar recurso de outro usuário/perfil;
  - `NotificacaoFalhouException` — capturada e tratada de forma não bloqueante.

---

## 6. Fluxos do Sistema

### Fluxo F-01 — Agendar consulta

- **Objetivo:** permitir que um paciente reserve um horário com um médico.
- **Pré-condições:**
  - Paciente autenticado;
  - Médico ativo com disponibilidade publicada;
  - Horário desejado dentro da janela (≥ agora + antecedência mínima e ≤ 90 dias).
- **Fluxo principal:**
  1. Paciente seleciona a **especialidade** desejada;
  2. Sistema lista os **médicos ativos** daquela especialidade;
  3. Paciente seleciona o **médico**;
  4. Sistema exibe os **horários disponíveis** (calendário/slots);
  5. Paciente seleciona data e horário;
  6. Sistema exibe **resumo de confirmação** (médico, especialidade, data/hora, local/presencial);
  7. Paciente confirma;
  8. Sistema **valida disponibilidade** (lock atômico do slot);
  9. Sistema grava a consulta com status `AGENDADA`;
  10. Sistema dispara **notificação de agendamento** (fila);
  11. Sistema exibe comprovativo com código da consulta.
- **Fluxos alternativos:**
  - **A1 (passo 4):** nenhum horário disponível → sistema sugere próximos dias com vagas;
  - **A2 (passo 8):** slot foi ocupado por outro usuário → mensagem *"Este horário acabou de ser ocupado"* e retorno ao passo 4;
  - **A3 (passo 10):** falha no envio da notificação → agendamento **mantido**, notificação entra em retry (RN-25).
- **Fluxos de exceção:**
  - **E1:** sessão expirada → redirecionar ao login e retomar o fluxo após autenticação;
  - **E2:** falha de persistência → rollback total, mensagem de erro e nenhuma notificação emitida;
  - **E3:** horário fora da janela permitida → bloquear seleção antes do envio (validação client/server).
- **Pós-condições:**
  - Consulta existente com status `AGENDADA`;
  - Slot ocupado e indisponível para terceiros;
  - Notificação registrada na fila;
  - Evento de auditoria gravado (`CONSULTA_CRIADA`).

### Fluxo F-02 — Cancelar consulta

- **Objetivo:** liberar um horário previamente reservado.
- **Pré-condições:**
  - Consulta com status `AGENDADA` ou `CONFIRMADA`;
  - Usuário autorizado (paciente titular, secretário ou médico);
  - Antecedência ≥ 2 h do horário (RN-18).
- **Fluxo principal:**
  1. Usuário acessa a consulta e seleciona **Cancelar**;
  2. Sistema exibe dados da consulta e solicita **motivo (opcional)**;
  3. Usuário confirma o cancelamento;
  4. Sistema valida a janela de cancelamento;
  5. Sistema altera status para `CANCELADA` (ou `REMARCADA`, se oriundo de remarcação);
  6. Sistema **libera o slot**;
  7. Sistema dispara notificação de cancelamento ao paciente (e ao médico, se confirmada);
  8. Sistema registra auditoria.
- **Fluxos alternativos:**
  - **A1:** usuário desiste na confirmação → nenhuma alteração;
  - **A2:** cancelamento pelo secretário → notificação e registro identificam o autor como secretário.
- **Fluxos de exceção:**
  - **E1:** dentro da janela proibida (< 2 h) → exibir *"Cancelamento indisponível. Entre em contato com a clínica"* e encerrar;
  - **E2:** consulta já cancelada por outro usuário → mensagem de estado desatualizado e atualização da tela.
- **Pós-condições:**
  - Status da consulta `CANCELADA`;
  - Horário volta a figurar como disponível;
  - Notificação e auditoria registradas.

### Fluxo F-03 — Remarcar consulta

- **Objetivo:** trocar data/horário de uma consulta preservando o histórico.
- **Pré-condições:** as mesmas de F-02; consulta futura dentro da janela permitida.
- **Fluxo principal:**
  1. Usuário seleciona **Remarcar** na consulta;
  2. Sistema apresenta os horários disponíveis do mesmo médico (fluxo análogo ao passo 4 de F-01);
  3. Usuário escolhe o novo horário e confirma;
  4. Sistema valida o novo slot;
  5. Sistema transiciona a consulta original para `REMARCADA` **com vínculo** para a nova;
  6. Sistema cria nova consulta com status `AGENDADA`;
  7. Sistema notifica o paciente (novo horário) e o médico;
  8. Auditoria registra os dois eventos vinculados.
- **Fluxos alternativos:**
  - **A1:** usuário seleciona outro médico → permitido, tratado como novo agendamento + cancelamento (torna explícito na UI que serão dois registros).
- **Fluxos de exceção:**
  - **E1:** novo horário indisponível na confirmação → rollback, consulta original **inalterada**;
  - **E2:** janela vencida → inviabilizar remarcação.
- **Pós-condições:**
  - Consulta original `REMARCADA` (histórico preservado);
  - Nova consulta `AGENDADA` ocupando o novo slot;
  - Notificações e auditoria gravadas.

### Fluxo F-04 — Gerenciar disponibilidade do médico

- **Objetivo:** definir os períodos em que o médico aceita consultas.
- **Pré-condições:** médico autenticado.
- **Fluxo principal:**
  1. Médico acessa **Minha Agenda → Disponibilidade**;
  2. Informa dias da semana, faixa horária e duração dos slots;
  3. Sistema **simula o impacto** (lista consultas existentes afetadas, se houver);
  4. Médico confirma;
  5. Sistema grava a disponibilidade e recalcula os slots livres;
  6. Auditoria registrada.
- **Fluxos alternativos:**
  - **A1:** sem consultas afetadas → gravação direta;
  - **A2:** médicodesativa um dia inteiro com consultas → o sistema **não** cancela automaticamente; lista as consultas para tratamento manual (RN-21).
- **Fluxos de exceção:**
  - **E1:** faixa horária inválida (início ≥ fim, slots não múltiplos de 30 min) → validação imediata.
- **Pós-condições:** novos slots gerados; consultas futuras mantidas; auditoria gravada.

### Fluxo F-05 — Confirmar consulta (secretário)

- **Objetivo:** operacionalizar a confirmação telefônica/presencial.
- **Pré-condições:** secretário autenticado; consulta com status `AGENDADA`.
- **Fluxo principal:**
  1. Secretário abre **Pendências de Confirmação**;
  2. Filtra por médico/data;
  3. Seleciona a consulta;
  4. Confirma (ou informa motivo de recusa);
  5. Sistema altera status para `CONFIRMADA`, registrando autor e timestamp;
  6. Notificação ao paciente;
  7. Auditoria gravada.
- **Fluxos alternativos:**
  - **A1:** paciente recusa → status `CANCELADA` com motivo *"Recusado pelo paciente"* (passa ao fluxo F-02).
- **Fluxos de exceção:**
  - **E1:** consulta já confirmada/cancelada por terceiro → aviso de concorrência e atualização da lista.
- **Pós-condições:** status `CONFIRMADA`; paciente notificado; elegível ao lembrete de 24 h.

### Fluxo F-06 — Disparo de notificação (ator Sistema de Notificação)

- **Objetivo:** entregar mensagens de estado ao paciente/médico de forma confiável.
- **Pré-condições:** evento publicado na fila (agendada/confirmada/cancelada/remarcada/lembrete).
- **Fluxo principal:**
  1. Módulo de domínio publica o evento;
  2. Consumidor monta a mensagem com dados mínimos;
  3. Envia pelo canal preferido do destinatário;
  4. Grava registro `Notificacao` com status `ENVIADA`;
  5. Auditoria do evento.
- **Fluxos alternativos:**
  - **A1:** canal preferido indisponível → fallback para canal secundário (ex.: SMS → e-mail).
- **Fluxos de exceção:**
  - **E1:** falha após 3 tentativas → status `FALHOU`, alerta para suporte; o negócio principal **não** é afetado (RN-25).
- **Pós-condições:** registro de notificação com status final; fila drenada.

### Fluxo F-07 — Encerrar consulta (médico)

- **Objetivo:** finalizar o atendimento e liberar indicadores.
- **Pré-condições:** médico autenticado; consulta `EM_ANDAMENTO` ou `CONFIRMADA`.
- **Fluxo principal:**
  1. Médico seleciona a consulta na agenda;
  2. Marca **Iniciar** (→ `EM_ANDAMENTO`) durante o atendimento;
  3. Ao final, marca **Encerrar** com status `REALIZADA`;
  4. Auditoria gravada; consulta sai da agenda futura.
- **Fluxos de exceção:**
  - **E1:** paciente não compareceu → encerrar como `NAO_REALIZADA` com justificativa.
- **Pós-condições:** status final consolidado; métricas atualizadas.

---

## 7. Modelo Conceitual

### 7.1 Principais entidades e responsabilidades

| Entidade | Responsabilidade |
|---|---|
| **Paciente** | Pessoa usuária que solicita consultas; detém dados de contato e histórico. |
| **Medico** | Profissional que presta a consulta e administra sua disponibilidade. |
| **Secretario** | Profissional que opera a confirmação e a visão geral da agenda. |
| **Especialidade** | Domínio de atuação (cardiologia, dermatologia…) usado na busca e classificação de consultas. |
| **Agenda** | Representa a disponibilidade de um médico (dias, faixas, regras de slot). |
| **Horario (Slot)** | Unidade atômica de tempo da agenda; pode estar livre, bloqueado ou ocupado. |
| **Consulta** | Reserva efetiva de um slot para um paciente com um médico; possui ciclo de vida. |
| **Notificacao** | Registro do disparo de uma mensagem a um destinatário sobre um evento. |
| **Usuario** | Entidade base de autenticação (herdada por Paciente/Medico/Secretario). |
| **Auditoria** | Registro imutável das ações relevantes realizadas no sistema. |

### 7.2 Relacionamentos esperados

```text
Usuario 1 ──────< 1 Paciente            (1:1, especialização)
Usuario 1 ──────< 1 Medico              (1:1, especialização)
Usuario 1 ──────< 1 Secretario          (1:1, especialização)

Medico >────────< Especialidade         (N:N — médico atende várias especialidades)

Medico 1 ───────< 1 Agenda              (1:1)
Agenda 1 ───────< 1..* Horario          (1:N — agenda gera slots)
Horario 1 ──────── 0..1 Consulta        (1:0..1 — slot ocupado por no máx. 1 consulta ativa)

Consulta N ─────── 1 Paciente           (N:1)
Consulta N ─────── 1 Medico             (N:1)
Consulta N ─────── 1 Especialidade      (N:1 — especialidade da consulta, congelada no ato)
Consulta 0..1 ──── 1 Consulta           (autorreferência: remarcada_de / origem)
Consulta 1 ───────< 0..* Notificacao    (1:N)
Secretario 1 ─────< 0..* Consulta       (quem confirmou — atributo na Consulta)
Usuario 1 ────────< 0..* Auditoria      (1:N)
```

---

## 8. Apoio ao Diagrama de Classes

> Atributos em *itálico* são opcionais. Multiplicidades e generalizações seguem o modelo conceitual.

### 8.1 `Usuario` (abstrata)

- **Responsabilidade:** autenticação e identificação comum a todos os perfis.
- **Atributos:** `id: Long`, `nome: String`, `email: String` {unique}, `senhaHash: String`, `telefone: String`, `status: StatusUsuario`, `criadoEm: DateTime`.
- **Métodos:** `autenticar(email, senha): boolean`, `alterarSenha(atual, nova): void`, `getPerfil(): Perfil`.
- **Relacionamentos:** superclass de `Paciente`, `Medico`, `Secretario`; 1:N com `Auditoria`.

### 8.2 `Paciente`

- **Responsabilidade:** titular das consultas; realiza agendamentos.
- **Atributos:** `cpf: String` {unique}, `dataNascimento: Date`, `canalPreferido: CanalNotificacao`.
- **Métodos:** `agendar(consulta): void`, `cancelar(consulta, motivo): void`, `remarcar(consulta, novoHorario): Consulta`, `listarConsultas(): List<Consulta>`.
- **Relacionamentos:** 1:N com `Consulta`; 1:1 com `Usuario`.

### 8.3 `Medico`

- **Responsabilidade:** prestar consultas e gerir sua disponibilidade.
- **Atributos:** `crm: String`, `ufCrm: String` {unique(crm,uf)}, `ativo: boolean`.
- **Métodos:** `definirDisponibilidade(regra): void`, `bloquearHorario(horario): void`, `visualizarAgenda(periodo): List<Consulta>`, `iniciarConsulta(c): void`, `encerrarConsulta(c, status): void`.
- **Relacionamentos:** N:N com `Especialidade`; 1:1 com `Agenda`; 1:N com `Consulta`.

### 8.4 `Secretario`

- **Responsabilidade:** confirmar consultas e apoiar a operação da agenda.
- **Atributos:** `matricula: String`.
- **Métodos:** `confirmarConsulta(consulta): void`, `visualizarAgendaGeral(filtro): List<Consulta>`, `criarConsultaEmNomeDoPaciente(...): Consulta`.
- **Relacionamentos:** 1:1 com `Usuario`; participa de `Consulta` (confirmação).

### 8.5 `Especialidade`

- **Responsabilidade:** classificar a área de atuação para busca e cobrança de dados da consulta.
- **Atributos:** `id: Long`, `nome: String` {unique}, `descricao: String`, `status: Status`.
- **Métodos:** `ativar(): void`, `desativar(): void`.
- **Relacionamentos:** N:N com `Medico`; 1:N com `Consulta`.

### 8.6 `Agenda`

- **Responsabilidade:** modelar as regras de disponibilidade de um médico e derivar slots.
- **Atributos:** `id: Long`, `diasAtendimento: Set<DiaSemana>`, `horaInicio: Time`, `horaFim: Time`, `duracaoSlot: Duration` (= 30 min), `antecedenciaMinima: Duration`.
- **Métodos:** `gerarHorarios(data): List<Horario>`, `getHorariosDisponiveis(intervalo): List<Horario>`, `atualizarRegra(regra): void`.
- **Relacionamentos:** 1:1 com `Medico`; 1:N com `Horario`.

### 8.7 `Horario` (Slot)

- **Responsabilidade:** unidade atômica de tempo; garante não sobreposição.
- **Atributos:** `id: Long`, `data: Date`, `horaInicio: Time`, `horaFim: Time`, `situacao: SituacaoHorario` (LIVRE/BLOQUEADO/OCUPADO).
- **Métodos:** `estaDisponivel(): boolean`, `bloquear(motivo): void`, `liberar(): void`, `ocupar(): void`.
- **Relacionamentos:** N:1 com `Agenda`; 1:0..1 com `Consulta`.

### 8.8 `Consulta`

- **Responsabilidade:** registro da reserva e de seu ciclo de vida.
- **Atributos:** `id: Long`, `dataHora: DateTime`, `status: StatusConsulta`, `motivoCancelamento: String`, `criadoEm: DateTime`, `atualizadoEm: DateTime`.
- **Métodos:** `confirmar(por: Usuario): void`, `cancelar(por: Usuario, motivo): void`, `remarcar(novoHorario: Horario): Consulta`, `iniciar(): void`, `encerrar(status): void`, `podeSerAlterada(): boolean`.
- **Relacionamentos:** N:1 com `Paciente`, `Medico`, `Especialidade`, `Horario`; 1:N com `Notificacao`; auto-relação `remarcadaDe: Consulta`.

### 8.9 `Notificacao`

- **Responsabilidade:** evidenciar a comunicação enviada.
- **Atributos:** `id: Long`, `evento: TipoEvento`, `canal: Canal`, `destinatario: String`, `enviadoEm: DateTime`, `statusEntrega: StatusEntrega` (PENDENTE/ENVIADA/FALHOU), `tentativas: int`.
- **Métodos:** `registrarEnvio(): void`, `registrarFalha(): void`.
- **Relacionamentos:** N:1 com `Consulta`.

### 8.10 `Auditoria`

- **Responsabilidade:** trilha imutável de eventos relevantes.
- **Atributos:** `id: Long`, `usuario: Usuario`, `acao: String`, `entidade: String`, `entidadeId: Long`, `dataHora: DateTime (UTC)`, `ip: String`.
- **Métodos:** *(somente gravação)* `registrar(evento): void`.
- **Relacionamentos:** N:1 com `Usuario`.

### 8.11 Enums sugeridos

```text
Perfil          = PACIENTE | MEDICO | SECRETARIO
StatusUsuario   = ATIVO | INATIVO | BLOQUEADO
StatusConsulta  = AGENDADA | CONFIRMADA | EM_ANDAMENTO | REALIZADA |
                  CANCELADA | REMARCADA | NAO_REALIZADA
SituacaoHorario = LIVRE | BLOQUEADO | OCUPADO
TipoEvento      = AGENDAMENTO | CONFIRMACAO | CANCELAMENTO | REMARCACAO | LEMBRETE
Canal           = EMAIL | SMS | PUSH
```

---

## 9. Apoio ao Diagrama de Sequência

Principais cenários que merecem diagrama de sequência:

| # | Cenário | Participantes | Por que modelar |
|---|---|---|---|
| DS-01 | **Fluxo de agendamento completo** | Paciente, UI, Sistema(Aplicação), Agenda/Horario, Consulta, Notificacao | Cenário central do sistema; mostra validação de slot e publicação do evento. |
| DS-02 | **Confirmação pelo secretário** | Secretário, UI, Consulta, Notificacao, Paciente(ator) | Evidencia mudança de estado e quem é o autor. |
| DS-03 | **Cancelamento pelo paciente (com bloqueio de janela)** | Paciente, UI, Sistema, Consulta, Horario, Notificacao | Mostra a regra de antecedência mínima e a liberação do slot. |
| DS-04 | **Remarcação (dois registros vinculados)** | Paciente, Sistema, Consulta(origem), Consulta(nova), Horario, Notificacao | Mostra a relação de auto-vínculo e o rollback em caso de corrida. |
| DS-05 | **Gerenciamento de disponibilidade com conflito** | Médico, UI, Agenda, Horario, Consulta(existente) | Mostra o cenário alternativo de conflito (RN-21). |
| DS-06 | **Disparo de notificação com falha e retry** | Sistema de Notificação `<<system>>`, Fila, Consulta | Mostra ator secundário e tratamento assíncrono (RN-25). |
| DS-07 | **Controle de acesso negado** | Usuário, Sistema(Auth), Recurso | Mostra guard de RBAC e exceção `NaoAutorizadoException`. |
| DS-08 | **Corrida por horário (dois pacientes)** | Paciente A, Paciente B, Sistema, Horario | Cenário de exceção clássico: `HorarioIndisponivelException`. |

> **Recomendação:** para a entrega da APS, priorizar **DS-01** e **DS-03** (ou DS-02), por cobrirem o fluxo principal e um fluxo alternativo relevante.

---

## 10. Apoio ao Diagrama de Atividades

| # | Processo | Observações de modelagem |
|---|---|---|
| DA-01 | **Fluxo principal de agendamento** | *Obrigatório pela entrega.* Decisão "horário disponível?" com alternativa de reseleção; nós de fim para sucesso e falha. |
| DA-02 | **Cancelamento de consulta** | Decisão "janela ≥ 2 h?" → dois caminhos (permitido/negado). |
| DA-03 | **Remarcação de consulta** | Subfluxo combinado: valida novo slot → cria nova → marca original como remarcada. |
| DA-04 | **Confirmação pelo secretário** | Inclui ramificação "paciente recusa → cancelar". |
| DA-05 | **Gerenciamento de agenda do médico** | Mostra impacto de bloqueio sobre consultas existentes (decisão de conflito). |
| DA-06 | **Ciclo de vida da consulta** | Atividade/estado final por status; útil como complemento didático. |
| DA-07 | **Fluxo de notificação com retry** | Repetição (loop) de tentativas até 3, com balão de fluxo de falha. |

> **Recomendação:** entregar **DA-01** (fluxo principal) + **DA-05** ou **DA-02** para demonstrar ramificações.

---

## 11. Considerações de UX

### 11.1 Fluxo ideal para os usuários

- **Paciente:** login → "Agendar" → especialidade (busca com filtro) → médico (com foto/especialidade) → calendário com **apenas slots livres** → resumo → confirmação → tela de sucesso com código e opção "Adicionar ao calendário".
- **Médico:** login → painel "Hoje" com agenda do dia → ações rápidas (Iniciar/Encerrar) → aba "Disponibilidade" com edição em grade semanal.
- **Secretário:** login → painel "Pendências de confirmação" → lista priorizada por data → ação de um clique com modal de confirmação.

### 11.2 Tratamento de erros

- Mensagens **específicas** (nunca "erro 500"): *"Este horário acabou de ser escolhido por outro paciente"*.
- Erros **junto ao campo** para validações de formulário, com foco no primeiro campo inválido.
- Estados de falha de rede com **botão "Tentar novamente"** e preservação do que o usuário já digitou.
- Nunca expor stack trace, SQL ou detalhes internos.

### 11.3 Feedback visual

- *Skeletons* / spinner em carregamentos > 300 ms.
- Toasts de sucesso (verde) e erro (vermelho) com duração ≥ 4 s.
- Indicador de passo no fluxo de agendamento (1/4 → 4/4).
- Status da consulta sempre com **ícone + cor + texto** (nunca apenas cor).

### 11.4 Confirmações

- Modal obrigatório para: **cancelar**, **remarcar**, **bloquear horário** e **desativar especialidade**.
- Modal exibindo o resumo do que será perdido/excluído e botão primário em destaque para a ação destrutiva (padrão "destaque na ação segura").
- Ações irreversíveis nunca disparadas por um único clique.

### 11.5 Boas práticas de acessibilidade

- Contraste mínimo **4.5:1** (WCAG AA) e navegação completa por teclado.
- Labels associados a todos os campos; erros anunciados via `aria-live`.
- Textos alternativos em imagens; alvos de toque ≥ 44×44 px.
- Fonte redimensionável até 200% sem perda de conteúdo.
- Campos de data/hora com seletores nativos (não apenas texto livre).

---

## 12. Premissas e Decisões de Projeto

Todas as hipóteses adotadas durante a modelagem ficam explícitas abaixo:

| ID | Premissa / Decisão | Justificativa |
|---|---|---|
| **P-01** | Aplicação será um **web app responsivo**, não app nativo. | Descrição usa "aplicativo"; o escopo da disciplina é modelagem, e web reduz esforço de entrega. |
| **P-02** | **Não há login/cadastro detalhado** na descrição original; foi **acrescentado** como requisito (RF-01 a RF-03). | Sem identificação não é possível respeitar permissões ("paciente só vê suas consultas"). Suposição de análise, marcada como extensão. |
| **P-03** | O **Sistema de Notificação** é modelado como **ator externo `<<system>>`**, consumindo eventos. | A descrição o lista como ator; mantém o princípio de que o sistema não notifica a si mesmo. |
| **P-04** | Duração fixa de **30 minutos** por consulta. | Simplifica a geração de slots e evita granularidade arbitrária; parametrizável na `Agenda`. |
| **P-05** | Cancelamento/remarcação apenas com **≥ 2 h de antecedência**. | Prática comum em clínicas; reduz perda de agenda. Valor configurável. |
| **P-06** | O **secretário pode criar consultas em nome do paciente**. | Descreve-se "secretários confirmam consultas"; foi ampliado de forma consistente com o papel de recepção. **Se o professor preferir escopo estrito, basta remover RF-19 parcial e a permissão.** |
| **P-07** | O secretário **não** altera agenda do médico, salvo bloqueios operacionais justificados (RN-14). | Preserva a autoridade do médico sobre a própria agenda. |
| **P-08** | **Remarcação = cancelar + criar nova consulta**, com vínculo entre ambas. | Preserva histórico completo e evita perda de rastro de auditoria. |
| **P-09** | Janela de agendamento: **mínimo 30 min no futuro, máximo 90 dias**. | Evita agendamento no passado e agenda demasiadamente longa. |
| **P-10** | A **especialidade da consulta é congelada** no ato do agendamento (cópia, não FK dinâmica). | Se a especialidade mudar de nome/status, o histórico permanece coerente. |
| **P-11** | **Multi-clínica/multi-tenant ficam fora de escopo** — um único contexto de clínica. | Não citado na descrição; evita complexidade indevida. |
| **P-12** | **Pagamento, convênios e prontuário ficam fora de escopo.** | Não citados na descrição. |
| **P-13** | Perfis são **exclusivos** (um usuário é paciente **ou** médico **ou** secretário), sem herança múltipla de papéis. | Simplifica RBAC; herança por generalização resolve os três casos. |
| **P-14** | O **lembrete** é disparado **24 h antes** e apenas para consultas `AGENDADA`/`CONFIRMADA`. | Valor típico de mercado; parametrizável. |
| **P-15** | Notificação é **assíncrona** e falha nela **não** desfaz o agendamento. | Prática de resiliência; evita acoplamento a provedores externos. |
| **P-16** | Auditoria cobre apenas eventos de **negócio** (criar/confirmar/cancelar/remarcar/bloquear/cadastro), não leituras. | Controle de custo e volumetria. |
| **P-17** | Toda entidade tem `id` surrogado (`Long`) + timestamps de criação/atualização. | Padrão de modelagem de dados consistente. |
| **P-18** | IDs dos requisitos (RF/RNF) e regras (RN) seguem a numeração deste documento e devem ser **mantidos** nos diagramas para rastreabilidade. | Facilita a avaliação da coerência entre artefatos. |

---

## Apêndice A — Rastreabilidade (resumo)

| Artefato | Requisitos envolvidos |
|---|---|
| DA-01 Agendamento | RF-06…RF-10, RN-10…RN-13, RN-16 |
| DA-02 Cancelamento | RF-12, RN-18, RN-19 |
| DA-03 Remarcação | RF-13, RN-15, RN-18 |
| DA-05 Agenda do médico | RF-14…RF-16, RN-10, RN-11, RN-21 |
| DS-01 Sequência de agendamento | RF-09, RF-10, RF-20, RN-16, RN-20 |
| DS-02 Confirmação | RF-18, RF-19, RN-24 |
| Classes | Todos os RF e RN |

---

*Fim da especificação — base suficiente para a produção dos três diagramas UML exigidos pela APS, sem necessidade de retorno à descrição original.*
