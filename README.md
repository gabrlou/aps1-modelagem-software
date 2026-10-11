# Aps1-modelagem-software

# Sumário

1. [Diagrama de Atividades](#diagrama-de-atividades)
2. [Diagrama de Sequência](#diagrama-de-sequência)
3. [Diagrama de Classes](#diagrama-de-classes)


# Diagrama de Atividades

## Diagrama de Atividade 1 - Agendamento de uma consulta
- Objetivo: Permitir que o paciente reserve um horário para atendimento
- Ator: Paciente (principal); Sistema de Notificação (secundário)
- Requisitos: RF-06 a RF-10 (fluxo F-01); regras RN-10 a RN-13, RN-16, RN-25

```mermaid
flowchart TD
    INI((Início)) --> AUTH{Sessão autenticada?}

    AUTH -- Não --> LOGIN[Redirecionar para login]
    LOGIN --> REAUTH{Autenticação realizada?}
    REAUTH -- Não --> FIMCANCEL((Fim sem agendamento))
    REAUTH -- Sim --> ESP[Paciente seleciona especialidade]
    AUTH -- Sim --> ESP

    ESP --> MED[Sistema lista médicos ativos da especialidade]
    MED --> SELMED[Paciente seleciona médico]
    SELMED --> HOR[Sistema exibe horários disponíveis]

    HOR --> DISP{Existem horários disponíveis?}
    DISP -- Não --> SUG[Sugerir próximos dias com vagas]
    SUG --> ALT{Paciente escolhe outra opção?}
    ALT -- Outro período --> HOR
    ALT -- Outro médico --> SELMED
    ALT -- Desiste --> FIMCANCEL

    DISP -- Sim --> SELHOR[Paciente seleciona data e horário]
    SELHOR --> JANELA{Horário dentro da janela permitida?}

    JANELA -- Não --> BLOQ[Bloquear seleção e informar restrição]
    BLOQ --> HOR
    JANELA -- Sim --> RES[Sistema exibe resumo da consulta]
    RES --> CONF{Paciente confirma?}

    CONF -- Não --> FIMCANCEL
    CONF -- Sim --> SESSAO{Sessão ainda válida?}
    SESSAO -- Não --> LOGIN2[Redirecionar para login]
    LOGIN2 --> REAUTH2{Autenticação realizada?}
    REAUTH2 -- Não --> FIMCANCEL
    REAUTH2 -- Sim --> RES
    SESSAO -- Sim --> LOCK[Validar disponibilidade com lock atômico]

    LOCK --> LIVRE{Slot continua disponível?}
    LIVRE -- Não --> OCUP[Exibir: Este horário acabou de ser ocupado]
    OCUP --> HOR

    LIVRE -- Sim --> PERSIST[Gravar consulta AGENDADA e marcar horário como OCUPADO]
    PERSIST --> PERSISTOK{Persistência bem-sucedida?}

    PERSISTOK -- Não --> ROLLBACK[Executar rollback total]
    ROLLBACK --> ERRO[Exibir mensagem de erro]
    ERRO --> FIMERRO((Fim com falha))

    PERSISTOK -- Sim --> AUD[Registrar auditoria CONSULTA_CRIADA]
    AUD --> FILA[Registrar evento na fila de notificações]
    FILA --> COMPROV[Exibir comprovante com código da consulta]
    COMPROV --> FIMSUCESSO((Fim com sucesso))

    subgraph ASSINC [Envio assíncrono - Sistema de Notificação]
        ENVIO[Enviar mensagem pelo canal do destinatário] --> ENVIOOK{Enviada?}
        ENVIOOK -- Sim --> NENV[Registrar notificação ENVIADA]
        ENVIOOK -- Não --> TENT{Tentativas menores que 3?}
        TENT -- Sim --> ENVIO
        TENT -- Não --> NFAL[Registrar notificação FALHOU]
        NENV --> FIMENVIO((Fim do envio))
        NFAL --> FIMENVIO
    end
    FILA -.->|não bloqueia o agendamento| ENVIO

    classDef inicioFim fill:#e8e8e8,stroke:#333,color:#111
    classDef atividade fill:#dceeff,stroke:#356b9a,color:#111
    classDef decisao fill:#fff0cc,stroke:#a87900,color:#111
    classDef excecao fill:#ffe0e0,stroke:#b33,color:#111

    class INI,FIMCANCEL,FIMERRO,FIMSUCESSO,FIMENVIO inicioFim
    class ESP,MED,SELMED,HOR,SUG,SELHOR,RES,LOCK,PERSIST,AUD,FILA,COMPROV,LOGIN,LOGIN2,ENVIO,NENV atividade
    class AUTH,REAUTH,REAUTH2,DISP,ALT,JANELA,CONF,SESSAO,LIVRE,PERSISTOK,ENVIOOK,TENT decisao
    class BLOQ,OCUP,ROLLBACK,ERRO,NFAL excecao
```

# Diagrama de Sequência

## Diagrama de Sequência 1 - Agendamento de uma consulta (DS-01)
- Objetivo: Mostrar a interação entre o Paciente, o sistema e o Sistema de Notificação durante o agendamento de uma consulta, incluindo os cenários alternativos e de exceção do fluxo F-01
- Atores: Paciente (principal) e Sistema de Notificação (secundário, não humano)
- Requisitos: RF-06 a RF-10, RF-20, RF-21 (fluxo F-01)
- Regras de negócio: RN-09, RN-10, RN-12, RN-13, RN-16, RN-20, RN-25
- Coerência: segue o Diagrama de Atividades 1 (mesmos desvios A1, A2, A3, E1, E2, E3) e usa os métodos do Diagrama de Classes (`Paciente.agendar`, `Agenda.getHorariosDisponiveis`, `Horario.estaDisponivel`, `Horario.ocupar`, `Auditoria.registrar`, `Notificacao.registrarEnvio`, `Notificacao.registrarFalha`)
- Convenções: `App Web` é a interface; `Sistema` representa a camada de aplicação, que orquestra as chamadas (por isso `listarEspecialidades`, `listarMedicos` e `consultarHorarios` não aparecem como métodos de classe); a criação de `Consulta` é mostrada como criação de objeto

```mermaid
sequenceDiagram
    autonumber
    actor Paciente
    participant App as App Web
    participant Sistema
    participant Agenda
    participant Horario
    participant Auditoria
    participant Notificacao
    participant SN as Sistema de Notificação

    Note over Paciente,Sistema: Pré-condição: paciente autenticado (RF-02)

    %% 1. Escolha de especialidade e médico
    Paciente->>App: acessa "Agendar consulta"
    App->>Sistema: listarEspecialidades()
    Sistema-->>App: especialidades ativas
    App-->>Paciente: exibe especialidades

    Paciente->>App: seleciona especialidade
    App->>Sistema: listarMedicos(especialidade)
    Sistema-->>App: médicos ativos da especialidade
    App-->>Paciente: exibe médicos

    %% 2. Consulta de horários
    Paciente->>App: seleciona médico
    App->>Sistema: consultarHorarios(medico, periodo)
    Sistema->>Agenda: getHorariosDisponiveis(intervalo)
    loop para cada slot do intervalo
        Agenda->>Horario: estaDisponivel()
        Horario-->>Agenda: true ou false
    end
    Agenda-->>Sistema: horários livres
    Sistema-->>App: horários livres

    alt nenhum horário disponível (A1)
        App-->>Paciente: informa indisponibilidade e sugere próximos dias com vagas
        Note over Paciente,App: paciente escolhe outro período ou outro médico (volta à consulta de horários) ou desiste (fim sem agendamento)
    else existem horários disponíveis
        App-->>Paciente: exibe calendário com horários livres
        Paciente->>App: seleciona data e horário

        alt horário fora da janela permitida (E3 / RN-12)
            App-->>Paciente: bloqueia a seleção, informa a restrição e volta à lista de horários
        else horário dentro da janela
            App-->>Paciente: exibe resumo da consulta
            Paciente->>App: confirma o agendamento

            %% 3. Reserva do horário
            App->>Sistema: agendar(medico, especialidade, horario)

            alt sessão expirada (E1)
                Sistema-->>App: sessão inválida
                App-->>Paciente: redireciona para login e, após autenticar, retoma no resumo da consulta
            else sessão válida
                Sistema->>Horario: estaDisponivel() com lock atômico
                Horario-->>Sistema: true ou false

                alt horário já ocupado (A2 / RN-16)
                    Sistema-->>App: HorarioIndisponivelException
                    App-->>Paciente: "Este horário acabou de ser ocupado" e recarrega os horários
                else horário livre
                    Note over Sistema,Horario: início da transação
                    Sistema->>Horario: ocupar()
                    create participant Consulta
                    Sistema->>Consulta: «create» (paciente, medico, especialidade, horario)
                    Note right of Consulta: status inicial AGENDADA (RN-13)

                    alt falha de persistência (E2)
                        Consulta-->>Sistema: erro de gravação
                        Sistema->>Sistema: rollback total (consulta descartada e horário volta a LIVRE)
                        Sistema-->>App: erro
                        App-->>Paciente: exibe mensagem de erro (nenhuma notificação enviada)
                    else persistência bem-sucedida
                        Consulta-->>Sistema: consulta AGENDADA
                        Note over Sistema,Horario: commit da transação
                        Sistema->>Auditoria: registrar(CONSULTA_CRIADA) com usuário, IP e user-agent
                        Sistema->>Notificacao: registrar evento AGENDAMENTO na fila (PENDENTE)
                        Sistema-->>App: consulta agendada com código
                        App-->>Paciente: exibe comprovante com código da consulta

                        %% 4. Envio assíncrono da notificação (RNF-12 / RN-25)
                        Note over Notificacao,SN: processamento assíncrono, não bloqueia o agendamento. Canal preferido do paciente, com fallback para EMAIL
                        loop até 3 tentativas, com backoff entre elas
                            Notificacao-)SN: enviar(destinatario, canal, mensagem)
                            break entrega bem-sucedida
                                SN-->>Notificacao: confirmação de entrega
                                Notificacao->>Notificacao: registrarEnvio() (ENVIADA)
                                SN-)Paciente: mensagem de agendamento
                            end
                            SN-->>Notificacao: falha na entrega (A3)
                            Notificacao->>Notificacao: registrarFalha() (tentativas + 1)
                        end
                        Note over Notificacao: se as 3 tentativas falharem, o status fica FALHOU e a consulta permanece AGENDADA
                    end
                end
            end
        end
    end
```

# Diagrama de Classes
- Objetivo: Apresentar as principais classes do domínio, seus atributos, métodos e relacionamentos
- Escopo: macro (classes principais), conforme a seção 8 de `especificacao-requisitos.md`
- Requisitos: todos os RF e RN; destaque para RN-10 a RN-13, RN-15, RN-16 (consulta/horário), RN-19 e RN-24 (autoria) e RNF-22 e RNF-23 (auditoria)

```mermaid
classDiagram

    class Usuario {
        <<abstract>>
        - id: Long
        - nome: String
        - email: String
        - senhaHash: String
        - telefone: String
        - status: StatusUsuario
        - canalPreferido: Canal
        - criadoEm: DateTime

        + autenticar(email, senha) boolean
        + alterarSenha(atual, nova) void
        + getPerfil() Perfil
    }

    Usuario <|-- Paciente
    Usuario <|-- Medico
    Usuario <|-- Secretario
    Usuario <|-- Administrador
    Usuario "1" --> "*" Auditoria : registra

    class Paciente {
        - cpf: String
        - dataNascimento: Date

        + agendar(medico, especialidade, horario) Consulta
        + cancelar(consulta, motivo) void
        + remarcar(consulta, novoHorario) Consulta
        + listarConsultas() List~Consulta~
    }

    Paciente "1" --> "*" Consulta : titular

    class Medico {
        - crm: String
        - ufCrm: String

        + definirDisponibilidade(regra) void
        + bloquearHorario(horario) void
        + visualizarAgenda(periodo) List~Consulta~
        + confirmarConsulta(consulta) void
        + iniciarConsulta(consulta) void
        + encerrarConsulta(consulta, status) void
    }

    Medico "1" --> "1" Agenda : possui
    Medico "1" --> "*" Consulta : atende
    Medico "*" --> "*" Especialidade : atende

    class Secretario {
        - matricula: String

        + confirmarConsulta(consulta) void
        + visualizarAgendaGeral(filtro) List~Consulta~
        + criarConsultaEmNomeDoPaciente(paciente, medico, especialidade, horario) Consulta
        + cancelarConsulta(consulta, motivo) void
        + remarcarConsulta(consulta, novoHorario) Consulta
    }

    class Administrador {
        + cadastrarMedico(dados) Medico
        + cadastrarSecretario(dados) Secretario
        + gerenciarEspecialidade(dados) Especialidade
    }

    class Especialidade {
        - id: Long
        - nome: String
        - descricao: String
        - status: StatusEspecialidade

        + ativar() void
        + desativar() void
    }

    class Agenda {
        - id: Long
        - diasAtendimento: Set~DiaSemana~
        - horaInicio: Time
        - horaFim: Time
        - duracaoSlot: Duration
        - antecedenciaMinima: Duration

        + gerarHorarios(data) List~Horario~
        + getHorariosDisponiveis(intervalo) List~Horario~
        + atualizarRegra(regra) void
    }

    Agenda "1" --> "*" Horario : gera

    class Horario {
        - id: Long
        - data: Date
        - horaInicio: Time
        - horaFim: Time
        - situacao: SituacaoHorario

        + estaDisponivel() boolean
        + bloquear(motivo) void
        + liberar() void
        + ocupar() void
    }

    note for Horario "Histórico: várias consultas ao longo do tempo, no máximo 1 ativa (RN-16)"
    Horario "1" --> "*" Consulta : ocupa

    class Consulta {
        - id: Long
        - dataHora: DateTime
        - status: StatusConsulta
        - motivoCancelamento: String
        - confirmadaEm: DateTime
        - canceladaEm: DateTime
        - criadoEm: DateTime
        - atualizadoEm: DateTime

        + confirmar(por) void
        + cancelar(por, motivo) void
        + remarcar(novoHorario) Consulta
        + iniciar() void
        + encerrar(status) void
        + podeSerAlterada() boolean
    }

    Consulta "*" --> "1" Especialidade : classifica
    Consulta "0..1" --> "0..1" Consulta : remarcadaDe
    Consulta "1" --> "*" Notificacao : notifica
    Consulta "*" --> "0..1" Usuario : confirmadaPor
    Consulta "*" --> "0..1" Usuario : canceladaPor

    class Notificacao {
        - id: Long
        - evento: TipoEvento
        - canal: Canal
        - destinatario: String
        - enviadoEm: DateTime
        - statusEntrega: StatusEntrega
        - tentativas: int

        + registrarEnvio() void
        + registrarFalha() void
    }

    class Auditoria {
        - id: Long
        - perfil: Perfil
        - acao: String
        - entidade: String
        - entidadeId: Long
        - dataHora: DateTime
        - ip: String
        - userAgent: String

        + registrar(evento) void
    }

    class Perfil {
        <<enumeration>>
        PACIENTE
        MEDICO
        SECRETARIO
        ADMINISTRADOR
    }

    class StatusUsuario {
        <<enumeration>>
        ATIVO
        INATIVO
        BLOQUEADO
    }

    class StatusEspecialidade {
        <<enumeration>>
        ATIVA
        INATIVA
    }

    class StatusConsulta {
        <<enumeration>>
        AGENDADA
        CONFIRMADA
        EM_ANDAMENTO
        REALIZADA
        CANCELADA
        REMARCADA
        NAO_REALIZADA
    }

    class SituacaoHorario {
        <<enumeration>>
        LIVRE
        BLOQUEADO
        OCUPADO
    }

    class DiaSemana {
        <<enumeration>>
        SEGUNDA
        TERCA
        QUARTA
        QUINTA
        SEXTA
        SABADO
        DOMINGO
    }

    class TipoEvento {
        <<enumeration>>
        AGENDAMENTO
        CONFIRMACAO
        CANCELAMENTO
        REMARCACAO
        LEMBRETE
    }

    class Canal {
        <<enumeration>>
        EMAIL
        SMS
        PUSH
    }

    class StatusEntrega {
        <<enumeration>>
        PENDENTE
        ENVIADA
        FALHOU
    }

```
