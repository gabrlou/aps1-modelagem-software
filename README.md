# Aps1-modelagem-software

# Sumário

1. [Diagrama de Atividades](#diagrama-de-atividades)
2. [Diagrama de Sequência](#diagrama-de-sequência)
3. [Diagrama de Classes](#diagrama-de-classes)


# Diagrama de Atividades

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