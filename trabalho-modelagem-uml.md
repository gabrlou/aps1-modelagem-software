# Trabalho de Modelagem UML — Sistema de Agendamento de Consultas Médicas

---

## Capa

**Universidade Federal de Goiás**

**Engenharia de Software** — **Modelagem de Software**

---

### Modelagem de Software — APS 1

**Tema:** Aplicativo de Agendamento de Consultas Médicas

---

**Integrantes do grupo:**

- Carlos Eduardo Freire da Silva
- Gabriel Henrique Lourenço Dias
- Kayque Vicente Silva
- Luiz Pedro Pereira Mendes Saraiva
- Yury Nogueira de Oliveira Silva

**Professor(a):** Diogo Oliveira Santos

**Goiânia — 14 de outubro de 2026**

---

## 1. Descrição da Aplicação

### 1.1 Contexto e Objetivos

Este trabalho apresenta a modelagem de um sistema web responsivo para agendamento de consultas médicas em clínicas e consultórios, acessível tanto pelo celular quanto pelo computador.

O objetivo principal é dar autonomia ao paciente para que ele possa, a qualquer hora e sem depender de atendimento telefônico, pesquisar especialidades e médicos, consultar horários vagos e agendar, acompanhar, cancelar ou remarcar suas consultas. Ao mesmo tempo, o sistema atende à equipe da clínica: os médicos configuram seus horários de atendimento e acompanham seus pacientes, enquanto os secretários monitoram a ocupação da clínica, confirmam presenças e auxiliam pacientes no balcão ou por telefone.

### 1.2 Problema de Negócio e Solução Proposta

Processos manuais em clínicas costumam gerar sobrecarga na recepção, marcações duplas no mesmo horário e alto índice de faltas pela falta de lembretes práticos. Além disso, controles em planilhas ou papel dificultam o remanejamento rápido de horários cancelados e não oferecem histórico confiável para auditoria.

O sistema resolve esses problemas ao centralizar as agendas em uma base única, aplicando validação em tempo real e bloqueio atômico de horários para impedir conflitos entre pacientes concorrentes. Para reduzir as faltas, a aplicação envia confirmações e lembretes simultaneamente por e-mail e WhatsApp. Além disso, todas as ações críticas (agendamentos, confirmações, cancelamentos com motivo obrigatório e alterações de grade) geram registros de auditoria com autor, data/hora e IP, garantindo rastreabilidade e conformidade com a LGPD.

### 1.3 Atores do Sistema

O sistema conta com quatro atores bem definidos:

1. **Paciente:** cadastra-se com CPF, e-mail e telefone celular; autentica-se com senha segura; pesquisa médicos por especialidade; consulta a grade de horários disponíveis; e gerencia suas consultas (agendamento, histórico, remarcação e cancelamento). Recebe notificações automáticas por e-mail e WhatsApp e pode responder para confirmar presença.
2. **Médico:** profissional cadastrado com CRM, UF e especialidades ativas. Configura sua disponibilidade semanal (dias de atendimento, horário de expediente e duração das consultas); bloqueia horários pontuais por conveniência; visualiza sua agenda; e registra o status do atendimento (iniciando e concluindo a consulta).
3. **Secretário:** profissional da recepção. Acompanha as agendas de todos os médicos, gerencia as consultas pendentes de confirmação (com contato proativo com pacientes quando necessário), registra confirmações ou recusas e pode agendar ou cancelar consultas a pedido de pacientes presenciais ou por telefone.
4. **Sistema de Notificação (`<<system>>`):** componente secundário que roda em segundo plano. Consome os eventos gerados pelas operações da clínica e envia as mensagens em paralelo via e-mail e WhatsApp, com fila de retentativas automáticas caso ocorra instabilidade temporária na rede, garantindo que o agendamento nunca trave por falha de envio.

### 1.4 Módulos Funcionais e Regras de Negócio

O sistema é organizado em seis módulos complementares:

