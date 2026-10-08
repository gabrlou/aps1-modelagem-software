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
        - id: int
        - nome: string
        - email: string
        - senhaHash: string
        - telefone: string
        - status: StatusUsuario
        - criadoEm: date

        + autenticar(email, senha) boolean
        + alterarSenha(atual, nova) void
        + getPerfil() Perfil
    }

    usuario -- paciente
    usuario -- medico
    usuario -- secretario
    usuario "1" --> "*" auditoria

    class paciente {
        - nome: string
        - cpf: string
        - dataNascimento: string
        - canalPreferido: CanalNotificacao

        + agendar(contulta) void
        + cancelar(consulta, motivo) void
        + remarcar(conslta, novoHorario) Consulta
        + listarConsultas() List<Consulta>
    }

    paciente "1" --> "*" consulta: "agenda"
    paciente "1" --> "1" usuario: "agenda"

    class medico {
        - crm: string
        - ativo: boolean
        - nome: string
        - especialidade: string
        + definirDisponibilade
    }




    class consulta {
        
    }
    

```