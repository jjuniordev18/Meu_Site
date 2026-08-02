# -*- coding: utf-8 -*-
from fpdf import FPDF

ACCENT = (39, 121, 167)
ACCENT2 = (73, 197, 182)
INK = (20, 22, 30)
MUTED = (90, 95, 110)

PAPER_W = 210
PAPER_H = 297
M = 14
CW = PAPER_W - 2 * M


class CV(FPDF):
    def header(self):
        pass

    def footer(self):
        pass


pdf = CV(orientation="P", unit="mm", format="A4")
pdf.set_auto_page_break(auto=True, margin=12)
pdf.add_font("Arial", "", r"C:\Windows\Fonts\arial.ttf")
pdf.add_font("Arial", "B", r"C:\Windows\Fonts\arialbd.ttf")
pdf.add_page()

# --- header band ---
pdf.set_fill_color(*ACCENT)
pdf.rect(0, 0, PAPER_W, 34, "F")
pdf.set_fill_color(*ACCENT2)
pdf.rect(0, 32, PAPER_W, 2.5, "F")

pdf.set_xy(M, 7)
pdf.set_font("Arial", "B", 22)
pdf.set_text_color(255, 255, 255)
pdf.cell(CW, 10, "JOSUÉ MARIANO GOMES JUNIOR", new_x="LMARGIN", new_y="NEXT")
pdf.set_font("Arial", "", 11)
pdf.set_text_color(235, 245, 248)
pdf.cell(CW, 6, "Líder Operacional · Telecomunicações & Automação · Bacharel em Engenharia de Software", new_x="LMARGIN", new_y="NEXT")
pdf.set_font("Arial", "", 9)
pdf.set_text_color(220, 235, 240)
pdf.cell(CW, 5, "(91) 98190-8702 · juniorgm18@gmail.com · github.com/jjuniordev18", new_x="LMARGIN", new_y="NEXT")

y = 42


def section(title):
    global y
    pdf.set_xy(M, y)
    pdf.set_font("Arial", "B", 12)
    pdf.set_text_color(*ACCENT)
    pdf.cell(CW, 8, title.upper(), new_x="LMARGIN", new_y="NEXT")
    pdf.set_draw_color(*ACCENT2)
    pdf.set_line_width(0.6)
    pdf.line(M, pdf.get_y(), PAPER_W - M, pdf.get_y())
    y = pdf.get_y() + 4


def body(text, size=9.5, color=None, lh=4.6):
    global y
    pdf.set_font("Arial", "", size)
    pdf.set_text_color(*(color or MUTED))
    pdf.set_xy(M, pdf.get_y())
    pdf.multi_cell(CW, lh, text, new_x="LMARGIN", new_y="NEXT")
    y = pdf.get_y()


