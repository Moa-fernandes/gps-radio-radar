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

Instale as dependências:

Bash
npm install
Inicie o servidor de desenvolvimento:

Bash
npm run dev
Acesse no navegador: http://localhost:5173

🇺🇸 English Version
An immersive 3D web application simulating a real-time global radio radar, inspired by Radio Garden. The project allows users to explore the planet through an interactive 3D globe, tune into over 2,000 real radio stations worldwide, track live local time down to the second, and manage audio streaming via a futuristic glassmorphic UI.

🚀 Tech Stack
Built using modern software engineering standards for maximum performance and clean architecture:

Frontend: React.js, TypeScript

3D Engine & Rendering: react-globe.gl, Three.js

Streaming & Audio: Howler.js (optimized for continuous radio streams and CORS mitigation)

Styling & UI: Custom modular design featuring dark mode, responsive layouts, and glassmorphism.

Radio Data: Real-time integration with the global Radio Browser API + secure local fallback datasets.

✨ Key Features
Interactive 3D Globe: High-fidelity rendering featuring NASA textures, topology, and a starry background.

Pulsing Radar Effect: Animated rings highlighting active live broadcasting coordinates.

Global Directory (Accordion Sidebar): Retractable, translucid side menu organized by countries and cities.

Automated GPS Navigation: Clicking any station triggers a smooth orbital camera flight directly to its geographical location.

Live Local Clock Player: Dynamic clock calculating and displaying the precise local time of the broadcasting target in real-time.

Zoom Controls: Floating interface buttons for quick camera altitude adjustment.

⚙️ Running Locally
Clone the repository:

Bash
git clone [https://github.com/SEU_USUARIO/gps-radio-radar.git]
cd gps-radio-radar/frontend
Install dependencies:

Bash
npm install
Start the development server:

Bash
npm run dev
Open your browser at: http://localhost:5173

📄 License & Copyright
© 2026 Moacir Fernandes. All rights reserved.
