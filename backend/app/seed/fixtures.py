from datetime import datetime, timedelta, timezone

_BASE = datetime(2026, 2, 17, tzinfo=timezone.utc)

_MODEL = "facebook/bart-large-mnli"


def _email(i: int, subject: str, body: str, sender: str) -> dict:
    return {
        "subject": subject,
        "body_text": body,
        "sender": sender,
        "received_at": _BASE + timedelta(days=i % 30, hours=9 + (i % 8)),
    }


def _prod(i: int, subject: str, body: str, sender: str, confidence: float, ms: int, suggestion: str) -> dict:
    return {
        "email": _email(i, subject, body, sender),
        "classification": {
            "label": "Produtivo",
            "confidence": confidence,
            "model_used": _MODEL,
            "inference_ms": ms,
            "suggestion": suggestion,
        },
    }


def _improd(i: int, subject: str, body: str, sender: str, confidence: float, ms: int, suggestion: str) -> dict:
    return {
        "email": _email(i, subject, body, sender),
        "classification": {
            "label": "Improdutivo",
            "confidence": confidence,
            "model_used": _MODEL,
            "inference_ms": ms,
            "suggestion": suggestion,
        },
    }


SEED_FIXTURES = [
    # --- Produtivo (24) ---
    _prod(
        0,
        "Proposta de parceria estratégica — integração de plataformas financeiras",
        (
            "Prezado time da AutoU,\n\n"
            "Representamos a FinanciaBR, uma consultoria especializada em soluções digitais para o setor financeiro. "
            "Gostaríamos de explorar uma parceria estratégica para integrar nossas plataformas de análise de crédito "
            "com o sistema de classificação de emails da AutoU. Acreditamos que a sinergia entre as soluções pode "
            "gerar valor significativo para nossos clientes em comum.\n\n"
            "Podemos agendar uma reunião para apresentar nossa proposta formal?"
        ),
        "carlos.mendes@financiabr.com.br",
        0.93,
        1250,
        (
            "Prezado Carlos,\n\n"
            "Recebemos sua proposta de parceria entre a FinanciaBR e nossa plataforma. "
            "A ideia de integrar as soluções de análise de crédito é bastante interessante "
            "e está alinhada com nossa estratégia atual.\n\n"
            "Vamos encaminhar sua proposta ao comitê de parcerias e retornaremos até o "
            "final da próxima semana com horários para a reunião.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _prod(
        1,
        "Solicitação de documentação para auditoria financeira Q1 2026",
        (
            "Olá,\n\n"
            "Conforme combinado com o departamento jurídico, precisamos receber até sexta-feira (20/02) "
            "os seguintes documentos para a auditoria do primeiro trimestre: balancetes mensais de outubro a dezembro, "
            "relatórios de conciliação bancaria e extrato consolidado das contas correntes.\n\n"
            "Qualquer dúvida estou a disposição. Aguardo retorno urgente."
        ),
        "ana.souza@consultoriaabc.com.br",
        0.89,
        1480,
        (
            "Prezada Ana,\n\n"
            "Recebemos sua solicitação referente à documentação para a auditoria do Q1 2026. "
            "Já acionamos a controladoria para reunir os balancetes mensais, relatórios de "
            "conciliação bancária e extratos consolidados.\n\n"
            "Faremos o envio completo até sexta-feira (20/02) conforme solicitado. "
            "Qualquer dúvida, estamos à disposição.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _prod(
        2,
        "Negociação de contrato de serviços de TI — renovação anual",
        (
            "Bom dia,\n\n"
            "Nosso contrato de suporte e manutenção de sistemas vence em 15 de março. "
            "Gostaríamos de iniciar as negociações para a renovação anual, incluindo a expansão do escopo "
            "para cobrir os novos módulos de inteligência artificial implementados no último semestre.\n\n"
            "Poderia nos enviar uma proposta atualizada com os novos valores e condições?"
        ),
        "roberto.lima@techsolutionsbr.com.br",
        0.87,
        1120,
        (
            "Prezado Roberto,\n\n"
            "Confirmamos o recebimento da sua solicitação de renovação do contrato de "
            "suporte e manutenção com vencimento em 15/03. Já estamos preparando uma "
            "proposta atualizada incluindo a expansão de escopo para os módulos de IA.\n\n"
            "Enviaremos os novos valores e condições até o final desta semana para que "
            "possamos concluir a negociação a tempo.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _prod(
        3,
        "Pedido de orçamento — desenvolvimento de módulo de relatórios customizados",
        (
            "Prezados,\n\n"
            "Precisamos desenvolver um módulo de relatórios financeiros customizados para atender "
            "as exigências regulatórias do Banco Central. O módulo deve gerar exportações em PDF e CSV "
            "com formatação padrão COSIF.\n\n"
            "Solicito um orçamento detalhado com prazo de entrega e equipe envolvida."
        ),
        "patricia.oliveira@bancoexemplo.com.br",
        0.91,
        1380,
        (
            "Prezada Patrícia,\n\n"
            "Recebemos seu pedido de orçamento para o módulo de relatórios financeiros "
            "customizados com formatação COSIF. Nossa equipe técnica já está dimensionando "
            "o escopo, incluindo as exportações em PDF e CSV.\n\n"
            "Enviaremos o orçamento detalhado com cronograma e composição da equipe "
            "em até 5 dias úteis.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _prod(
        4,
        "Reuniao de revisao orçamentária — planejamento 2026/2027",
        (
            "Olá equipe,\n\n"
            "Preciso agendar uma reunião para revisar o orçamento aprovado para 2026 e discutir "
            "as premissas para o planejamento do próximo exercício. Temos algumas variações relevantes "
            "no cenário macroeconômico que impactam as projeções de receita.\n\n"
            "Por favor, confirmem disponibilidade para a semana de 02/03."
        ),
        "fernando.costa@gestãofinanceira.com.br",
        0.85,
        980,
        (
            "Prezado Fernando,\n\n"
            "Confirmamos o interesse na reunião de revisão orçamentária para o "
            "planejamento 2026/2027. Estamos verificando a disponibilidade da equipe "
            "para a semana de 02/03 e enviaremos um convite com as opções de horário.\n\n"
            "Já estamos consolidando os dados macroeconômicos atualizados para "
            "embasar a discussão sobre as projeções de receita.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _prod(
        5,
        "Consulta juridica sobre compliance tributário — IFRS 9",
        (
            "Prezado Dr. Almeida,\n\n"
            "Necessitamos de uma análise juridica sobre as implicações tributárias da adoção do IFRS 9 "
            "na nossa carteira de crédito. Especificamente, precisamos entender o tratamento fiscal "
            "das provisões para perdas esperadas (ECL) sob a nova norma contábil.\n\n"
            "Poderia nos fornecer um parecer até o dia 28 deste mes?"
        ),
        "mariana.ferreira@jurídicofin.com.br",
        0.88,
        1560,
        (
            "Prezada Mariana,\n\n"
            "Recebemos sua consulta sobre as implicações tributárias da adoção do IFRS 9, "
            "especificamente o tratamento fiscal das provisões ECL. Nosso departamento "
            "jurídico já está analisando a questão junto à área de compliance tributário.\n\n"
            "O parecer será entregue até o dia 28 conforme solicitado. Caso surjam "
            "dúvidas durante a análise, entraremos em contato.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _prod(
        6,
        "Solicitação de suporte técnico — falha crítica no processamento de pagamentos",
        (
            "Urgente,\n\n"
            "Estamos enfrentando uma falha crítica no módulo de processamento de pagamentos desde as 14h de hoje. "
            "Apróximadamente 230 transações foram bloqueadas e os clientes estão sendo impactados.\n\n"
            "Precisamos de um engenheiro disponível imediatamente para diagnóstico e resolução. "
            "Nossa janela de SLA critico está expirando em 2 horas."
        ),
        "joao.santos@pagamentosdigitais.com.br",
        0.94,
        2100,
        (
            "Prezado João,\n\n"
            "Recebemos seu alerta sobre a falha crítica no processamento de pagamentos. "
            "Já escalamos o caso para o time de engenharia com prioridade máxima e um "
            "engenheiro sênior foi designado para diagnóstico imediato.\n\n"
            "Acompanharemos a resolução das 230 transações bloqueadas dentro da janela "
            "de SLA. Enviaremos atualizações a cada 30 minutos.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _prod(
        7,
        "Proposta de consultoria em gestão de riscos financeiros",
        (
            "Prezados executivos da AutoU,\n\n"
            "A RiskPro Consultoria elaborou uma proposta personalizada de gestão de riscos financeiros "
            "baseada no perfil da sua empresa. Nossa abordagem cobre risco de crédito, liquidez e mercado "
            "com framework alinhado ao Basileia III.\n\n"
            "Solicito uma reunião para apresentação detalhada da proposta. Disponibilizo horários "
            "na próxima semana conforme sua conveniencia."
        ),
        "beatriz.alves@riskproconsultoria.com.br",
        0.86,
        1340,
        (
            "Prezada Beatriz,\n\n"
            "Agradecemos o envio da proposta de gestão de riscos financeiros da RiskPro "
            "com framework alinhado ao Basileia III. O material será avaliado pelo nosso "
            "comitê de riscos na próxima reunião ordinária.\n\n"
            "Entraremos em contato para agendar a apresentação detalhada conforme a "
            "disponibilidade da diretoria.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _prod(
        8,
        "Solicitação de aprovação — investimento em infraestrutura de dados",
        (
            "Prezada diretoria,\n\n"
            "Conforme apresentado no board do mês passado, solicito aprovação formal para o investimento "
            "de R$ 480.000 em infraestrutura de dados (cloud migration + data warehouse).\n\n"
            "O projeto tem ROI projetado de 18 meses e é pré-requisito para as iniciativas de IA planejadas "
            "para o segundo semestre. Aguardo aprovação com urgencia para não impactar o cronograma."
        ),
        "lucas.martins@autou.com.br",
        0.92,
        1670,
        (
            "Prezado Lucas,\n\n"
            "Recebemos sua solicitação de aprovação do investimento de R$ 480.000 em "
            "infraestrutura de dados. O pedido será pautado na próxima reunião da "
            "diretoria com prioridade, dado o impacto no cronograma de IA.\n\n"
            "Por favor, mantenha o business case atualizado para apresentação ao board. "
            "Retornaremos com o parecer em breve.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _prod(
        9,
        "Contrato de fornecimento — licencas de software financeiro",
        (
            "Boa tarde,\n\n"
            "Seguem em anexo o contrato de fornecimento das 50 licencas do SoftFin Pro para análise e assinatura. "
            "O contrato contempla suporte 24/7, atualizações automáticas e treinamento inicial para a equipe.\n\n"
            "Precisamos da assinatura até quinta-feira para garantir a ativação no inicio do próximo mês. "
            "Qualquer ajuste contratual deve ser comunicado até amanha."
        ),
        "diana.rocha@softfinbrasil.com.br",
        0.90,
        1190,
        (
            "Prezada Diana,\n\n"
            "Recebemos o contrato de fornecimento das 50 licenças do SoftFin Pro. "
            "O documento já foi encaminhado ao departamento jurídico para revisão "
            "das cláusulas contratuais.\n\n"
            "Retornaremos com eventuais ajustes ou a assinatura até quinta-feira "
            "para garantir a ativação no início do próximo mês.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _prod(
        10,
        "Pedido de esclarecimento — cláusulas de inadimplência no contrato de crédito",
        (
            "Prezado departamento jurídico,\n\n"
            "Ao revisar o contrato de abertura de crédito n. 2025-CR-4872, identificamos ambiguidade "
            "na cláusula 8.3 referente ao gatilho de inadimplência em casos de reestruturação societária.\n\n"
            "Solicitamos um esclarecimento formal por escrito e, sé necessário, um aditivo contratual "
            "para clarificar os termos antes da renovação do limite em março."
        ),
        "henrique.barros@créditocorporativo.com.br",
        0.83,
        1430,
        (
            "Prezado Henrique,\n\n"
            "Recebemos seu pedido de esclarecimento sobre a cláusula 8.3 do contrato "
            "de crédito n. 2025-CR-4872. Nossa equipe jurídica já está revisando a "
            "redação referente ao gatilho de inadimplência.\n\n"
            "Enviaremos o esclarecimento formal por escrito e, se necessário, "
            "proporemos um aditivo contratual antes da renovação em março.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _prod(
        11,
        "Proposta de fusão — aquisição da carteira de clientes PJ",
        (
            "Prezada diretoria,\n\n"
            "A Investimentos Nacionais SA tem interesse em adquirir a carteira de clientes PJ da AutoU "
            "referente ao segmento de medio porte. Propomos um processo de due diligence de 60 dias "
            "com avaliação independente.\n\n"
            "Gostaríamos de agendar uma reunião de NDA para iniciar as tratativas formais."
        ),
        "sergio.campos@investnacionais.com.br",
        0.88,
        2050,
        (
            "Prezado Sérgio,\n\n"
            "Agradecemos o interesse da Investimentos Nacionais SA na aquisição da "
            "carteira de clientes PJ. A proposta será apresentada à diretoria para "
            "avaliação estratégica preliminar.\n\n"
            "Caso haja interesse em prosseguir, agendaremos a reunião de NDA para "
            "formalizar o início das tratativas. Retornaremos em até 10 dias úteis.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _prod(
        12,
        "Reembolso de despesas — viagem corporativa São Paulo/Recife",
        (
            "Olá RH,\n\n"
            "Solicito reembolso das despesas da viagem corporativa realizada entre 10 e 12 de fevereiro "
            "para reunioes com clientes em Recife. Total: R$ 3.247,80 conforme planilha e notas fiscais em anexo.\n\n"
            "Por favor, confirme o processamento e a data prevista de crédito na conta."
        ),
        "claudia.nunes@autou.com.br",
        0.81,
        890,
        (
            "Prezada Cláudia,\n\n"
            "Recebemos sua solicitação de reembolso de R$ 3.247,80 referente à viagem "
            "corporativa São Paulo/Recife (10 a 12/02). A planilha e as notas fiscais "
            "em anexo serão analisadas pelo departamento financeiro.\n\n"
            "O crédito será processado no próximo ciclo de pagamentos e informaremos "
            "a data prevista assim que a análise for concluída.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _prod(
        13,
        "Solicitação de credencial de acesso — sistema de compliance",
        (
            "Prezado time de TI,\n\n"
            "Inicio na empresa na segunda-feira (23/02) no cargo de Analista de Compliance. "
            "Preciso que sejam criadas minhas credenciais de acesso aos sistemas: ERP Financeiro, "
            "plataforma de compliance regulatorio e repositório de documentos.\n\n"
            "Favor confirmar que os acessos estarão prontos até sexta para que eu possa comecar sem interrupções."
        ),
        "thiago.mendonca@autou.com.br",
        0.79,
        950,
        (
            "Prezado Thiago,\n\n"
            "Bem-vindo à equipe! Recebemos sua solicitação de credenciais de acesso ao "
            "ERP Financeiro, plataforma de compliance regulatório e repositório de "
            "documentos.\n\n"
            "As credenciais serão criadas e estarão prontas até sexta-feira. Você "
            "receberá as instruções de primeiro acesso por e-mail.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _prod(
        14,
        "Questionario de due diligence — fornecedor de serviços de pagamento",
        (
            "Prezados,\n\n"
            "Como parte do processo de homologação de novos fornecedores, encaminhamos o questionário "
            "de due diligence ESG e financeiro que deve ser preenchido e devolvido em até 10 dias úteis.\n\n"
            "Os documentos solicitados incluem: demonstrações financeiras dos últimos 3 anos, "
            "política anticorrupção, certidões de regularidade fiscal e trabalhista."
        ),
        "rafael.xavier@compliancefin.com.br",
        0.86,
        1720,
        (
            "Prezado Rafael,\n\n"
            "Recebemos o questionário de due diligence ESG e financeiro para homologação. "
            "Já estamos reunindo a documentação solicitada, incluindo demonstrações "
            "financeiras, política anticorrupção e certidões.\n\n"
            "O preenchimento completo será devolvido dentro do prazo de 10 dias úteis. "
            "Caso haja dúvidas sobre algum item, entraremos em contato.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _prod(
        15,
        "Revisao de limites de crédito — proposta de elevação Q1 2026",
        (
            "Bom dia,\n\n"
            "Baseado no histórico de pagamentos e no crescimento do faturamento nos últimos 12 meses, "
            "solicitamos formalmente a revisao e elevação do limite de crédito da conta corrente "
            "de R$ 500.000 para R$ 1.200.000.\n\n"
            "Encaminhamos em anexo o balancete atualizado, DRE e declaração de faturamento para análise."
        ),
        "vanessa.teixeira@grupomercantilbr.com.br",
        0.90,
        1580,
        (
            "Prezada Vanessa,\n\n"
            "Recebemos sua solicitação de elevação do limite de crédito de R$ 500.000 "
            "para R$ 1.200.000. Os documentos enviados (balancete, DRE e declaração de "
            "faturamento) foram encaminhados à área de análise de crédito.\n\n"
            "O parecer sobre a revisão do limite será emitido em até 7 dias úteis. "
            "Entraremos em contato com o resultado.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _prod(
        16,
        "Denuncia de irregularidade — suspeita de fraude interna no setor de pagamentos",
        (
            "Prezado canal de compliance,\n\n"
            "Por meio deste canal, reporto uma situação que considero irregular no departamento de pagamentos. "
            "Nos últimos 30 dias, identifiquei transferências recorrentes para fornecedores não cadastrados "
            "no sistema ERP, sem documentação de suporte.\n\n"
            "Solicito investigação confidencial. Estou disponível para fornecer evidências adicionais."
        ),
        "anonimo@autou.com.br",
        0.84,
        2200,
        (
            "Prezado(a),\n\n"
            "Agradecemos sua denúncia sobre as irregularidades identificadas no setor "
            "de pagamentos. Sua comunicação será tratada com total confidencialidade "
            "conforme nossa política de compliance.\n\n"
            "A área de auditoria interna já foi acionada para investigar as "
            "transferências a fornecedores não cadastrados. Caso seja necessário, "
            "entraremos em contato de forma sigilosa.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _prod(
        17,
        "Proposta de treinamento corporativo — certificação CPA-20",
        (
            "Prezados,\n\n"
            "A Escola de Financas BR oferece um programa corporativo de preparação para a certificação CPA-20 "
            "da ANBIMA. O programa inclui 80 horas de curso online, simulados ilimitados e material impresso.\n\n"
            "Temos turma iniciando em março com desconto de 15% para grupos acima de 10 colaboradores. "
            "Podemos agendar uma apresentação para o RH está semana?"
        ),
        "marços.vieira@escolafinancasbr.com.br",
        0.82,
        1050,
        (
            "Prezado Marcos,\n\n"
            "Agradecemos o envio da proposta de treinamento corporativo para a "
            "certificação CPA-20 da ANBIMA. O programa de 80 horas com desconto para "
            "grupos é de interesse do nosso departamento de RH.\n\n"
            "Encaminharemos a proposta à área de desenvolvimento de pessoas e "
            "retornaremos sobre o agendamento da apresentação em breve.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _prod(
        18,
        "Alerta de vencimento — apólice de seguro patrimonial",
        (
            "Prezado cliente,\n\n"
            "Sua apólice de seguro patrimonial (n. SP-2024-88741) vence em 28 dias. "
            "Para garantir a continuidade da cobertura sem interrupção, precisamos iniciar o processo "
            "de renovação com a coleta de documentos atualizados do imobilizado.\n\n"
            "Por favor, agende uma visita com nosso corretor para levantamento e cotação atualizada."
        ),
        "juliana.melo@seguradoraexemplo.com.br",
        0.80,
        1100,
        (
            "Prezada Juliana,\n\n"
            "Recebemos o alerta de vencimento da apólice de seguro patrimonial "
            "n. SP-2024-88741. Já estamos providenciando a documentação atualizada "
            "do imobilizado para o processo de renovação.\n\n"
            "Entraremos em contato para agendar a visita do corretor e dar andamento "
            "à cotação dentro do prazo informado.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _prod(
        19,
        "Solicitação de relatório — indicadores de performance financeira para board",
        (
            "Olá equipe de controladoria,\n\n"
            "Preciso do pacote de indicadores financeiros para apresentação ao board na próxima quarta-feira (25/02). "
            "O pacote deve incluir: P&L consolidado, EBITDA ajustado, variação de caixa, "
            "índice de liquidez corrente e projeção revisada para o semestre.\n\n"
            "O prazo para envio e segunda-feira até as 18h."
        ),
        "gustavo.pires@autou.com.br",
        0.93,
        1300,
        (
            "Prezado Gustavo,\n\n"
            "Recebemos sua solicitação do pacote de indicadores financeiros para o "
            "board de 25/02. A equipe de controladoria já está consolidando o P&L, "
            "EBITDA ajustado, variação de caixa, liquidez corrente e projeções.\n\n"
            "O material será entregue até segunda-feira às 18h conforme solicitado. "
            "Caso precise de algum corte adicional, nos avise.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _prod(
        20,
        "Pedido de parecer — viabilidade financeira de novo produto de investimento",
        (
            "Prezados analistas,\n\n"
            "Estamos avaliando o lançamento de um CDB com liquidez diaria e rentabilidade atrelada ao CDI + 1,5%. "
            "Solicito um parecer técnico sobre a viabilidade financeira, impacto no funding e adequação "
            "ao perfil de risco da instituição.\n\n"
            "O parecer deve estar pronto para a reunião do ALCO na próxima semana."
        ),
        "renata.fontes@bancoexemplo.com.br",
        0.87,
        1640,
        (
            "Prezada Renata,\n\n"
            "Recebemos sua solicitação de parecer técnico sobre o CDB com liquidez "
            "diária e rentabilidade CDI + 1,5%. A equipe de análise já está avaliando "
            "a viabilidade financeira, o impacto no funding e a adequação ao perfil de risco.\n\n"
            "O parecer será concluído a tempo da reunião do ALCO na próxima semana.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _prod(
        21,
        "Proposta de terceirização — processamento de folha de pagamento",
        (
            "Prezada diretoria de RH,\n\n"
            "A FolhaPro Serviços apresenta uma proposta de terceirização completa do processamento "
            "de folha de pagamento, incluindo cálculo de tributos, eSocial, FGTS e holerites digitais.\n\n"
            "Estimamos uma redução de 35% nos custos operacionais em relação ao modelo atual. "
            "Solicito autorização para avancemos para a etapa de proposta tecnica detalhada."
        ),
        "anderson.ramos@folhapro.com.br",
        0.85,
        1220,
        (
            "Prezado Anderson,\n\n"
            "Agradecemos o envio da proposta de terceirização da folha de pagamento "
            "pela FolhaPro Serviços. A estimativa de redução de 35% nos custos "
            "operacionais é relevante e será analisada pela diretoria de RH e financeiro.\n\n"
            "Retornaremos sobre a autorização para avançar à etapa de proposta técnica "
            "detalhada após a análise interna.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _prod(
        22,
        "Notificação de inadimplência — boleto vencido referente a serviços de TI",
        (
            "Prezado departamento financeiro,\n\n"
            "Informamos que o boleto no valor de R$ 18.750,00 referente aos serviços de TI prestados "
            "em janeiro venceu em 10/02 e ainda consta em aberto em nosso sistema.\n\n"
            "Solicitamos a regularização até amanhã (18/02) para evitar a incidência de multa e juros "
            "contratuais de 2% ao mês. Caso o pagamento já tenha sido efetuado, favor desconsiderar."
        ),
        "cobranca@techsolutionsbr.com.br",
        0.88,
        1410,
        (
            "Prezados,\n\n"
            "Recebemos a notificação sobre o boleto de R$ 18.750,00 referente aos "
            "serviços de TI de janeiro, vencido em 10/02. Já acionamos o departamento "
            "financeiro para verificar o status do pagamento.\n\n"
            "Caso o pagamento já tenha sido efetuado, enviaremos o comprovante. "
            "Do contrário, a quitação será processada com urgência até amanhã (18/02).\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _prod(
        23,
        "Candidatura espontanea — Analista Senior de Riscos e Credito",
        (
            "Prezada equipe de recrutamento,\n\n"
            "Tenho 8 anos de experiência em análise de riscos de crédito no segmento bancário corporativo "
            "e estou em busca de novas oportunidades. Meu background inclui modelagem de PD/LGD/EAD, "
            "IFRS 9, stress testing e Basileia III.\n\n"
            "Gostaria de apresentar meu perfil para possíveis oportunidades na AutoU. "
            "CV em anexo para apreciação."
        ),
        "isabella.correia@gmail.com",
        0.76,
        870,
        (
            "Prezada Isabella,\n\n"
            "Agradecemos seu interesse em integrar a equipe da AutoU. Seu currículo "
            "para a posição de Analista Sênior de Riscos e Crédito foi encaminhado ao "
            "banco de talentos e será avaliado pela equipe de recrutamento.\n\n"
            "Caso surja uma oportunidade compatível com seu perfil, entraremos em "
            "contato. Desejamos sucesso em sua busca profissional.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    # --- Improdutivo (16) ---
    _improd(
        24,
        "Newsletter Semanal — Mercado Financeiro Brasileiro | Edição 47",
        (
            "Mercado Financeiro BR — Sua fonte semanal de informações\n\n"
            "DESTAQUES DA SEMANA:\n"
            "- Selic permanece em 13,75% após reunião do Copom\n"
            "- IPCA acumula 4,8% nos últimos 12 meses\n"
            "- Ibovespa fecha semana com alta de 2,3%\n"
            "- Dolar recua frente ao real após dados de inflação nos EUA\n\n"
            "Leia a análise completa no portal. Para cancelar o recebimento, clique em 'descadastrar'."
        ),
        "noticias@mercadofinanceirobr.com.br",
        0.91,
        1850,
        (
            "Prezados,\n\n"
            "Agradecemos o envio da newsletter semanal. As informações sobre as "
            "decisões do Copom e o cenário macroeconômico são úteis para nossas "
            "análises internas.\n\n"
            "Continuem enviando as próximas edições.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _improd(
        25,
        "Seu extrato bancário de janeiro está disponível",
        (
            "Banco Exemplo — Notificação Automática\n\n"
            "Seu extrato do mês de janeiro de 2026 já está disponível para consulta no aplicativo "
            "ou no internet banking.\n\n"
            "Acesse: app.bancoexemplo.com.br/extrato\n\n"
            "Esta é uma mensagem automática. Não responda este email."
        ),
        "noreply@bancoexemplo.com.br",
        0.89,
        1120,
        (
            "Prezados,\n\n"
            "Confirmamos o recebimento da notificação sobre a disponibilidade do "
            "extrato bancário de janeiro. Já acessaremos o documento pelo internet "
            "banking para conferência.\n\n"
            "Obrigado pela notificação.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _improd(
        26,
        "Alerta de segurança — novo acesso detectado na sua conta",
        (
            "Sistema de Seguranca — Banco Exemplo\n\n"
            "Detectamos um novo acesso a sua conta em 17/02/2026 as 10:34 de São Paulo, SP.\n\n"
            "Dispositivo: Chrome / Windows 11\n"
            "IP: 189.xxx.xxx.xxx\n\n"
            "Se foi você, nenhuma ação é necessária. Se não reconhece este acesso, "
            "bloqueie sua conta imediatamente pelo app. Esta é uma mensagem automática."
        ),
        "segurança@bancoexemplo.com.br",
        0.88,
        960,
        (
            "Prezados,\n\n"
            "Agradecemos o alerta de segurança referente ao acesso detectado em "
            "17/02/2026. Confirmamos que o acesso foi realizado por nossa equipe a "
            "partir de São Paulo, SP, sendo portanto legítimo.\n\n"
            "Obrigado pelo monitoramento.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _improd(
        27,
        "Confirmação de transação — TED realizada com sucesso",
        (
            "Banco Exemplo — Comprovante de Transacao\n\n"
            "TED realizada com sucesso em 18/02/2026.\n\n"
            "Valor: R$ 5.000,00\n"
            "Destinatário: Fornecedor XYZ Ltda\n"
            "Banco destino: 001 - Banco do Brasil\n"
            "Agencia/Conta: 1234-5 / 678901-2\n\n"
            "Guarde este comprovante para seus registros. Não responda este email."
        ),
        "transações@bancoexemplo.com.br",
        0.92,
        870,
        (
            "Prezados,\n\n"
            "Confirmamos o recebimento do comprovante de TED no valor de R$ 5.000,00 "
            "para Fornecedor XYZ Ltda realizada em 18/02/2026. O comprovante foi "
            "arquivado para fins de conciliação bancária.\n\n"
            "Obrigado.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _improd(
        28,
        "Convite para webinar — Tendências em Fintechs para 2026",
        (
            "FinTechBrasil Summit — Convite Especial\n\n"
            "Voce está convidado para o webinar gratuito 'Tendências em Fintechs para 2026'.\n\n"
            "Data: 25 de fevereiro de 2026, 19h (horário de Brasília)\n"
            "Palestrantes: 4 CEOs de fintechs brasileiras de destaque\n"
            "Temas: Open Finance, IA no crédito, Banking as a Service\n\n"
            "Vagas limitadas. Inscreva-se agora: fintechbr.com.br/summit2026\n\n"
            "Para descadastrar, clique aqui."
        ),
        "eventos@fintechbrasil.com.br",
        0.85,
        1430,
        (
            "Prezados,\n\n"
            "Agradecemos o convite para o webinar 'Tendências em Fintechs para 2026'. "
            "Os temas sobre Open Finance e IA no crédito são de interesse da nossa "
            "equipe.\n\n"
            "Verificaremos a disponibilidade interna e, havendo interesse, faremos "
            "a inscrição pelo link informado.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _improd(
        29,
        "Promocao exclusiva — CDB com 115% do CDI para novos investidores",
        (
            "Banco Investimentos BR — Oferta Especial\n\n"
            "Aproveite nossa promoção de fevereiro: CDB com rentabilidade de 115% do CDI "
            "para aplicações acima de R$ 10.000 com vencimento em 12 meses.\n\n"
            "Oferta válida até 28/02/2026. Aplique agora pelo app e garanta a melhor taxa do mercado.\n\n"
            "Simulação: R$ 50.000 aplicados rendem apróximadamente R$ 6.950 em 12 meses.\n\n"
            "Para não receber mais ofertas, atualize suas preferências de comunicação."
        ),
        "promocoes@bancoinvestimentosbr.com.br",
        0.87,
        1280,
        (
            "Prezados,\n\n"
            "Agradecemos o envio da oferta do CDB com 115% do CDI. Tomaremos nota "
            "das condições para eventual avaliação junto à nossa área de tesouraria.\n\n"
            "Caso haja interesse, entraremos em contato diretamente.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _improd(
        30,
        "Relatório automático de portfólio — semana 07/2026",
        (
            "Sistema de Gestão de Investimentos — Relatório Semanal\n\n"
            "Portfolio consolidado em 15/02/2026:\n\n"
            "Renda fixa: R$ 320.450,00 (+0,8%)\n"
            "Renda variavel: R$ 87.230,00 (-1,2%)\n"
            "Fundos de investimento: R$ 145.000,00 (+0,3%)\n"
            "Total: R$ 552.680,00 (+0,3% na semana)\n\n"
            "Este relatório é gerado automáticamente toda segunda-feira. "
            "Para personalizar os alertas, acesse seu perfil no portal."
        ),
        "relatórios@gestãoativos.com.br",
        0.90,
        1680,
        (
            "Prezados,\n\n"
            "Agradecemos o envio do relatório semanal de portfólio consolidado em "
            "15/02/2026. Os dados de performance serão repassados à equipe de "
            "investimentos para acompanhamento.\n\n"
            "Continuem enviando os relatórios semanais normalmente.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _improd(
        31,
        "Disponibilidade do informe de rendimentos 2025 para Imposto de Renda",
        (
            "Banco Exemplo — Informe de Rendimentos\n\n"
            "Seu informe de rendimentos do ano-base 2025 já está disponível para download.\n\n"
            "Acesse: app.bancoexemplo.com.br/ir2025\n\n"
            "Prazo para entrega da declaração do IR 2026: 30 de abril de 2026.\n\n"
            "Esta mensagem foi enviada automáticamente. Não responda este email."
        ),
        "noreply@bancoexemplo.com.br",
        0.93,
        790,
        (
            "Prezados,\n\n"
            "Confirmamos o recebimento da notificação sobre a disponibilidade do "
            "informe de rendimentos 2025. Realizaremos o download pelo link indicado "
            "para uso na declaração do IR 2026.\n\n"
            "Obrigado pela comunicação.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _improd(
        32,
        "Newsletter mensal — Análise Macroeconômica Fevereiro 2026",
        (
            "Economistas BR — Análise Mensal\n\n"
            "DESTAQUES DE FEVEREIRO:\n\n"
            "Cenario internacional: Fed manteve taxa entre 4,5-4,75%, sinal de pause no ciclo de cortes.\n"
            "Brasil: PIB cresce 2,1% em 2025, abaixo da projeção inicial de 2,4%.\n"
            "Cambio: Real se valoriza 3,2% em fevereiro frente ao dolar.\n"
            "Perspectivas: Desaceleração do consumo no primeiro semestre de 2026.\n\n"
            "Ler análise completa | Descadastrar"
        ),
        "newsletter@economistasbr.com.br",
        0.86,
        1540,
        (
            "Prezados,\n\n"
            "Agradecemos o envio da análise macroeconômica de fevereiro 2026. Os dados "
            "sobre PIB, câmbio e perspectivas para o primeiro semestre são relevantes "
            "para nossas projeções internas.\n\n"
            "A análise foi encaminhada à equipe econômica para referência.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _improd(
        33,
        "Fatura do cartao corporativo disponível — vencimento 05/03",
        (
            "Banco Corporativo BR — Fatura Disponivel\n\n"
            "Sua fatura do cartao corporativo referente ao período 10/01 a 09/02 está disponível.\n\n"
            "Valor total: R$ 12.847,35\n"
            "Vencimento: 05/03/2026\n"
            "Pagamento minimo: R$ 1.284,73\n\n"
            "Acesse o app para visualizar os lançamentos detalhados. "
            "Esta é uma mensagem automática do sistema de cobranca."
        ),
        "faturas@corporativobr.com.br",
        0.88,
        910,
        (
            "Prezados,\n\n"
            "Confirmamos o recebimento do aviso de fatura do cartão corporativo no "
            "valor de R$ 12.847,35 com vencimento em 05/03. Consultaremos os "
            "lançamentos detalhados pelo app para conferência.\n\n"
            "Obrigado pela notificação.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _improd(
        34,
        "Confirmação de cadastro — plataforma de investimentos AutoInvest",
        (
            "AutoInvest — Bem-vindo!\n\n"
            "Seu cadastro foi realizado com sucesso na plataforma AutoInvest.\n\n"
            "Login: seu.email@empresa.com.br\n"
            "Acesse agora: autoinvest.com.br/login\n\n"
            "Para sua segurança, recomendamos ativar a autenticação em dois fatores.\n\n"
            "Esta é uma mensagem automática. Em caso de dúvidas, acesse nossa Central de Ajuda."
        ),
        "noreply@autoinvest.com.br",
        0.84,
        1060,
        (
            "Prezados,\n\n"
            "Confirmamos o recebimento do e-mail de boas-vindas da plataforma "
            "AutoInvest. Já realizamos o primeiro acesso e ativaremos a autenticação "
            "em dois fatores conforme recomendado.\n\n"
            "Obrigado.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _improd(
        35,
        "Pesquisa de satisfação — avaliação do atendimento recente",
        (
            "Banco Exemplo — Pesquisa de Satisfacao\n\n"
            "Gostaríamos de saber sua opinião sobre o atendimento que você recebeu em 15/02/2026.\n\n"
            "Responda nossa pesquisa rapida (menos de 2 minutos): survey.bancoexemplo.com.br/sat123\n\n"
            "Sua opinião é muito importante para melhorarmos nossos serviços.\n\n"
            "Esta é uma mensagem automática. Para não receber pesquisas futuras, "
            "atualize suas preferências de comunicação no app."
        ),
        "pesquisa@bancoexemplo.com.br",
        0.82,
        1150,
        (
            "Prezados,\n\n"
            "Agradecemos o envio da pesquisa de satisfação referente ao atendimento "
            "de 15/02/2026. Responderemos o questionário pelo link informado assim "
            "que possível.\n\n"
            "Obrigado pela iniciativa de colher nosso feedback.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _improd(
        36,
        "Atualização dos termos de uso e política de privacidade",
        (
            "Banco Exemplo — Aviso Importante\n\n"
            "Atualizamos nossos Termos de Uso e Política de Privacidade em conformidade com a LGPD.\n\n"
            "As principais mudancas incluem:\n"
            "- Maior transparência no uso de dados para personalização\n"
            "- Novos direitos dos titulares de dados\n"
            "- Atualização dos prazos de retenção de informações\n\n"
            "Os novos termos entram em vigor em 01/03/2026. "
            "Acesse nosso portal para consultar o documento completo."
        ),
        "legal@bancoexemplo.com.br",
        0.80,
        1380,
        (
            "Prezados,\n\n"
            "Agradecemos a comunicação sobre a atualização dos Termos de Uso e "
            "Política de Privacidade em conformidade com a LGPD. Encaminharemos o "
            "documento ao nosso departamento jurídico para ciência.\n\n"
            "Obrigado pelo aviso.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _improd(
        37,
        "Lembrete de vencimento — fatura do seguro de vida em grupo",
        (
            "Seguradora Nacional — Aviso de Vencimento\n\n"
            "Este é um lembrete automático de que o próximo prêmio do seu seguro de vida em grupo "
            "(apólice n. SV-2025-44123) vence em 01/03/2026.\n\n"
            "Valor: R$ 1.240,00\n"
            "Pagamento via debito automático cadastrado.\n\n"
            "Nenhuma ação necessaria. Esta é uma mensagem informativa automática."
        ),
        "avisos@seguradosnacional.com.br",
        0.83,
        820,
        (
            "Prezados,\n\n"
            "Agradecemos o lembrete de vencimento da apólice de seguro de vida em "
            "grupo n. SV-2025-44123. Confirmamos que o débito automático está "
            "cadastrado e ativo para o pagamento de R$ 1.240,00.\n\n"
            "Obrigado pela comunicação.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _improd(
        38,
        "Novo recurso disponível — PIX Agendado no app do banco",
        (
            "Banco Exemplo — Novidade no App\n\n"
            "Agora você pode agendar seus pagamentos via PIX com até 60 dias de antecedencia!\n\n"
            "Beneficios do PIX Agendado:\n"
            "- Programação com data futura\n"
            "- Cancelamento até D-1\n"
            "- Confirmação por push notification\n\n"
            "Atualize seu app para a versao 4.2 e experimente. Disponivel para iOS e Android.\n\n"
            "Esta é uma mensagem informativa do Banco Exemplo."
        ),
        "novidades@bancoexemplo.com.br",
        0.91,
        940,
        (
            "Prezados,\n\n"
            "Agradecemos a comunicação sobre o novo recurso de PIX Agendado. A "
            "funcionalidade de programação com data futura será útil para nossos "
            "pagamentos recorrentes.\n\n"
            "Atualizaremos o app para a versão 4.2 conforme indicado.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
    _improd(
        39,
        "Boletim tributário automatizado — alterações fiscais de fevereiro 2026",
        (
            "SistemaTrib — Boletim Automático\n\n"
            "Alteracoes tributárias publicadas em fevereiro de 2026:\n\n"
            "- IN RFB 2.219: Novas regras para compensação de PIS/COFINS\n"
            "- Portaria PGFN 45/2026: Prorrogação do Refis para MEIs\n"
            "- Resolucao BACEN 4.882: Atualização das alíquotas de IOF para operações de crédito\n\n"
            "Este boletim é gerado automáticamente pelo SistemaTrib Monitor. "
            "Para ajustar os temas monitorados, acesse seu painel de configurações."
        ),
        "monitor@tributário.com.br",
        0.70,
        2480,
        (
            "Prezados,\n\n"
            "Agradecemos o envio do boletim tributário de fevereiro 2026. As "
            "informações sobre as alterações em PIS/COFINS, Refis para MEIs e "
            "alíquotas de IOF foram encaminhadas à nossa área fiscal.\n\n"
            "Continuem enviando as atualizações mensais.\n\n"
            "Atenciosamente,\n[Seu Nome]"
        ),
    ),
]
