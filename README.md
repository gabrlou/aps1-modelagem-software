# Aps1-modelagem-software

# Sumário

1. [Diagrama de Atividades](#diagrama-de-atividades)
2. [Diagrama de Sequência](#diagrama-de-sequência)
3. [Diagrama de Classes](#diagrama-de-classes)


# Diagrama de Atividades

## Diagrama de Atividade 1 - Agendamento de uma consulta
- Objetivo: Permitir que o usuário do sistema reserve um horário para atendimento
- Ator: Usuário do sistema
- Requisito: Agendar consulta

```mermaid
flowchart TD
    INI((Início)) --> AUTH{Sessão autenticada?}

    AUTH -- Não --> LOGIN[Redirecionar para login]
    LOGIN --> REAUTH{Autenticação realizada?}
    REAUTH -- Não --> FIMCANCEL((Fim sem agendamento))
    REAUTH -- Sim --> ESP[Paciente seleciona especialidade]
    AUTH -- Sim --> ESP

    ESP --> MED[ Sistema lista médicos ativos da especialidade]
    MED --> SELMED[Paciente seleciona médico]
    SELMED --> HOR[ Sistema exibe horários disponíveis]

    HOR --> DISP{Existem horários disponíveis?}
    DISP -- Não --> SUG[ Sugerir próximos dias com vagas]
    SUG --> HOR

    DISP -- Sim --> SELHOR[Paciente seleciona data e horário]
    SELHOR --> JANELA{Horário dentro da janela permitida?}

    JANELA -- Não --> BLOQ[Bloquear seleção e informar restrição]
    BLOQ --> HOR
    JANELA -- Sim --> RES[ Sistema exibe resumo da consulta]
    RES --> CONF{Paciente confirma?}

    CONF -- Não --> FIMCANCEL
    CONF -- Sim --> SESSAO{Sessão ainda válida?}
    SESSAO -- Não --> LOGIN
    SESSAO -- Sim --> LOCK[Validar disponibilidade com lock atômico]

    LOCK --> LIVRE{Slot continua disponível?}
    LIVRE -- Não --> OCUP[Exibir: Este horário acabou de ser ocupado]
    OCUP --> HOR

    LIVRE -- Sim --> PERSIST[Gravar consulta com status AGENDADA]
    PERSIST --> PERSISTOK{Persistência bem-sucedida?}

    PERSISTOK -- Não --> ROLLBACK[Executar rollback total]
    ROLLBACK --> ERRO[Exibir mensagem de erro]
    ERRO --> FIMERRO((Fim com falha))

    PERSISTOK -- Sim --> AUD[Registrar auditoria CONSULTA_CRIADA]
    AUD --> FILA[Registrar evento na fila de notificações]
    FILA --> ENVIO{Notificação enviada?}

    ENVIO -- Sim --> COMPROV[Exibir comprovante com código da consulta]
    ENVIO -- Não --> RETRY[Manter agendamento e programar retry da notificação]
    RETRY --> COMPROV

    COMPROV --> FIMSUCESSO((Fim com sucesso))

    classDef inicioFim fill:#e8e8e8,stroke:#333,color:#111
    classDef atividade fill:#dceeff,stroke:#356b9a,color:#111
    classDef decisao fill:#fff0cc,stroke:#a87900,color:#111
    classDef excecao fill:#ffe0e0,stroke:#b33,color:#111

    class INI,FIMCANCEL,FIMERRO,FIMSUCESSO inicioFim
    class ESP,MED,SELMED,HOR,SUG,SELHOR,RES,BLOQ,LOCK,OCUP,PERSIST,ROLLBACK,ERRO,AUD,FILA,RETRY,COMPROV,LOGIN atividade
    class AUTH,REAUTH,DISP,JANELA,CONF,SESSAO,LIVRE,PERSISTOK,ENVIO decisao
```

# Diagrama de Sequência

# Diagrama de Classes

```mermaid
classDiagram

    class usuario {
        <<abstract>>
        - id: int
        - nome: string
        - email: string
        - senhaHash: string
        - telefone: string
        - status: StatusUsuario
        - criadoEm: datetime

        + autenticar(email, senha) boolean
        + alterarSenha(atual, nova) void
        + getPerfil() Perfil
    }

    usuario <|-- paciente
    usuario <|-- medico
    usuario <|-- secretario
    usuario "1" --> "*" auditoria : registra

    class paciente {
        - cpf: string
        - dataNascimento: date
        - canalPreferido: Canal

        + agendar(consulta) void
        + cancelar(consulta, motivo) void
        + remarcar(consulta, novoHorario) Consulta
        + listarConsultas() List~Consulta~
    }

    paciente "1" --> "*" consulta : titular

    class medico {
        - crm: string
        - ufCrm: string
        - ativo: boolean

        + definirDisponibilidade(regra) void
        + bloquearHorario(horario) void
        + visualizarAgenda(periodo) List~Consulta~
        + iniciarConsulta(consulta) void
        + encerrarConsulta(consulta, status) void
    }

    medico "1" --> "1" agenda : possui
    medico "1" --> "*" consulta : atende
    medico "*" --> "*" especialidade : atende

    class secretario {
        - matricula: string

        + confirmarConsulta(consulta) void
        + visualizarAgendaGeral(filtro) List~Consulta~
        + criarConsultaEmNomeDoPaciente(dados) Consulta
    }

    secretario "1" --> "*" consulta : confirma

    class especialidade {
        - id: int
        - nome: string
        - descricao: string
        - status: Status

        + ativar() void
        + desativar() void
    }

    class agenda {
        - id: int
        - diasAtendimento: Set~DiaSemana~
        - horaInicio: time
        - horaFim: time
        - duracaoSlot: duration
        - antecedenciaMinima: duration

        + gerarHorarios(data) List~Horario~
        + getHorariosDisponiveis(intervalo) List~Horario~
        + atualizarRegra(regra) void
    }

    agenda "1" --> "*" horario : gera

    class horario {
        - id: int
        - data: date
        - horaInicio: time
        - horaFim: time
        - situacao: SituacaoHorario

        + estaDisponivel() boolean
        + bloquear(motivo) void
        + liberar() void
        + ocupar() void
    }

    horario "1" --> "0..1" consulta : ocupa

    class consulta {
        - id: int
        - dataHora: datetime
        - status: StatusConsulta
        - motivoCancelamento: string
        - criadoEm: datetime
        - atualizadoEm: datetime

        + confirmar(por) void
        + cancelar(por, motivo) void
        + remarcar(novoHorario) Consulta
        + iniciar() void
        + encerrar(status) void
        + podeSerAlterada() boolean
    }

    consulta "*" --> "1" paciente : pertence
    consulta "*" --> "1" medico : pertence
    consulta "*" --> "1" especialidade : classifica
    consulta "0..1" --> "1" consulta : remarcadaDe
    consulta "1" --> "*" notificacao : notifica

    class notificacao {
        - id: int
        - evento: TipoEvento
        - canal: Canal
        - destinatario: string
        - enviadoEm: datetime
        - statusEntrega: StatusEntrega
        - tentativas: int

        + registrarEnvio() void
        + registrarFalha() void
    }

    class auditoria {
        - id: int
        - usuario: Usuario
        - acao: string
        - entidade: string
        - entidadeId: int
        - dataHora: datetime
        - ip: string

        + registrar(evento) void
    }

    class Perfil {
        <<enumeration>>
        PACIENTE
        MEDICO
        SECRETARIO
    }

    class StatusUsuario {
        <<enumeration>>
        ATIVO
        INATIVO
        BLOQUEADO
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
        WHATSAPP
    }

    class StatusEntrega {
        <<enumeration>>
        PENDENTE
        ENVIADA
        FALHOU
    }

```