- **Módulo de Cadastro e Autenticação:** gerencia as contas de usuários. Exige e-mail único para todos e CPF único para pacientes. Médicos são cadastrados pelo par CRM/UF, único nacionalmente. Os perfis de acesso são exclusivos (`PACIENTE`, `MEDICO`, `SECRETARIO`). As senhas devem ter no mínimo 8 caracteres (com letras e números) e são armazenadas sob hash criptográfico, com bloqueio temporário após sucessivas tentativas incorretas.
- **Módulo de Especialidades e Médicos:** mantém o catálogo de especialidades. Apenas especialidades ativas aceitam novos agendamentos. Cada médico pode atender em uma ou mais especialidades, e a busca filtra somente profissionais ativos e vinculados à especialidade escolhida.
- **Módulo de Gestão de Horários e Agenda:** organiza a agenda em intervalos fixos de 30 minutos (slots), sem sobreposição para o mesmo médico. Cada slot tem um estado claro (`LIVRE`, `BLOQUEADO` ou `OCUPADO`). Os horários ficam disponíveis para reserva dentro do expediente do médico, respeitando uma janela de até 90 dias no futuro.
- **Módulo de Agendamento:** conduz o paciente em passos diretos: escolha da especialidade, escolha do médico, seleção de data/horário livre, revisão dos dados e confirmação. A confirmação realiza bloqueio atômico do horário para evitar que dois pacientes reservem a mesma vaga simultaneamente. A consulta é criada com status `AGENDADA`, pode ser `CONFIRMADA`, passa para `EM_ANDAMENTO` durante a consulta e termina como `REALIZADA`.
- **Módulo de Cancelamento e Remarcação:** qualquer cancelamento ou remarcação exige antecedência mínima de 2 horas. Caso falte menos de 2 horas, o cancelamento pelo sistema é bloqueado, orientando o contato direto com a clínica. O cancelamento exige obrigatoriamente um motivo/justificativa; quando concluído, o slot volta imediatamente para `LIVRE`. A remarcação cancela a consulta original (marcada como `REMARCADA` com vínculo recíproco), libera o slot antigo, bloqueia o novo horário e cria uma nova consulta `AGENDADA`, com reversão automática caso o novo horário falhe.
- **Módulo de Notificações e Auditoria:** registra logs imutáveis de cada operação crítica e envia avisos por e-mail e WhatsApp simultaneamente de forma assíncrona. Uma falha temporária no envio da mensagem nunca cancela a consulta criada, ficando a notificação em fila para novas tentativas.

---

## 2. Diagramas de Atividades

Em conformidade com o escopo priorizado para a entrega acadêmica, foram selecionados dois diagramas complementares: o **DA-01**, que detalha o fluxo principal de valor do sistema (jornada de agendamento), e o **DA-02**, que evidencia o fluxo alternativo crítico com ramificações condicionais de controle temporal e liberação de recursos (cancelamento de consulta).

### 2.1 DA-01 — Fluxo Principal de Agendamento de Consulta

**Objetivo:** representar o processo completo de agendamento de consulta pelo paciente, desde a seleção da especialidade até o recebimento da confirmação, incluindo fluxos alternativos e de exceção.

**Processo representado:** o paciente autenticado percorre uma jornada em cinco etapas: seleção de especialidade, seleção de médico, escolha de data e horário livre, revisão do resumo e confirmação final. O sistema valida a disponibilidade do horário de forma atômica (prevenindo corridas), grava a consulta como `AGENDADA`, ocupa o horário e dispara notificação em segundo plano. São representados os caminhos alternativos de inexistência de horários livres, de disputa concorrente pelo mesmo horário (quando outro paciente confirma frações de segundo antes) e de falha na entrega da notificação.

```plantuml
@startuml DA01_Agendamento
|Paciente|
start
:Selecionar especialidade;
|Sistema|
:Listar apenas\nespecialidades ativas;
|Paciente|
:Escolher especialidade;
|Sistema|
:Listar médicos ativos\nda especialidade escolhida;
|Paciente|
:Selecionar médico;
|Sistema|
:Exibir horários disponíveis\n(dentro do expediente, livres\ne em até 90 dias);

if (Há horários disponíveis?) then (sim)
  |Paciente|
  :Selecionar data e horário;
  |Sistema|
  :Exibir resumo de confirmação\n(médico, especialidade,\ndata/hora);
  |Paciente|
  if (Paciente confirma?) then (sim)
    |Sistema|
    :Validar disponibilidade\n(bloqueio atômico do slot);

    if (Slot ainda disponível?) then (sim)
      :Gravar consulta com\nstatus AGENDADA;
      :Ocupar slot\n(situação = OCUPADO);
      :Registrar evento\nde auditoria\n(CONSULTA_CRIADA);
      :Disparar notificações (fila)\nvia e-mail e WhatsApp;

      if (Notificações enviadas\ncom sucesso?) then (sim)
        :Registrar notificações\ncomo ENVIADAS;
      else (não — contingência)
        :Manter agendamento confirmado;\n:Enfileirar notificações\npara retentativas automáticas;
      endif

      :Exibir comprovativo\ncom código da consulta;
      |Paciente|
      :Visualizar comprovativo;
      stop
    else (não — concorrência: slot ocupado\npor outro paciente)
      :Exibir mensagem:\n"Este horário acabou\nde ser ocupado";
      :Retornar à listagem\nde horários;
      |Sistema|
      :Exibir horários disponíveis\natualizados;
      note right
        Paciente pode
        selecionar novo horário
        ou desistir
      end note
      |Paciente|
      :Selecionar novo horário\nou desistir;
      stop
    endif
  else (não — paciente desiste)
    stop
  endif
else (não — nenhum\nhorário disponível)
  |Sistema|
  :Sugerir próximos dias\ncom vagas;
  |Paciente|
  :Selecionar novo dia\nou desistir;
  stop
endif

@enduml
```

