from datetime import datetime, timedelta, timezone

_BASE = datetime(2026, 2, 17, tzinfo=timezone.utc)

_SUGGESTION_PRODUTIVO = (
    "Ola, obrigado pelo contato.\n\n"
    "Recebemos sua mensagem sobre [assunto] e ja estamos analisando. "
    "Em breve entraremos em contato com um retorno completo sobre o tema.\n\n"
    "Atenciosamente,\n[Seu Nome]"
)

_SUGGESTION_IMPRODUTIVO = (
    "Ola, obrigado pelo contato.\n\n"
    "Agradecemos sua mensagem, porem ela nao se enquadra nas demandas "
    "operacionais atendidas por este canal no momento. "
    "Caso tenha uma solicitacao especifica, entre em contato pelos canais oficiais.\n\n"
    "Atenciosamente,\n[Seu Nome]"
)

_MODEL = "facebook/bart-large-mnli"


def _email(i: int, subject: str, body: str, sender: str) -> dict:
    return {
        "subject": subject,
        "body_text": body,
        "sender": sender,
        "received_at": _BASE + timedelta(days=i % 30, hours=9 + (i % 8)),
    }


def _prod(i: int, subject: str, body: str, sender: str, confidence: float, ms: int) -> dict:
    return {
        "email": _email(i, subject, body, sender),
        "classification": {
            "label": "Produtivo",
            "confidence": confidence,
            "model_used": _MODEL,
            "inference_ms": ms,
            "suggestion": _SUGGESTION_PRODUTIVO,
        },
    }


def _improd(i: int, subject: str, body: str, sender: str, confidence: float, ms: int) -> dict:
    return {
        "email": _email(i, subject, body, sender),
        "classification": {
            "label": "Improdutivo",
            "confidence": confidence,
            "model_used": _MODEL,
            "inference_ms": ms,
            "suggestion": _SUGGESTION_IMPRODUTIVO,
        },
    }


