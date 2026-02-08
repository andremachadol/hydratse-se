# Hydrate-se 💧 Seu Assistente Pessoal de Hidratação

![Status do Projeto](https://img.shields.io/badge/Status-Concluído-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)
![React Native](https://img.shields.io/badge/Framework-React_Native-blueviolet)
![Expo](https://img.shields.io/badge/Expo-SDK_54-000020)

> "Pequenos goles, grandes mudanças."

O **Hydrate-se 💧** é um aplicativo móvel focado em ajudar usuários a manterem hábitos saudáveis de hidratação. Diferente de simples contadores, ele utiliza um algoritmo inteligente que adapta a meta diária baseada no peso do usuário e na jornada de trabalho, além de garantir a integridade dos dados através de tipagem estática rigorosa.

---

## 🎬 Demo

https://github.com/user-attachments/assets/f5dfa5de-b467-4e9c-8b18-9a581f73f8ef

---

## 📱 Funcionalidades Principais

- **Splash Animada:** Tela de carregamento com animação de enchimento de copo e efeito sonoro, com duração inteligente que se adapta ao tempo de carregamento do dispositivo
- **Meta Inteligente:** Calculadora integrada que define a meta ideal baseada no peso corporal (35ml/kg)
- **Anel de Progresso:** Visualização gráfica animada (SVG) do consumo diário em tempo real
- **Lembretes Personalizados:** Notificações locais baseadas na sua jornada (horário de acordar/dormir e intervalo)
- **Histórico Blindado:** Controle de datas em formato ISO (YYYY-MM-DD) para evitar erros de fuso horário
- **Modo Infinito:** Continue registrando água mesmo após bater a meta diária
- **Streak (Sequência):** Acompanhe quantos dias consecutivos você manteve a hidratação
- **Acessibilidade:** Labels e hints para leitores de tela
- **Validação Robusta:** Peso (20-650kg), horários e dados persistidos validados

---

## 🛠️ Tecnologias Utilizadas

| Categoria | Tecnologia |
|-----------|------------|
| Linguagem | TypeScript 5.9 |
| Framework | React Native 0.81 + Expo SDK 54 |
| Estado | React Hooks (Custom Hook `useWaterTracker`) |
| Armazenamento | AsyncStorage com abstração de serviço |
| Gráficos | react-native-svg |
| Notificações | expo-notifications |
| UI | expo-linear-gradient |
| Áudio | expo-av |

---

## 📂 Arquitetura do Projeto

```
src/
├── components/          # Componentes visuais (memoizados)
│   ├── DrinkControls.tsx
│   ├── ErrorBoundary.tsx
│   ├── HydrationTips.tsx
│   ├── ProgressRing.tsx
│   ├── SettingsModal.tsx
│   └── SplashAnimation.tsx  # Splash screen animada com som
├── constants/
│   ├── config.ts        # Configurações centralizadas (pesos, intervalos, etc.)
│   └── theme.ts         # Cores e estilos globais
├── hooks/
│   └── useWaterTracker.ts  # Lógica principal de estado
├── screens/
│   └── HomeScreen.tsx   # Tela principal
├── services/
│   ├── logger.ts        # Logging estruturado
│   └── storage.ts       # Abstração do AsyncStorage
├── types/
│   └── index.ts         # Interfaces TypeScript
└── utils/
    └── notifications.ts # Agendamento de notificações

assets/
└── sounds/
    └── filling.mp3       # Efeito sonoro da splash screen

App.tsx                  # Ponto de entrada com ErrorBoundary
```

### Padrões Arquiteturais

- **Storage Service:** Abstração sobre AsyncStorage para facilitar troca futura de backend
- **Config Centralizada:** Valores mágicos (35ml/kg, limites, etc.) em arquivo único
- **Logger Service:** Logs estruturados para debug e monitoramento
- **Error Boundary:** Captura de erros com tela amigável
- **Memoização:** Componentes otimizados com `React.memo`

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- Node.js 18+
- Expo Go (no celular) ou emulador Android/iOS

### Instalação

```bash
# Clone o repositório
git clone https://github.com/andremachadol/hydratse-se.git

# Entre na pasta
cd hydratse-se

# Instale as dependências
npm install

# Inicie o servidor
npx expo start
```

### Executar

- **Celular:** Escaneie o QR Code com o app Expo Go
- **Android:** Pressione `a` no terminal
- **iOS:** Pressione `i` no terminal
- **Web:** Pressione `w` no terminal

### Build de Produção

```bash
# APK para teste (Android)
eas build --platform android --profile preview

# Build de produção
eas build --platform android --profile production
```

---

## ⚙️ Configuração

O app usa as seguintes constantes (editáveis em `src/constants/config.ts`):

| Constante | Valor | Descrição |
|-----------|-------|-----------|
| `ML_PER_KG` | 35 | ml de água por kg de peso |
| `MIN_WEIGHT` | 20 | Peso mínimo aceito (kg) |
| `MAX_WEIGHT` | 650 | Peso máximo aceito (kg) |
| `HEALTH_WARNING_WEIGHT` | 200 | Peso que dispara alerta de saúde |
| `DEFAULT_INTERVAL_MINUTES` | 60 | Intervalo padrão entre lembretes |

---

## 🧪 Roadmap

- [ ] Gamificação (Conquistas e Medalhas)
- [ ] Modo Escuro/Claro
- [ ] Histórico semanal/mensal com gráficos
- [ ] Sincronização com nuvem
- [ ] Widget para tela inicial

---

## 🎵 Créditos

- Efeito sonoro da splash screen por [Universfield](https://pixabay.com/users/universfield-28281460/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=191999) via [Pixabay](https://pixabay.com/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=191999)

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido com 💧 por [André Machado](https://github.com/andremachadol)