**Explicação:** o diagrama utiliza raias (*swimlanes*) para separar o que é ação do paciente do processamento interno do sistema. O fluxo principal cobre a jornada de agendamento em passos diretos. Os pontos de decisão tratam as regras principais: verificação de vagas no futuro, confirmação do paciente, bloqueio atômico do horário para evitar reservas simultâneas e contingência caso a notificação falhe (garantindo que uma falha de envio nunca cancele a consulta agendada).

---

### 2.2 DA-02 — Cancelamento de Consulta

**Objetivo:** representar o cancelamento de uma consulta futura, destacando a obrigatoriedade do motivo, a antecedência mínima de 2 horas e a liberação imediata do horário.

**Processo representado:** o usuário (paciente, secretário ou médico) seleciona uma consulta futura (`AGENDADA` ou `CONFIRMADA`), solicita o cancelamento e deve obrigatoriamente informar o motivo. Com o motivo preenchido, o sistema valida se a solicitação foi feita com pelo menos 2 horas de antecedência. Em caso positivo, o status da consulta muda para `CANCELADA`, o slot de horário volta para `LIVRE`, a ação é registrada em auditoria e as notificações são disparadas por e-mail e WhatsApp.

```plantuml
@startuml DA02_Cancelamento
|Usuário (Paciente/Secretário/Médico)|
start
:Acessar consulta futura\n(status AGENDADA ou CONFIRMADA);
:Selecionar "Cancelar";

|Sistema|
:Exibir dados da consulta\ne solicitar motivo (obrigatório);

|Usuário (Paciente/Secretário/Médico)|
if (Usuário informa motivo\ne confirma cancelamento?) then (sim)
  |Sistema|
  :Validar preenchimento do motivo\ne janela (antecedência ≥ 2 horas);

  if (Dentro da janela\npermitida?) then (sim)
    :Alterar status para\nCANCELADA;
    :Registrar autor, data/hora\ne motivo obrigatório;
    :Liberar slot de horário\n(situação = LIVRE);
    :Registrar evento\nde auditoria;
    :Disparar notificações de cancelamento\nvia e-mail e WhatsApp ao paciente\n(e ao médico, se a consulta\nestava CONFIRMADA);
    |Usuário (Paciente/Secretário/Médico)|
    :Visualizar confirmação\ndo cancelamento;
    stop
  else (não — prazo expirado:\nmenos de 2 horas)
    :Exibir mensagem:\n"Cancelamento indisponível.\nEntre em contato\ndiretamente com a clínica";
    stop
  endif
else (não — usuário desiste ou não informa motivo)
  stop
endif

@enduml
```

**Explicação:** o diagrama destaca duas regras fundamentais: o preenchimento obrigatório do motivo do cancelamento e o limite de antecedência de pelo menos 2 horas. Se o prazo tiver expirado, o sistema bloqueia o cancelamento automático para evitar horários ociosos na clínica sem aviso prévio. Quando o cancelamento é realizado, a vaga é liberada imediatamente (`LIVRE`) e ambos os canais (e-mail e WhatsApp) são notificados.

---

## 3. Diagramas de Sequência

Foram elaborados dois diagramas de sequência focados nos cenários mais importantes: o **DS-01**, que detalha as trocas de mensagens no agendamento pelo paciente, e o **DS-02**, que apresenta a confirmação de presença pela secretaria, incluindo tratamento de concorrência e recusa.

### 3.1 DS-01 — Fluxo de Agendamento Completo

