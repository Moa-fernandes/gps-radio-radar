# 🌍 Global GPS Radio Radar

[🇺🇸 English Version Below](#-english-version)

---

## 🇧🇷 Versão em Português

Uma aplicação web imersiva em 3D que simula um radar de rádio global em tempo real, inspirada no conceito do *Radio Garden*. O projeto permite explorar o planeta através de um globo terrestre interativo, sintonizar mais de 2.000 estações de rádio reais ao redor do mundo, visualizar o fuso horário local atualizado segundo a segundo e controlar a transmissão através de uma interface de painel futurista (*Glassmorphism*).

### 🚀 Tecnologias Utilizadas
Este projeto foi arquitetado aplicando padrões modernos de engenharia de software e alta performance:
* **Frontend:** React.js, TypeScript
* **Motor 3D & Visualização:** `react-globe.gl`, Three.js
* **Streaming & Áudio:** Howler.js (otimizado para fluxos de rádio contínuos e prevenção de CORS)
* **Estilização & UI:** CSS Modular com design responsivo, temas escuros e efeito de vidro fosco (*Glassmorphism*)
* **Dados de Estações:** Integração em tempo real com a API global *Radio Browser* + sistema de Fallback local seguro.

### ✨ Funcionalidades
* **Globo Terrestre 3D Interativo:** Renderização de alta fidelidade com texturas da NASA, topografia e espaço sideral.
* **Radar Pulsante:** Pontos com animação em anel (*rings*) indicando atividade de transmissão ao vivo.
* **Diretório Global (Sidebar Dropdown):** Menu lateral retrátil e translúcido organizado por países e cidades.
* **Navegação GPS Automatizada:** Ao clicar em qualquer rádio na lista ou no globo, a câmera executa um voo orbital suave até as coordenadas exatas da estação.
* **Player com Fuso Horário Local:** Relógio dinâmico que calcula e exibe a hora exata no fuso horário do país de transmissão em tempo real.
* **Controles de Zoom:** Botões flutuantes para aproximação e afastamento rápido da câmera.

### ⚙️ Como Executar Localmente

1. Clone o repositório:
   ```bash
   git clone [https://github.com/SEU_USUARIO/gps-radio-radar.git](https://github.com/SEU_USUARIO/gps-radio-radar.git)
   cd gps-radio-radar/frontend
