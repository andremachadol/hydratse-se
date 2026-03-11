# Hidrate-se

App mobile de hidratação diária com onboarding simples, meta automática/manual, histórico local e lembretes por notificação local. O projeto é 100% client-side: não depende de backend e persiste os dados do usuário no dispositivo com AsyncStorage.

## Stack

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript (`strict`)
- AsyncStorage
- `expo-notifications`
- `expo-linear-gradient`
- `expo-av`
- `react-native-svg`

## Fluxo do app

1. `App.tsx` usa `useAppBootstrap.ts` para decidir entre splash, onboarding e home.
2. Sem configuração válida, o usuário passa pelo onboarding em `WelcomeScreen.tsx`.
3. O onboarding usa `useOnboardingFlow.ts` e `application/onboardingFlow.ts` para permissão, persistência inicial e regras da configuração.
4. Com configuração válida, o app abre direto em `HomeScreen.tsx`.
5. `useWaterTracker.ts` centraliza o fluxo de hidratação, enquanto `useTrackerPersistence.ts` concentra carga e persistência do tracker.

## Funcionalidades atuais

- Meta automática por peso (`35 ml/kg`) ou meta manual
- Controle diário com registro de goles
- Sequência diária
- Histórico de dias com filtro `7`, `14` e `30`
- Melhor dia registrado
- Anel de progresso
- Splash animada com áudio
- Configuração de janela de hidratação e intervalo de lembretes
- Desfazer último gole e zerar o dia

## Regras de notificação

- Janela configurável com `startTime` até `endTime`
- Intervalo de `30` ou `60` minutos
- Slots começam no `startTime`
- Agendamento por `DATE` para hoje e amanhã
- Ao bater a meta, cancela apenas as notificações de hoje
- As notificações de amanhã continuam agendadas
- Ao desativar notificações, o app remove todos os lembretes gerenciados por ele

## Início tardio no onboarding

Se o usuário finalizar a configuração no meio da janela diária, o app oferece duas opções:

1. Manter a meta normal
2. Ajustar somente a meta de hoje por segurança

Esse ajuste vira um override diário e expira automaticamente no dia seguinte.

## Estrutura

```text
.
|-- App.tsx
|-- app.json
|-- eas.json
|-- eslint.config.mjs
|-- package.json
|-- scripts/
|   `-- release.js
|-- src/
|   |-- application/
|   |   |-- appBootstrap.ts
|   |   `-- onboardingFlow.ts
|   |-- components/
|   |   |-- HomeActionSection.tsx
|   |   |-- HomeGoalCard.tsx
|   |   |-- HomeHeader.tsx
|   |   |-- HomeHistoryCard.tsx
|   |   |-- WelcomeIntroPanel.tsx
|   |   `-- WelcomeSetupPanel.tsx
|   |-- hooks/
|   |   |-- useAppBootstrap.ts
|   |   |-- useHomeDashboard.ts
|   |   |-- useOnboardingFlow.ts
|   |   |-- useTrackerPersistence.ts
|   |   `-- useWaterTracker.ts
|   |-- screens/
|   |   |-- HomeScreen.tsx
|   |   `-- WelcomeScreen.tsx
|   |-- services/
|   |-- types/
|   `-- utils/
`-- tests/
    |-- appBootstrap.test.ts
    |-- onboardingFlow.test.ts
    `-- ...
```

## Como rodar

### Requisitos

- Node.js com suporte a `--experimental-strip-types`
- npm
- Emulador Android/iOS ou dispositivo físico

### Instalar dependências

```bash
npm install
```

### Desenvolvimento

```bash
npm run start
```

Scripts disponíveis:

- `npm run start`
- `npm run android`
- `npm run ios`
- `npm run web`
- `npm run lint`
- `npm run lint:fix`
- `npm run format`
- `npm run format:check`
- `npm run typecheck`
- `npm run test`
- `npm run test:watch`
- `npm run check`

## Testes

O projeto usa o test runner nativo do Node com TypeScript via `--experimental-strip-types`.

```bash
npm run test
```

Modo watch:

```bash
npm run test:watch
```

## Qualidade

```bash
# Lint
npm run lint

# Formato
npm run format:check

# Lint + formato + tipagem + testes
npm run check
```

## CI

- GitHub Actions em `.github/workflows/ci.yml`
- Executa `npm run check` em `push` para `main` e em `pull_request`

## Build

```bash
# Android preview (APK)
eas build --platform android --profile preview

# Produção
eas build --platform android --profile production
```

## Releases

- Fluxo baseado em commits e tags semânticas `vMAJOR.MINOR.PATCH`
- Script de release:
  - `npm run release:patch`
  - `npm run release:minor`
  - `npm run release:major`
- O script atualiza `CHANGELOG.md`, `package.json`, `package-lock.json` e `app.json`
- Guia complementar: `RELEASES.md`

## Licença

MIT