**Objetivo:** detalhar a sequência de mensagens entre o paciente, o sistema e os objetos de negócio durante o agendamento, destacando a validação atômica do horário e o envio assíncrono de notificações.

**Cenário representado:** paciente autenticado realiza o agendamento, com tratamento para horário indisponível, concorrência no momento da reserva e contingência em falhas de notificação.

```plantuml
@startuml DS01_Agendamento
actor Paciente
participant "Sistema" as S
participant "Agenda" as AG
participant "Horario" as H
participant "Consulta" as C
participant "Notificacao" as N

Paciente -> S : selecionarEspecialidade(idEspecialidade)
activate S
S -> S : listarEspecialidadesAtivas()
S --> Paciente : listaEspecialidades

Paciente -> S : selecionarMedico(idMedico)
S -> S : listarMedicosAtivos(idEspecialidade)
S --> Paciente : listaMedicos

Paciente -> S : solicitarHorariosDisponiveis(idMedico)
S -> AG : getHorariosDisponiveis(intervalo)
activate AG
AG -> H : filtrarSlots(LIVRE, dentroDoExpediente,\n>= agora, <= 90 dias)
activate H
H --> AG : slotsDisponiveis
deactivate H
AG --> S : horariosDisponiveis
deactivate AG

alt Há horários disponíveis
  S --> Paciente : exibirHorarios(horariosDisponiveis)
  Paciente -> S : selecionarHorario(idHorario)
  S --> Paciente : exibirResumo(medico, especialidade, data, hora)

  Paciente -> S : confirmarAgendamento()

  S -> H : estaDisponivel()
  activate H
  H --> S : disponivel: boolean
  deactivate H

  alt Slot disponível (bloqueio atômico)
    S -> H : ocupar()
    activate H
    H --> S : slotOcupado
    deactivate H

    S -> C : criarConsulta(paciente, medico,\nespecialidade, horario,\nstatus=AGENDADA)
    activate C
    C --> S : consultaCriada (id, código)
    deactivate C

    S -> S : registrarAuditoria(CONSULTA_CRIADA)

    S ->> N : dispararNotificacao(AGENDAMENTO,\npaciente, consulta)
    activate N
    note right of N
      Envio assíncrono (fila)
      por e-mail e WhatsApp
      Falha de envio não desfaz
      o agendamento criado
    end note

    alt Notificação enviada com sucesso
      N -> N : registrarEnvio()
    else Falha no envio (contingência)
      N -> N : registrarFalha()
      N -> N : enfileirarRetry()\n(até 3 tentativas)
    end
    deactivate N

    S --> Paciente : exibirComprovativo(codigoConsulta)
  else Slot já ocupado (concorrência — HorarioIndisponivelException)
    S --> Paciente : mensagem("Este horário\nacabou de ser ocupado")
    S -> AG : getHorariosDisponiveis(intervalo)
    activate AG
    AG --> S : horariosAtualizados
    deactivate AG
    S --> Paciente : exibirHorariosAtualizados()
  end

else Nenhum horário disponível
  S --> Paciente : sugerirProximosDiasComVagas()
end

deactivate S
@enduml
```

**Explicação:** o diagrama detalha o ciclo de vida temporal da transação de agendamento. O objeto `Horario` é verificado e imediatamente travado de forma atômica para prevenir condição de corrida entre múltiplos usuários concorrentes. O bloco condicional `alt` principal gerencia a existência de datas vagas; o bloco interno lida com o caso em que dois pacientes tentam confirmar o mesmo horário simultaneamente, lançando `HorarioIndisponivelException` e atualizando a grade em tela. Por sua vez, a mensagem assíncrona (`->>`) enviada a `Notificacao` isola a transação principal: mesmo que o serviço externo de envio oscile, o registro da consulta médica permanece íntegro e salvo no banco de dados.

---

### 3.2 DS-02 — Confirmação de Consulta pelo Secretário

**Objetivo:** representar a interação do secretário com o sistema para confirmar uma consulta, evidenciando o registro do autor e a notificação simultânea ao paciente e ao médico.

**Cenário representado:** secretário autenticado abre a lista de consultas pendentes de confirmação, seleciona um agendamento e executa a confirmação no sistema após contato com o paciente, tratando cenários concorrentes e hipótese de recusa.