def job(period, role, org, desc):
    global y
    if pdf.get_y() > 250:
        pdf.add_page()
    pdf.set_font("Arial", "B", 10.5)
    pdf.set_text_color(*INK)
    pdf.set_xy(M, pdf.get_y())
    pdf.cell(CW * 0.68, 5.5, f"{role} — {org}")
    pdf.set_font("Arial", "", 9)
    pdf.set_text_color(*MUTED)
    pdf.cell(CW * 0.32, 5.5, period, align="R", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Arial", "", 9)
    pdf.set_text_color(*MUTED)
    pdf.set_xy(M, pdf.get_y())
    pdf.multi_cell(CW, 4.4, desc, new_x="LMARGIN", new_y="NEXT")
    pdf.ln(1.2)
    y = pdf.get_y()


def bullet_list(items, size=9.5):
    global y
    pdf.set_font("Arial", "", size)
    pdf.set_text_color(*MUTED)
    for it in items:
        if pdf.get_y() > 265:
            pdf.add_page()
        pdf.set_x(M + 2)
        pdf.cell(4, 4.6, "•")
        pdf.multi_cell(CW - 6, 4.6, it, new_x="LMARGIN", new_y="NEXT")
    y = pdf.get_y()


# --- summary ---
section("Objetivo")
body("Profissional multidisciplinar com mais de 20 anos de campo, unindo telecomunicações, "
     "automação industrial e instalações elétricas em ambientes críticos — da rede das operadoras "
     "à LTE privada na mineração. Bacharel em Engenharia de Software, construo ferramentas que resolvem "
     "problemas reais de operação.")

# --- skills ---
section("Competências")
bullet_list([
    "Manutenção preventiva, corretiva e preditiva; troubleshooting e diagnóstico de falhas",
    "Redes LTE privadas, monitoramento com Spectrum, Zabbix e Grafana (ambiente de mineração)",
    "Sistemas de RF e transmissão — PDH, Flexy Packet, SRAL; implantação e ativação de BTS e Node-B (Nokia)",
    "Testes com instrumentação; instalações elétricas de alta e baixa tensão",
    "Equipamentos Nokia, Ericsson e Huawei; supervisão e treinamento de equipes de campo",
    "Programação básica: Python, Java, lógica, POO; certificações em dados, segurança e IA",
])

# --- experience ---
section("Experiência Profissional")
job("Atual", "Líder Operacional", "Sonda Procwork Informática",
    "Manutenção preventiva, corretiva e emergencial da rede LTE privada Vale em ambiente de mineração; "
    "monitoramento via Spectrum, Zabbix e Grafana; atendimento a ordens de manutenção sistemáticas, "
    "corretivas e emergenciais; acompanhamento de KPIs em Parauapebas e Carajás (PA).")
job("2023 – 2025", "Técnico em Telecomunicações", "Trópico Sistemas e Telecom da Amazônia",
    "Implantação e manutenção da rede LTE privada Vale em Parauapebas e Carajás; acompanhamento de KPIs "
    "(disponibilidade e MTBF); inspeções em equipamentos de RF e MW.")
job("2021 – 2022", "Técnico em Telecomunicações", "Eletrodata Engenharia",
    "Operação assistida de equipamentos Nokia/Vivo; manutenção e implantação da rede LTE privada Vale; "
    "monitoramento contínuo e análise de anomalias.")
job("2020 – 2021", "Técnico de Campo", "Radiocell Engenharia",
    "Implantação, otimização e ativação de redes 2G, 3G e 4G; configuração de equipamentos Nokia, "
    "Ericsson e Huawei; testes e validação de sistemas de comunicação.")
job("2018 – 2019", "Técnico em Telecomunicações · PQE OJT", "Telsign Consultoria",
    "Manutenção preventiva e corretiva de equipamentos Nokia, Ericsson e Huawei; configuração de "
    "sistemas SRAN, AIR SCALE, rádios e enlace Ceragon.")
job("2017 – 2018", "Técnico de Manutenção Nível II", "TEL Telecomunicações",
    "Manutenção preventiva e corretiva de equipamentos de telecomunicações; atendimento a demandas "
    "críticas e emergenciais.")
job("2016 – 2017", "Técnico de Manutenção", "Ericsson Gestão e Serviços de Telecom",
    "Manutenção preventiva e corretiva de redes 2G, 3G e 4G; suporte técnico a equipamentos Nokia, "
    "Ericsson e Huawei.")
job("2016", "Técnico de Campo", "Intaltec Engenharia (PJ)",
    "Implantação e manutenção de sistemas de RF; implantação, ativação e manutenção de BTS e Node-B (Nokia).")
job("2015 – 2016", "Supervisor de Instalação", "Stalker Engenharia (PJ)",
    "Supervisão de implantação e manutenção de sistemas de RF e de BTS/Node-B (Nokia).")
job("2014 – 2015", "Supervisor de Instalação", "Lemcon do Brasil",
    "Supervisão de implantação e manutenção de RF; ativação e manutenção de BTS e Node-B (Nokia); "
    "instalação de rádios de enlace (PDH).")
job("2012 – 2014", "Técnico de Campo", "WCA.com",
    "Implantação e manutenção de sistemas de RF e transmissão — rádios Flexy Packet, Flexy Hybrid e SRAL; "
    "instalação de fontes Omibra e Eltek.")
job("2009 – 2011", "Técnico em Telecomunicações", "Fatto Engenharia",
    "Implantação e manutenção de sistemas de RF; ativação e manutenção de BTS e Node-B (Nokia); "
    "instalação de fontes Omibra e Eltek.")
job("2002 – 2007", "Eletricista", "Sondotec · Vitória Consultoria · Endicon",
    "Eletricista de alta e baixa tensão em obras e serviços de engenharia.")

# --- education & certs ---
section("Formação")
bullet_list([
    "Bacharel em Engenharia de Software — Unopar / Anhanguera",
    "Curso Técnico em Eletrotécnica — Colégio Integrado Polivalente",
    "Curso de Alta e Baixa Tensão — CEFET",
    "Projeto de Extensão Acelere Sua Carreira — Unopar (2025.2 e 2026.1)",
])

section("Certificações")
bullet_list([
    "Instalação e comissionamento NSN — WCDMA, GSM Flexi Edge, Flexi Packet, Flexi Hybrid, Eltek, Multirádio",
    "Rádio enlace PDH e LTW Nokia; calibração e testes com Site Master",
    "Noções Básicas de Rede — Cisco; Introduction to Cybersecurity — Cisco",
    "Python básico, Java básico, Lógica de Programação, POO, Projetos de Sistemas de TI — Fundação Bradesco",
    "Introdução à Ciência de Dados, Internet das Coisas, Inteligência Artificial e Produtividade, "
    "Prompting Responsável — Google / MIT",
    "Segurança em TI, Fundamentos de T.I, Automação de Sistemas — IFRS; CNH categoria B",
])

# --- langs ---
section("Idiomas")
bullet_list([
    "Português — nativo",
    "Inglês — básico (leitura de documentação técnica)",
    "Espanhol — básico",
])

pdf.output("curriculo.pdf")
print("OK — curriculo.pdf gerado")