SEED_FIXTURES = [
    # --- Produtivo (24) ---
    _prod(
        0,
        "Proposta de parceria estrategica — integracao de plataformas financeiras",
        (
            "Prezado time da AutoU,\n\n"
            "Representamos a FinanciaBR, uma consultoria especializada em solucoes digitais para o setor financeiro. "
            "Gostarimos de explorar uma parceria estrategica para integrar nossas plataformas de analise de credito "
            "com o sistema de classificacao de emails da AutoU. Acreditamos que a sinergia entre as solucoes pode "
            "gerar valor significativo para nossos clientes em comum.\n\n"
            "Podemos agendar uma reuniao para apresentar nossa proposta formal?"
        ),
        "carlos.mendes@financiabr.com.br",
        0.93,
        1250,
    ),
    _prod(
        1,
        "Solicitacao de documentacao para auditoria financeira Q1 2026",
        (
            "Ola,\n\n"
            "Conforme combinado com o departamento juridico, precisamos receber ate sexta-feira (20/02) "
            "os seguintes documentos para a auditoria do primeiro trimestre: balancetes mensais de outubro a dezembro, "
            "relatorios de conciliacao bancaria e extrato consolidado das contas correntes.\n\n"
            "Qualquer duvida estou a disposicao. Aguardo retorno urgente."
        ),
        "ana.souza@consultoriaabc.com.br",
        0.89,
        1480,
    ),
    _prod(
        2,
        "Negociacao de contrato de servicos de TI — renovacao anual",
        (
            "Bom dia,\n\n"
            "Nosso contrato de suporte e manutencao de sistemas vence em 15 de marco. "
            "Gostariamos de iniciar as negociacoes para a renovacao anual, incluindo a expansao do escopo "
            "para cobrir os novos modulos de inteligencia artificial implementados no ultimo semestre.\n\n"
            "Poderia nos enviar uma proposta atualizada com os novos valores e condicoes?"
        ),
        "roberto.lima@techsolutionsbr.com.br",
        0.87,
        1120,
    ),
    _prod(
        3,
        "Pedido de orcamento — desenvolvimento de modulo de relatorios customizados",
        (
            "Prezados,\n\n"
            "Precisamos desenvolver um modulo de relatorios financeiros customizados para atender "
            "as exigencias regulatorias do Banco Central. O modulo deve gerar exportacoes em PDF e CSV "
            "com formatacao padrao COSIF.\n\n"
            "Solicito um orcamento detalhado com prazo de entrega e equipe envolvida."
        ),
        "patricia.oliveira@bancoexemplo.com.br",
        0.91,
        1380,
    ),
    _prod(
        4,
        "Reuniao de revisao orcamentaria — planejamento 2026/2027",
        (
            "Ola equipe,\n\n"
            "Preciso agendar uma reuniao para revisar o orcamento aprovado para 2026 e discutir "
            "as premissas para o planejamento do proximo exercicio. Temos algumas variacoes relevantes "
            "no cenario macroeconomico que impactam as projecoes de receita.\n\n"
            "Por favor, confirmem disponibilidade para a semana de 02/03."
        ),
        "fernando.costa@gestaofinanceira.com.br",
        0.85,
        980,
    ),
    _prod(
        5,
        "Consulta juridica sobre compliance tributario — IFRS 9",
        (
            "Prezado Dr. Almeida,\n\n"
            "Necessitamos de uma analise juridica sobre as implicacoes tributarias da adocao do IFRS 9 "
            "na nossa carteira de credito. Especificamente, precisamos entender o tratamento fiscal "
            "das provisoes para perdas esperadas (ECL) sob a nova norma contabil.\n\n"
            "Poderia nos fornecer um parecer ate o dia 28 deste mes?"
        ),
        "mariana.ferreira@juridicofin.com.br",
        0.88,
        1560,
    ),
    _prod(
        6,
        "Solicitacao de suporte tecnico — falha critica no processamento de pagamentos",
        (
            "Urgente,\n\n"
            "Estamos enfrentando uma falha critica no modulo de processamento de pagamentos desde as 14h de hoje. "
            "Aproximadamente 230 transacoes foram bloqueadas e os clientes estao sendo impactados.\n\n"
            "Precisamos de um engenheiro disponivel imediatamente para diagnostico e resolucao. "
            "Nossa janela de SLA critico esta expirando em 2 horas."
        ),
        "joao.santos@pagamentosdigitais.com.br",
        0.94,
        2100,
    ),
    _prod(
        7,
        "Proposta de consultoria em gestao de riscos financeiros",
        (
            "Prezados executivos da AutoU,\n\n"
            "A RiskPro Consultoria elaborou uma proposta personalizada de gestao de riscos financeiros "
            "baseada no perfil da sua empresa. Nossa abordagem cobre risco de credito, liquidez e mercado "
            "com framework alinhado ao Basileia III.\n\n"
            "Solicito uma reuniao para apresentacao detalhada da proposta. Disponibilizo horarios "
            "na proxima semana conforme sua conveniencia."
        ),
        "beatriz.alves@riskproconsultoria.com.br",
        0.86,
        1340,
    ),
    _prod(
        8,
        "Solicitacao de aprovacao — investimento em infraestrutura de dados",
        (
            "Prezada diretoria,\n\n"
            "Conforme apresentado no board do mes passado, solicito aprovacao formal para o investimento "
            "de R$ 480.000 em infraestrutura de dados (cloud migration + data warehouse).\n\n"
            "O projeto tem ROI projetado de 18 meses e e prerequisito para as iniciativas de IA planejadas "
            "para o segundo semestre. Aguardo aprovacao com urgencia para nao impactar o cronograma."
        ),
        "lucas.martins@autou.com.br",
        0.92,
        1670,
    ),
    _prod(
        9,
        "Contrato de fornecimento — licencas de software financeiro",
        (
            "Boa tarde,\n\n"
            "Seguem em anexo o contrato de fornecimento das 50 licencas do SoftFin Pro para analise e assinatura. "
            "O contrato contempla suporte 24/7, atualizacoes automaticas e treinamento inicial para a equipe.\n\n"
            "Precisamos da assinatura ate quinta-feira para garantir a ativacao no inicio do proximo mes. "
            "Qualquer ajuste contratual deve ser comunicado ate amanha."
        ),
        "diana.rocha@softfinbrasil.com.br",
        0.90,
        1190,
    ),
    _prod(
        10,
        "Pedido de esclarecimento — clausulas de inadimplencia no contrato de credito",
        (
            "Prezado departamento juridico,\n\n"
            "Ao revisar o contrato de abertura de credito n. 2025-CR-4872, identificamos ambiguidade "
            "na clausula 8.3 referente ao gatilho de inadimplencia em casos de reestruturacao societaria.\n\n"
            "Solicitamos um esclarecimento formal por escrito e, se necessario, um aditivo contratual "
            "para clarificar os termos antes da renovacao do limite em marco."
        ),
        "henrique.barros@creditocorporativo.com.br",
        0.83,
        1430,
    ),
    _prod(
        11,
        "Proposta de fusao — aquisicao da carteira de clientes PJ",
        (
            "Prezada diretoria,\n\n"
            "A Investimentos Nacionais SA tem interesse em adquirir a carteira de clientes PJ da AutoU "
            "referente ao segmento de medio porte. Propomos um processo de due diligence de 60 dias "
            "com avaliacao independente.\n\n"
            "Gostarimos de agendar uma reuniao de NDA para iniciar as tratativas formais."
        ),
        "sergio.campos@investnacionais.com.br",
        0.88,
        2050,
    ),
    _prod(
        12,
        "Reembolso de despesas — viagem corporativa Sao Paulo/Recife",
        (
            "Ola RH,\n\n"
            "Solicito reembolso das despesas da viagem corporativa realizada entre 10 e 12 de fevereiro "
            "para reunioes com clientes em Recife. Total: R$ 3.247,80 conforme planilha e notas fiscais em anexo.\n\n"
            "Por favor, confirme o processamento e a data prevista de credito na conta."
        ),
        "claudia.nunes@autou.com.br",
        0.81,
        890,
    ),
    _prod(
        13,
        "Solicitacao de credencial de acesso — sistema de compliance",
        (
            "Prezado time de TI,\n\n"
            "Inicio na empresa na segunda-feira (23/02) no cargo de Analista de Compliance. "
            "Preciso que sejam criadas minhas credenciais de acesso aos sistemas: ERP Financeiro, "
            "plataforma de compliance regulatorio e repositorio de documentos.\n\n"
            "Favor confirmar que os acessos estarao prontos ate sexta para que eu possa comecar sem interrupcoes."
        ),
        "thiago.mendonca@autou.com.br",
        0.79,
        950,
    ),
    _prod(
        14,
        "Questionario de due diligence — fornecedor de servicos de pagamento",
        (
            "Prezados,\n\n"
            "Como parte do processo de homologacao de novos fornecedores, encaminhamos o questionario "
            "de due diligence ESG e financeiro que deve ser preenchido e devolvido em ate 10 dias uteis.\n\n"
            "Os documentos solicitados incluem: demonstracoes financeiras dos ultimos 3 anos, "
            "politica anticorrupcao, certidoes de regularidade fiscal e trabalhista."
        ),
        "rafael.xavier@compliancefin.com.br",
        0.86,
        1720,
    ),
    _prod(
        15,
        "Revisao de limites de credito — proposta de elevacao Q1 2026",
        (
            "Bom dia,\n\n"
            "Baseado no historico de pagamentos e no crescimento do faturamento nos ultimos 12 meses, "
            "solicitamos formalmente a revisao e elevacao do limite de credito da conta corrente "
            "de R$ 500.000 para R$ 1.200.000.\n\n"
            "Encaminhamos em anexo o balancete atualizado, DRE e declaracao de faturamento para analise."
        ),
        "vanessa.teixeira@grupomercantilbr.com.br",
        0.90,
        1580,
    ),
    _prod(
        16,
        "Denuncia de irregularidade — suspeita de fraude interna no setor de pagamentos",
        (
            "Prezado canal de compliance,\n\n"
            "Por meio deste canal, reporto uma situacao que considero irregular no departamento de pagamentos. "
            "Nos ultimos 30 dias, identifiquei transferencias recorrentes para fornecedores nao cadastrados "
            "no sistema ERP, sem documentacao de suporte.\n\n"
            "Solicito investigacao confidencial. Estou disponivel para fornecer evidencias adicionais."
        ),
        "anonimo@autou.com.br",
        0.84,
        2200,
    ),
    _prod(
        17,
        "Proposta de treinamento corporativo — certificacao CPA-20",
        (
            "Prezados,\n\n"
            "A Escola de Financas BR oferece um programa corporativo de preparacao para a certificacao CPA-20 "
            "da ANBIMA. O programa inclui 80 horas de curso online, simulados ilimitados e material impresso.\n\n"
            "Temos turma iniciando em marco com desconto de 15% para grupos acima de 10 colaboradores. "
            "Podemos agendar uma apresentacao para o RH esta semana?"
        ),
        "marcos.vieira@escolafinancasbr.com.br",
        0.82,
        1050,
    ),
    _prod(
        18,
        "Alerta de vencimento — apolice de seguro patrimonial",
        (
            "Prezado cliente,\n\n"
            "Sua apolice de seguro patrimonial (n. SP-2024-88741) vence em 28 dias. "
            "Para garantir a continuidade da cobertura sem interrupcao, precisamos iniciar o processo "
            "de renovacao com a coleta de documentos atualizados do imobilizado.\n\n"
            "Por favor, agende uma visita com nosso corretor para levantamento e cotacao atualizada."
        ),
        "juliana.melo@seguradoraexemplo.com.br",
        0.80,
        1100,
    ),
    _prod(
        19,
        "Solicitacao de relatorio — indicadores de performance financeira para board",
        (
            "Ola equipe de controladoria,\n\n"
            "Preciso do pacote de indicadores financeiros para apresentacao ao board na proxima quarta-feira (25/02). "
            "O pacote deve incluir: P&L consolidado, EBITDA ajustado, variacao de caixa, "
            "indice de liquidez corrente e projecao revisada para o semestre.\n\n"
            "O prazo para envio e segunda-feira ate as 18h."
        ),
        "gustavo.pires@autou.com.br",
        0.93,
        1300,
    ),
    _prod(
        20,
        "Pedido de parecer — viabilidade financeira de novo produto de investimento",
        (
            "Prezados analistas,\n\n"
            "Estamos avaliando o lancamento de um CDB com liquidez diaria e rentabilidade atrelada ao CDI + 1,5%. "
            "Solicito um parecer tecnico sobre a viabilidade financeira, impacto no funding e adequacao "
            "ao perfil de risco da instituicao.\n\n"
            "O parecer deve estar pronto para a reuniao do ALCO na proxima semana."
        ),
        "renata.fontes@bancoexemplo.com.br",
        0.87,
        1640,
    ),
    _prod(
        21,
        "Proposta de terceirizacao — processamento de folha de pagamento",
        (
            "Prezada diretoria de RH,\n\n"
            "A FolhaPro Servicos apresenta uma proposta de terceirizacao completa do processamento "
            "de folha de pagamento, incluindo calculo de tributos, eSocial, FGTS e holerites digitais.\n\n"
            "Estimamos uma reducao de 35% nos custos operacionais em relacao ao modelo atual. "
            "Solicito autorizacao para avancamos para a etapa de proposta tecnica detalhada."
        ),
        "anderson.ramos@folhapro.com.br",
        0.85,
        1220,
    ),
    _prod(
        22,
        "Notificacao de inadimplencia — boleto vencido referente a servicos de TI",
        (
            "Prezado departamento financeiro,\n\n"
            "Informamos que o boleto no valor de R$ 18.750,00 referente aos servicos de TI prestados "
            "em janeiro venceu em 10/02 e ainda consta em aberto em nosso sistema.\n\n"
            "Solicitamos a regularizacao ate amanha (18/02) para evitar a incidencia de multa e juros "
            "contratuais de 2% ao mes. Caso o pagamento ja tenha sido efetuado, favor desconsiderar."
        ),
        "cobranca@techsolutionsbr.com.br",
        0.88,
        1410,
    ),
    _prod(
        23,
        "Candidatura espontanea — Analista Senior de Riscos e Credito",
        (
            "Prezada equipe de recrutamento,\n\n"
            "Tenho 8 anos de experiencia em analise de riscos de credito no segmento bancario corporativo "
            "e estou em busca de novas oportunidades. Meu background inclui modelagem de PD/LGD/EAD, "
            "IFRS 9, stress testing e Basileia III.\n\n"
            "Gostaria de apresentar meu perfil para possiveis oportunidades na AutoU. "
            "CV em anexo para apreciacao."
        ),
        "isabella.correia@gmail.com",
        0.76,
        870,
    ),
    # --- Improdutivo (16) ---
    _improd(
        24,
        "Newsletter Semanal — Mercado Financeiro Brasileiro | Edicao 47",
        (
            "Mercado Financeiro BR — Sua fonte semanal de informacoes\n\n"
            "DESTAQUES DA SEMANA:\n"
            "- Selic permanece em 13,75% apos reuniao do Copom\n"
            "- IPCA acumula 4,8% nos ultimos 12 meses\n"
            "- Ibovespa fecha semana com alta de 2,3%\n"
            "- Dolar recua frente ao real apos dados de inflacao nos EUA\n\n"
            "Leia a analise completa no portal. Para cancelar o recebimento, clique em 'descadastrar'."
        ),
        "noticias@mercadofinanceirobr.com.br",
        0.91,
        1850,
    ),
    _improd(
        25,
        "Seu extrato bancario de janeiro esta disponivel",
        (
            "Banco Exemplo — Notificacao Automatica\n\n"
            "Seu extrato do mes de janeiro de 2026 ja esta disponivel para consulta no aplicativo "
            "ou no internet banking.\n\n"
            "Acesse: app.bancoexemplo.com.br/extrato\n\n"
            "Esta e uma mensagem automatica. Nao responda este email."
        ),
        "noreply@bancoexemplo.com.br",
        0.89,
        1120,
    ),
    _improd(
        26,
        "Alerta de seguranca — novo acesso detectado na sua conta",
        (
            "Sistema de Seguranca — Banco Exemplo\n\n"
            "Detectamos um novo acesso a sua conta em 17/02/2026 as 10:34 de Sao Paulo, SP.\n\n"
            "Dispositivo: Chrome / Windows 11\n"
            "IP: 189.xxx.xxx.xxx\n\n"
            "Se foi voce, nenhuma acao e necessaria. Se nao reconhece este acesso, "
            "bloqueie sua conta imediatamente pelo app. Esta e uma mensagem automatica."
        ),
        "seguranca@bancoexemplo.com.br",
        0.88,
        960,
    ),
    _improd(
        27,
        "Confirmacao de transacao — TED realizada com sucesso",
        (
            "Banco Exemplo — Comprovante de Transacao\n\n"
            "TED realizada com sucesso em 18/02/2026.\n\n"
            "Valor: R$ 5.000,00\n"
            "Destinatario: Fornecedor XYZ Ltda\n"
            "Banco destino: 001 - Banco do Brasil\n"
            "Agencia/Conta: 1234-5 / 678901-2\n\n"
            "Guarde este comprovante para seus registros. Nao responda este email."
        ),
        "transacoes@bancoexemplo.com.br",
        0.92,
        870,
    ),
    _improd(
        28,
        "Convite para webinar — Tendencias em Fintechs para 2026",
        (
            "FinTechBrasil Summit — Convite Especial\n\n"
            "Voce esta convidado para o webinar gratuito 'Tendencias em Fintechs para 2026'.\n\n"
            "Data: 25 de fevereiro de 2026, 19h (horario de Brasilia)\n"
            "Palestrantes: 4 CEOs de fintechs brasileiras de destaque\n"
            "Temas: Open Finance, IA no credito, Banking as a Service\n\n"
            "Vagas limitadas. Inscreva-se agora: fintechbr.com.br/summit2026\n\n"
            "Para descadastrar, clique aqui."
        ),
        "eventos@fintechbrasil.com.br",
        0.85,
        1430,
    ),
    _improd(
        29,
        "Promocao exclusiva — CDB com 115% do CDI para novos investidores",
        (
            "Banco Investimentos BR — Oferta Especial\n\n"
            "Aproveite nossa promocao de fevereiro: CDB com rentabilidade de 115% do CDI "
            "para aplicacoes acima de R$ 10.000 com vencimento em 12 meses.\n\n"
            "Oferta valida ate 28/02/2026. Aplique agora pelo app e garanta a melhor taxa do mercado.\n\n"
            "Simulacao: R$ 50.000 aplicados rendem aproximadamente R$ 6.950 em 12 meses.\n\n"
            "Para nao receber mais ofertas, atualize suas preferencias de comunicacao."
        ),
        "promocoes@bancoinvestimentosbr.com.br",
        0.87,
        1280,
    ),
    _improd(
        30,
        "Relatorio automatico de portfolio — semana 07/2026",
        (
            "Sistema de Gestao de Investimentos — Relatorio Semanal\n\n"
            "Portfolio consolidado em 15/02/2026:\n\n"
            "Renda fixa: R$ 320.450,00 (+0,8%)\n"
            "Renda variavel: R$ 87.230,00 (-1,2%)\n"
            "Fundos de investimento: R$ 145.000,00 (+0,3%)\n"
            "Total: R$ 552.680,00 (+0,3% na semana)\n\n"
            "Este relatorio e gerado automaticamente toda segunda-feira. "
            "Para personalizar os alertas, acesse seu perfil no portal."
        ),
        "relatorios@gestaoativos.com.br",
        0.90,
        1680,
    ),
    _improd(
        31,
        "Disponibilidade do informe de rendimentos 2025 para Imposto de Renda",
        (
            "Banco Exemplo — Informe de Rendimentos\n\n"
            "Seu informe de rendimentos do ano-base 2025 ja esta disponivel para download.\n\n"
            "Acesse: app.bancoexemplo.com.br/ir2025\n\n"
            "Prazo para entrega da declaracao do IR 2026: 30 de abril de 2026.\n\n"
            "Esta mensagem foi enviada automaticamente. Nao responda este email."
        ),
        "noreply@bancoexemplo.com.br",
        0.93,
        790,
    ),
    _improd(
        32,
        "Newsletter mensal — Analise Macroeconomica Fevereiro 2026",
        (
            "Economistas BR — Analise Mensal\n\n"
            "DESTAQUES DE FEVEREIRO:\n\n"
            "Cenario internacional: Fed manteve taxa entre 4,5-4,75%, sinal de pause no ciclo de cortes.\n"
            "Brasil: PIB cresce 2,1% em 2025, abaixo da projecao inicial de 2,4%.\n"
            "Cambio: Real se valoriza 3,2% em fevereiro frente ao dolar.\n"
            "Perspectivas: Desaceleracao do consumo no primeiro semestre de 2026.\n\n"
            "Ler analise completa | Descadastrar"
        ),
        "newsletter@economistasbr.com.br",
        0.86,
        1540,
    ),
    _improd(
        33,
        "Fatura do cartao corporativo disponivel — vencimento 05/03",
        (
            "Banco Corporativo BR — Fatura Disponivel\n\n"
            "Sua fatura do cartao corporativo referente ao periodo 10/01 a 09/02 esta disponivel.\n\n"
            "Valor total: R$ 12.847,35\n"
            "Vencimento: 05/03/2026\n"
            "Pagamento minimo: R$ 1.284,73\n\n"
            "Acesse o app para visualizar os lancamentos detalhados. "
            "Esta e uma mensagem automatica do sistema de cobranca."
        ),
        "faturas@corporativobr.com.br",
        0.88,
        910,
    ),
    _improd(
        34,
        "Confirmacao de cadastro — plataforma de investimentos AutoInvest",
        (
            "AutoInvest — Bem-vindo!\n\n"
            "Seu cadastro foi realizado com sucesso na plataforma AutoInvest.\n\n"
            "Login: seu.email@empresa.com.br\n"
            "Acesse agora: autoinvest.com.br/login\n\n"
            "Para sua seguranca, recomendamos ativar a autenticacao em dois fatores.\n\n"
            "Esta e uma mensagem automatica. Em caso de duvidas, acesse nossa Central de Ajuda."
        ),
        "noreply@autoinvest.com.br",
        0.84,
        1060,
    ),
    _improd(
        35,
        "Pesquisa de satisfacao — avaliacao do atendimento recente",
        (
            "Banco Exemplo — Pesquisa de Satisfacao\n\n"
            "Gostaramos de saber sua opiniao sobre o atendimento que voce recebeu em 15/02/2026.\n\n"
            "Responda nossa pesquisa rapida (menos de 2 minutos): survey.bancoexemplo.com.br/sat123\n\n"
            "Sua opiniao e muito importante para melhorarmos nossos servicos.\n\n"
            "Esta e uma mensagem automatica. Para nao receber pesquisas futuras, "
            "atualize suas preferencias de comunicacao no app."
        ),
        "pesquisa@bancoexemplo.com.br",
        0.82,
        1150,
    ),
    _improd(
        36,
        "Atualizacao dos termos de uso e politica de privacidade",
        (
            "Banco Exemplo — Aviso Importante\n\n"
            "Atualizamos nossos Termos de Uso e Politica de Privacidade em conformidade com a LGPD.\n\n"
            "As principais mudancas incluem:\n"
            "- Maior transparencia no uso de dados para personalizacao\n"
            "- Novos direitos dos titulares de dados\n"
            "- Atualizacao dos prazos de retencao de informacoes\n\n"
            "Os novos termos entram em vigor em 01/03/2026. "
            "Acesse nosso portal para consultar o documento completo."
        ),
        "legal@bancoexemplo.com.br",
        0.80,
        1380,
    ),
    _improd(
        37,
        "Lembrete de vencimento — fatura do seguro de vida em grupo",
        (
            "Seguradora Nacional — Aviso de Vencimento\n\n"
            "Este e um lembrete automatico de que o proximo premio do seu seguro de vida em grupo "
            "(apolice n. SV-2025-44123) vence em 01/03/2026.\n\n"
            "Valor: R$ 1.240,00\n"
            "Pagamento via debito automatico cadastrado.\n\n"
            "Nenhuma acao necessaria. Esta e uma mensagem informativa automatica."
        ),
        "avisos@seguradosnacional.com.br",
        0.83,
        820,
    ),
    _improd(
        38,
        "Novo recurso disponivel — PIX Agendado no app do banco",
        (
            "Banco Exemplo — Novidade no App\n\n"
            "Agora voce pode agendar seus pagamentos via PIX com ate 60 dias de antecedencia!\n\n"
            "Beneficios do PIX Agendado:\n"
            "- Programacao com data futura\n"
            "- Cancelamento ate D-1\n"
            "- Confirmacao por push notification\n\n"
            "Atualize seu app para a versao 4.2 e experimente. Disponivel para iOS e Android.\n\n"
            "Esta e uma mensagem informativa do Banco Exemplo."
        ),
        "novidades@bancoexemplo.com.br",
        0.91,
        940,
    ),
    _improd(
        39,
        "Boletim tributario automatizado — alteracoes fiscais de fevereiro 2026",
        (
            "SistemaTrib — Boletim Automatico\n\n"
            "Alteracoes tributarias publicadas em fevereiro de 2026:\n\n"
            "- IN RFB 2.219: Novas regras para compensacao de PIS/COFINS\n"
            "- Portaria PGFN 45/2026: Prorrogacao do Refis para MEIs\n"
            "- Resolucao BACEN 4.882: Atualizacao das aliquotas de IOF para operacoes de credito\n\n"
            "Este boletim e gerado automaticamente pelo SistemaTrib Monitor. "
            "Para ajustar os temas monitorados, acesse seu painel de configuracoes."
        ),
        "monitor@tributario.com.br",
        0.70,
        2480,
    ),
]
