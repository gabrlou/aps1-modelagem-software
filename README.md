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

O Diagrama de Sequência 1 (agendamento de uma consulta, DS-01) está em [diagrama-sequencia.md](diagrama-sequencia.md).

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