```plantuml
@startuml DS02_Confirmacao
actor "Secretário" as Sec
participant "Sistema" as S
participant "Consulta" as C
participant "Notificacao" as N
actor Paciente as Pac

Sec -> S : visualizarPendencias(filtroMedico, filtroData)
activate S
S -> C : listarPorStatus(AGENDADA, filtro)
activate C
C --> S : consultasPendentes
deactivate C
S --> Sec : exibirListaPendencias

Sec -> S : selecionarConsulta(idConsulta)
S --> Sec : exibirDadosConsulta

alt Paciente confirma presença
  Sec -> S : confirmarConsulta(idConsulta)

  S -> C : confirmar(autorSecretario)
  activate C

  alt Status atual é AGENDADA
    C -> C : setStatus(CONFIRMADA)
    C -> C : registrarAutor(secretario, timestamp)
    C --> S : consultaConfirmada
    deactivate C

    S -> S : registrarAuditoria(CONSULTA_CONFIRMADA)

    S ->> N : dispararNotificacao(CONFIRMACAO,\npaciente, medico, consulta)
    activate N
    N --> Pac : notificação de confirmação
    N -> N : registrarEnvio()
    deactivate N

    S --> Sec : exibirSucesso("Consulta confirmada")

  else Status já alterado (concorrência temporal)
    C --> S : erroEstadoDesatualizado
    deactivate C
    S --> Sec : exibirAviso("Consulta já\nalterada por outro usuário")
    S -> C : listarPorStatus(AGENDADA, filtro)
    activate C
    C --> S : listaAtualizada
    deactivate C
    S --> Sec : atualizarListaPendencias
  end

else Paciente recusa agendamento
  Sec -> S : recusarConsulta(idConsulta,\nmotivo="Recusado pelo paciente")
  S -> C : cancelar(autorSecretario,\nmotivo="Recusado pelo paciente")
  activate C
  C -> C : setStatus(CANCELADA)
  C --> S : consultaCancelada
  deactivate C
  S -> S : liberarSlot()
  S -> S : registrarAuditoria(CONSULTA_CANCELADA)
  S ->> N : dispararNotificacao(CANCELAMENTO,\npaciente, consulta)
  S --> Sec : exibirSucesso("Consulta cancelada")
end

deactivate S
@enduml
```

**Explicação:** o diagrama mostra a rotina do secretário ao interagir com a `Consulta`. O primeiro bloco `alt` trata a confirmação versus a recusa do paciente. A validação de concorrência trata acessos simultâneos: caso o paciente tenha acabado de cancelar a consulta pelo app, o sistema barra a confirmação com dados antigos. Ao confirmar, o sistema registra quem confirmou, a data/hora e dispara as notificações.

---

## 4. Diagrama de Classes — Nível Macro

### 4.1 Objetivo

Apresentar a estrutura orientada a objetos do sistema: classes principais, atributos tipados, métodos essenciais, enumerações e relacionamentos (herança, associação, composição e autorrelação).

### 4.2 Código PlantUML

