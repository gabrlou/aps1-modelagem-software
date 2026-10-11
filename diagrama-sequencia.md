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
