# 💧 HidrateApp - Seu Assistente Pessoal de Hidratação

![Status do Projeto](https://img.shields.io/badge/Status-Concluído-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)
![React Native](https://img.shields.io/badge/Framework-React_Native-blueviolet)

> "Pequenos goles, grandes mudanças."

O **HidrateApp** é um aplicativo móvel focado em ajudar usuários a manterem hábitos saudáveis de hidratação. Diferente de simples contadores, ele utiliza um algoritmo inteligente que adapta a meta diária baseada no peso do usuário e na jornada de trabalho, além de garantir a integridade dos dados através de tipagem estática rigorosa.

---

## 📱 Funcionalidades Principais

✅ **Meta Inteligente:** Calculadora integrada que define a meta ideal baseada no peso corporal (35ml/kg).
✅ **Anel de Progresso:** Visualização gráfica animada (SVG) do consumo diário em tempo real.
✅ **Lembretes Automáticos:** Sistema de notificações locais que lembra o usuário de beber água a cada hora.
✅ **Histórico Blindado:** Controle de datas em formato ISO (YYYY-MM-DD) para evitar erros de fuso horário ou idioma.
✅ **Modo Foco:** Ajuste de meta dinâmica baseada nas horas de trabalho do dia.
✅ **Arquitetura Robusta:** Código totalmente tipado (TypeScript) para maior segurança e escalabilidade.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi refatorado para seguir os padrões mais modernos de desenvolvimento mobile:

* **Linguagem:** [TypeScript](https://www.typescriptlang.org/) (Tipagem Estática)
* **Core:** [React Native](https://reactnative.dev/) (Expo SDK)
* **Gerenciamento de Estado:** React Hooks (Custom Hooks)
* **Armazenamento Local:** `@react-native-async-storage/async-storage`
* **Gráficos e Animações:** `react-native-svg` e `Animated API`
* **Notificações:** `expo-notifications`
* **Design:** `expo-linear-gradient` e `lucide-react-native`

---

## 📂 Arquitetura do Projeto

O código segue uma estrutura modular, separando responsabilidades e definições de tipos:

```text
HidrateApp/
├── src/
│   ├── components/      # Componentes Visuais (.tsx)
│   │   ├── DrinkControls.tsx
│   │   ├── ProgressRing.tsx
│   │   └── SettingsModal.tsx
│   ├── hooks/           # Lógica de Negócio (.ts)
│   │   └── useWaterTracker.ts
│   ├── types/           # Definições de Tipos e Interfaces (.ts)
│   │   └── index.ts
│   ├── utils/           # Funções Auxiliares (.ts)
│   │   └── notifications.ts
│   └── constants/       # Temas e Textos Globais (.ts)
├── App.tsx              # Ponto de Entrada
├── tsconfig.json        # Configuração do TypeScript
└── README.md            # Documentação
🚀 Como Rodar o Projeto
Pré-requisitos: Tenha o Node.js e o aplicativo Expo Go (no celular) instalados.

Clone o repositório (ou baixe os arquivos):

Bash
git clone [https://github.com/SEU-USUARIO/hidrate-app.git](https://github.com/SEU-USUARIO/hidrate-app.git)
Instale as dependências:

Bash
npm install
# ou
yarn install
Inicie o servidor de desenvolvimento:

Bash
npx expo start
No Celular:

Escaneie o QR Code que aparecerá no terminal usando o app Expo Go.

🧪 Próximos Passos (Roadmap)

[ ] Implementar Gamificação (Conquistas e Medalhas)

[ ] Adicionar suporte a Temas (Modo Escuro/Claro)