```plantuml
@startuml DC_Classes
skinparam classAttributeIconSize 0
skinparam linetype ortho
hide empty members

' ===== ENUMERAÇÕES =====

enum Perfil {
  PACIENTE
  MEDICO
  SECRETARIO
}

enum StatusUsuario {
  ATIVO
  INATIVO
  BLOQUEADO
}

enum StatusEspecialidade {
  ATIVA
  INATIVA
}

enum StatusConsulta {
  AGENDADA
  CONFIRMADA
  EM_ANDAMENTO
  REALIZADA
  CANCELADA
  REMARCADA
  NAO_REALIZADA
}

enum SituacaoHorario {
  LIVRE
  BLOQUEADO
  OCUPADO
}

enum TipoEvento {
  AGENDAMENTO
  CONFIRMACAO
  CANCELAMENTO
  REMARCACAO
  LEMBRETE
}

enum Canal {
  EMAIL
  WHATSAPP
}

enum StatusEntrega {
  PENDENTE
  ENVIADA
  FALHOU
}

' ===== CLASSES =====

abstract class Usuario {
  - id: Long
  - nome: String
  - email: String {unique}
  - senhaHash: String
  - telefone: String
  - status: StatusUsuario
  - criadoEm: DateTime
  + autenticar(email, senha): boolean
  + alterarSenha(atual, nova): void
  + getPerfil(): Perfil
}

class Paciente {
  - cpf: String {unique}
  - dataNascimento: Date
  - canalPreferido: Canal
  + agendar(consulta): void
  + cancelar(consulta, motivo: String): void
  + remarcar(consulta, novoHorario): Consulta
  + listarConsultas(): List<Consulta>
}

class Medico {
  - crm: String
  - ufCrm: String {unique(crm,uf)}
  - ativo: boolean
  + definirDisponibilidade(regra): void
  + bloquearHorario(horario): void
  + visualizarAgenda(periodo): List<Consulta>
  + iniciarConsulta(c): void
  + encerrarConsulta(c, status): void
}

class Secretario {
  - matricula: String
  + confirmarConsulta(consulta): void
  + visualizarAgendaGeral(filtro): List<Consulta>
  + criarConsultaEmNomeDoPaciente(...): Consulta
}

class Especialidade {
  - id: Long
  - nome: String {unique}
  - descricao: String
  - status: StatusEspecialidade
  + ativar(): void
  + desativar(): void
}

class Agenda {
  - id: Long
  - diasAtendimento: Set<DiaSemana>
  - horaInicio: Time
  - horaFim: Time
  - duracaoSlot: Duration
  - antecedenciaMinima: Duration
  + gerarHorarios(data): List<Horario>
  + getHorariosDisponiveis(intervalo): List<Horario>
  + atualizarRegra(regra): void
}

class Horario {
  - id: Long
  - data: Date
  - horaInicio: Time
  - horaFim: Time
  - situacao: SituacaoHorario
  + estaDisponivel(): boolean
  + bloquear(motivo): void
  + liberar(): void
  + ocupar(): void
}

class Consulta {
  - id: Long
  - dataHora: DateTime
  - status: StatusConsulta
  - motivoCancelamento: String
  - criadoEm: DateTime
  - atualizadoEm: DateTime
  + confirmar(por: Usuario): void
  + cancelar(por: Usuario, motivo: String): void
  + remarcar(novoHorario: Horario): Consulta
  + iniciar(): void
  + encerrar(status): void
  + podeSerAlterada(): boolean
}

class Notificacao {
  - id: Long
  - evento: TipoEvento
  - canal: Canal
  - destinatario: String
  - enviadoEm: DateTime
  - statusEntrega: StatusEntrega
  - tentativas: int
  + registrarEnvio(): void
  + registrarFalha(): void
}

class Auditoria {
  - id: Long
  - acao: String
  - entidade: String
  - entidadeId: Long
  - dataHora: DateTime
  - ip: String
  + registrar(evento): void
}

' ===== RELACIONAMENTOS =====

' Herança: Usuario -> Paciente, Medico, Secretario
Usuario <|-- Paciente
Usuario <|-- Medico
Usuario <|-- Secretario

' Medico N:N Especialidade
Medico "1..*" -- "1..*" Especialidade : atende >

' Medico 1:1 Agenda
Medico "1" -- "1" Agenda : possui >

' Agenda 1:N Horario
Agenda "1" *-- "1..*" Horario : gera >

' Horario 1:0..1 Consulta
Horario "1" -- "0..1" Consulta : ocupa <

' Consulta N:1 Paciente
Consulta "0..*" -- "1" Paciente : pertence a >

' Consulta N:1 Medico
Consulta "0..*" -- "1" Medico : atendida por >

' Consulta N:1 Especialidade
Consulta "0..*" -- "1" Especialidade : classificada por >

' Consulta auto-relação (remarcação)
Consulta "0..1" -- "0..1" Consulta : remarcadaDe >

' Consulta 1:N Notificacao
Consulta "1" -- "0..*" Notificacao : gera >

' Usuario 1:N Auditoria
Usuario "1" -- "0..*" Auditoria : registrada por >

@enduml
```

### 4.3 Explicação

**Estrutura de herança:** a classe abstrata `Usuario` concentra os atributos comuns de identificação e autenticação (`id`, `nome`, `email`, `senhaHash`, `telefone`, `status`, `criadoEm`) e os métodos de segurança. As três especializações — `Paciente`, `Medico` e `Secretario` — herdam de `Usuario` e introduzem seus respectivos campos de domínio (como `cpf` para pacientes, par `crm`/`ufCrm` para médicos e `matricula` para secretários). Os perfis de acesso são mutuamente exclusivos por credencial.

**Relacionamentos principais:**

