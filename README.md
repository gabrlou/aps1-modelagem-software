# Aps1-modelagem-software

Modelagem UML de um sistema de agendamento de consultas médicas (APS 1).

- **Trabalho de modelagem (duas versões):** [versão do Kayque](trabalho-modelagem-uml-kayque.md), com capa, descrição, diagramas, considerações finais e verificação de consistência, e [versão do Gabriel](trabalho-modelagem-uml-gabriel.md).
- **Especificação de requisitos:** [especificacao-requisitos.md](especificacao-requisitos.md).
- Os diagramas abaixo são imagens SVG (pasta [assets](assets)) geradas a partir do código PlantUML da versão do Kayque, que é a fonte desses arquivos. Para atualizá-las depois de editar um diagrama: `node scripts/renderizar-diagramas.js`.

# Sumário

1. [Diagrama de Atividades](#diagrama-de-atividades)
2. [Diagrama de Sequência](#diagrama-de-sequência)
3. [Diagrama de Classes](#diagrama-de-classes)


# Diagrama de Atividades

## Diagrama de Atividade 1 - Agendamento de uma consulta
- Objetivo: Permitir que o paciente reserve um horário para atendimento
- Atores (raias): Paciente, Sistema e Sistema de Notificação
- Requisitos: RF-02, RF-06 a RF-10, RF-20 e RF-21 (fluxo F-01); regras RN-10 a RN-13, RN-16, RN-18, RN-25 e RN-27
- Fork/join: depois de registrar o evento na fila, a exibição do comprovante e o envio assíncrono das notificações seguem em paralelo (RNF-12) e, dentro do envio, e-mail e WhatsApp também saem em paralelo, cada um com suas tentativas; tudo se junta antes do fim, e a falha do envio não altera o resultado do agendamento (RN-27)
- Fluxos alternativos e de exceção: sem vagas, horário ocupado, horário fora da janela, sessão expirada, falha de gravação e falha de notificação (rosa no diagrama)

![DA-01 — Diagrama de atividades: agendamento de consulta](assets/DA01_Agendamento.svg)

# Diagrama de Sequência

## Diagrama de Sequência 1 - Agendamento de uma consulta (DS-01)
- Objetivo: Mostrar a interação entre o Paciente, o sistema, os objetos de negócio e o Sistema de Notificação durante o agendamento, incluindo os cenários alternativos e de exceção do fluxo F-01
- Atores: Paciente (principal) e Sistema de Notificação (secundário, não humano)
- Requisitos: RF-06 a RF-10, RF-20 e RF-21 (fluxo F-01); regras RN-10, RN-11, RN-13, RN-16, RN-18, RN-25 e RN-27
- Coerência: segue o Diagrama de Atividades 1 (A1, A2, A3, E1, E2 e E3) e usa os métodos do Diagrama de Classes (`Agenda.getHorariosDisponiveis`, `Horario.estaDisponivel`, `Horario.ocupar`, `Horario.liberar`, `Auditoria.registrar`, `Notificacao.registrarEnvio`, `Notificacao.registrarFalha` e `Paciente.agendar`)
- Convenções: `Sistema` representa a camada de aplicação, que orquestra as chamadas; `Consulta` e as duas `Notificacao` (EMAIL e WHATSAPP) aparecem como objetos criados (`<<create>>`); o bloco `par` mostra, em paralelo, o comprovante e o envio por e-mail e por WhatsApp, cada canal com sua `Notificacao` (forks do Diagrama de Atividades)

![DS-01 — Diagrama de sequência: agendamento de consulta](assets/DS01_Agendamento.svg)

# Diagrama de Classes
- Objetivo: Apresentar as principais classes do domínio, seus atributos, métodos e relacionamentos
- Escopo: macro (classes principais), conforme a seção 8 de [especificacao-requisitos.md](especificacao-requisitos.md)
- Requisitos: todos os RF e RN; destaque para RN-11 a RN-13, RN-16 a RN-18 (consulta/horário), RN-21 e RN-26 (autoria) e RNF-22 e RNF-23 (auditoria)
- Notação: visibilidade + público, - privado, # protegido; losango cheio = composição; seta/linha = associação; triângulo vazio = herança

![Diagrama de classes (nível macro)](assets/DC_Classes.svg)
