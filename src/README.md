# 💧 HidrateApp - Seu Assistente Pessoal de Hidratação

![Status do Projeto](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)
![React Native](https://img.shields.io/badge/React_Native-Expo-blueviolet)

> "Pequenos goles, grandes mudanças."

O **HidrateApp** é um aplicativo móvel focado em ajudar usuários a manterem hábitos saudáveis de hidratação. Diferente de simples contadores, ele utiliza um algoritmo inteligente que adapta a meta diária baseada no peso do usuário e na jornada de trabalho (horas de foco), além de permitir o controle total sobre o histórico de consumo.

---

## 📱 Funcionalidades Principais

✅ **Meta Inteligente:** Calculadora integrada que define a meta ideal baseada no peso corporal (35ml/kg).
✅ **Anel de Progresso:** Visualização gráfica animada (SVG) do consumo diário em tempo real.
✅ **Lembretes Automáticos:** Sistema de notificações locais que lembra o usuário de beber água a cada hora.
✅ **Histórico Flexível:** Botão de "Desfazer" para corrigir registros errados e função "Zerar Dia".
✅ **Modo Foco:** Ajuste de meta dinâmica baseada nas horas de trabalho do dia.
✅ **Persistência de Dados:** O app salva todo o progresso localmente, mantendo os dados mesmo se fechar o aplicativo.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi reestruturado para seguir os padrões modernos de arquitetura de software (Clean Architecture / Hooks Pattern).

* **Core:** [React Native](https://reactnative.dev/) (Expo SDK)
* **Linguagem:** JavaScript (ES6+)
* **Armazenamento Local:** `@react-native-async-storage/async-storage`
* **Gráficos e Animações:** `react-native-svg` e `Animated API`
* **Notificações:** `expo-notifications`
* **Design:** `expo-linear-gradient` e `lucide-react-native` (Ícones)

---

## 📂 Arquitetura do Projeto

O código foi refatorado de um modelo monolítico para uma estrutura modular e escalável:

```text
HidrateApp/
├── src/
│   ├── components/      # Peças visuais reutilizáveis (Botões, Gráficos, Modais)
│   ├── hooks/           # Lógica de negócio e regras de estado (Custom Hooks)
│   ├── utils/           # Funções auxiliares e configurações (Notificações)
│   ├── constants/       # Textos, Cores e temas globais
│   └── screens/         # (Reservado para futuras telas de navegação)
├── App.js               # Ponto de entrada (Limpo e Declarativo)
└── README.md            # Documentação do projeto

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