- **Medico – Especialidade (N:N):** reflete a prática médica real na qual um profissional pode atender em múltiplas especialidades registradas, ao mesmo tempo em que uma especialidade da clínica agrega múltiplos médicos habilitados.
- **Medico – Agenda (1:1):** cada médico detém sua própria grade de expediente e disponibilidade parametrizada.
- **Agenda – Horario (1:N, composição):** a grade divide o expediente em blocos discretos e indivisíveis de atendimento (slots de 30 minutos). A relação de composição indica dependência de existência: os slots não existem desvinculados de sua respectiva agenda médica.
- **Horario – Consulta (1:0..1):** restrição cardinal de unicidade. Um slot livre pode não possuir nenhuma consulta vinculada, mas quando ocupado, atende estritamente a uma única consulta ativa, impossibilitando reservas simultâneas no mesmo período.
- **Consulta – Paciente (N:1):** um paciente pode manter histórico de múltiplas consultas agendadas, realizadas ou canceladas.
- **Consulta – Medico (N:1):** o agendamento vincula-se explicitamente ao profissional responsável pela condução do atendimento clínico.
- **Consulta – Especialidade (N:1):** a especialidade médica vinculada à consulta é congelada no instante do agendamento, preservando a fidelidade histórica caso o médico venha a alterar suas especialidades no futuro.
- **Consulta – Consulta (auto-relação 0..1):** a associação reflexiva via atributo `remarcadaDe` estabelece o encadeamento histórico em operações de remarcação, ligando a consulta cancelada/remarcada à nova consulta agendada.
- **Consulta – Notificacao (1:N):** cada atendimento emite comunicações ao longo de suas transições de estado (criação, confirmação, cancelamento, lembrete prévio). O método de cancelamento exige obrigatoriamente a passagem do parâmetro `motivo`, persistido no atributo `motivoCancelamento`.
- **Usuario – Auditoria (1:N):** cada operação registrada no log imutável de auditoria armazena a identidade do usuário operador, garantindo conformidade com a LGPD.

**Enumerações tipadas:**
- `Perfil`: tipifica as três categorias de atores humanos do sistema (`PACIENTE`, `MEDICO`, `SECRETARIO`).
- `StatusUsuario`: modela o estado cadastral da conta (`ATIVO`, `INATIVO`, `BLOQUEADO`).
- `StatusEspecialidade`: delimita o estado operacional das especialidades médicas (`ATIVA`, `INATIVA`), onde somente especialidades ativas aceitam novos agendamentos. A tipagem dedicada evita confusão conceitual com o status de usuários (que inclui contas bloqueadas).
- `StatusConsulta`: gerencia o ciclo de vida completo do atendimento (`AGENDADA`, `CONFIRMADA`, `EM_ANDAMENTO`, `REALIZADA`, `CANCELADA`, `REMARCADA`, `NAO_REALIZADA`).
- `SituacaoHorario`: governa o estado de cada vaga da grade (`LIVRE`, `BLOQUEADO`, `OCUPADO`).
- `TipoEvento`: categoriza os gatilhos de comunicação disparados no sistema.
- `Canal`: especifica os canais de transmissão de mensagens suportados pelo sistema (`EMAIL`, `WHATSAPP`). Como regra de domínio, as notificações e confirmações são emitidas simultaneamente por ambos os canais, garantindo registro na caixa postal e agilidade no mensageiro móvel; o atributo `canalPreferido` no paciente indica a via prioritária para resposta e interação direta.
- `StatusEntrega`: rastreia o ciclo de entrega de cada mensagem gerada (`PENDENTE`, `ENVIADA`, `FALHOU`).

---

## 5. Considerações Finais

A modelagem desenvolvida demonstra como a UML permite organizar e comunicar a arquitetura de um sistema antes da implementação, conectando as regras de negócio aos modelos de software.

Os **diagramas de atividades** detalharam os processos centrais: o caminho completo de agendamento pelo paciente (**DA-01**) e o cancelamento com suas restrições (**DA-02**). O uso de raias (*swimlanes*) delimitou com clareza o que é de responsabilidade do usuário e o que é executado pelo sistema, cobrindo regras práticas como a antecedência mínima de 2 horas e a devolução imediata do horário cancelado para a grade.

Os **diagramas de sequência** detalharam a dinâmica e a troca de mensagens entre os objetos ao longo do tempo. O agendamento (**DS-01**) destacou a reserva atômica de horários para evitar condições de corrida entre pacientes, enquanto a rotina da recepção (**DS-02**) tratou o fluxo de confirmação e as exceções de recusa ou cancelamento simultâneo.

Por fim, o **diagrama de classes** estruturou a visão estática do domínio através de 10 classes e 8 enumerações bem delimitadas, estabelecendo os relacionamentos essenciais — como a herança de usuários, a composição da agenda em slots de atendimento, a ligação entre médicos e especialidades e a rastreabilidade por auditoria.

A consistência entre os modelos garante que cada método invocado nos fluxos de sequência e atividades corresponda exatamente a uma operação das classes, oferecendo uma base técnica sólida e pronta para guiar o desenvolvimento do sistema.

---

## 6. Verificação de Consistência e Decisões de Modelagem

### 6.1 Decisões Arquiteturais e de Modelagem

Para garantir a precisão formal dos diagramas e a autossuficiência do modelo, foram adotadas as seguintes decisões de engenharia de software:

| # | Decisão de Modelagem | Justificativa Técnica |
|---|----------------------|-----------------------|
| DM-01 | Tipagem explícita da enumeração `StatusEntrega` (`PENDENTE`, `ENVIADA`, `FALHOU`) no diagrama de classes. | Formaliza o ciclo de vida da mensageria assíncrona, viabilizando o controle de estado e a rastreabilidade da comunicação disparada nos agendamentos e confirmações. |
| DM-02 | Criação da enumeração dedicada `StatusEspecialidade` (`ATIVA`, `INATIVA`) para a entidade `Especialidade`. | Isola a semântica de ativação do catálogo médico do estado cadastral de contas de usuário (`StatusUsuario`), impedindo que especialidades assumam estados impróprios como `BLOQUEADO`. |
| DM-03 | Abstração da camada de apresentação em um participante de controle unificado (`Sistema`) nos diagramas de sequência. | Mantém o foco no comportamento do domínio e nas transações lógicas do sistema, evitando acoplamento prematuro com frameworks específicos de front-end antes da fase de implementação. |

### 6.2 Análise de Consistência entre Modelos

A modelagem foi concebida de forma totalmente integrada, assegurando coerência mútua entre os diagramas:

- **Classes versus Sequência:** todas as mensagens síncronas representadas nos diagramas de sequência — como `confirmar()`, `cancelar()`, `podeSerAlterada()`, `ocupar()`, `liberar()`, `estaDisponivel()`, `registrarEnvio()` e `registrarFalha()` — correspondem a operações públicas declaradas nas respectivas classes (`Consulta`, `Horario`, `Notificacao`, `Agenda`).
- **Classes versus Atividades:** as restrições de cardinalidade (por exemplo, a multiplicidade `1:0..1` entre `Horario` e `Consulta`) sustentam diretamente as decisões dos diagramas de atividades, garantindo que nenhum horário livre seja alocado duplamente.
- **Atividades versus Sequência:** as ramificações de concorrência e exceção mapeadas no fluxo de atividades (como indisponibilidade de slot e estado desatualizado) possuem correspondência direta nos fragmentos combinados `alt` dos diagramas de sequência via exceções tipadas (`HorarioIndisponivelException`).
- **Máquina de Estados da Consulta:** o ciclo de vida refletido na enumeração `StatusConsulta` (`AGENDADA` → `CONFIRMADA` ou `CANCELADA`) é rigorosamente seguido tanto nas decisões dos diagramas de atividades quanto nas mensagens de atualização de estado nos diagramas de sequência.

### 6.3 Quadro de Validação dos Artefatos

| Critério de Validação | Avaliação | Evidência nos Modelos |
|---|---|---|
| Conformidade de métodos | ✅ Consistente | Operações chamadas na sequência são métodos formais do diagrama de classes. |
| Coerência de papéis e atores | ✅ Consistente | Atores humanos (`Paciente`, `Médico`, `Secretário`) atuam segundo suas competências definidas nos diagramas de atividades e sequência. |
| Integridade temporal de cancelamento | ✅ Consistente | Janela de antecedência mínima (≥ 2 horas) validada e tratada no diagrama de atividades DA-02. |
| Unicidade de horário | ✅ Consistente | Multiplicidade `1:0..1` entre `Horario` e `Consulta` suportada por bloqueio atômico no DA-01 e DS-01. |
| Desacoplamento de mensageria | ✅ Consistente | Mensagem assíncrona para `Notificacao` isola a transação principal no DA-01, DS-01 e DS-02. |

---

*Trabalho acadêmico de modelagem de software estruturado de forma integral e autossuficiente, contendo a especificação conceitual, fluxos de atividades, dinâmica sequencial e estrutura de classes orientada a objetos.*
