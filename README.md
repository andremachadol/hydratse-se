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
1. `App.tsx` exibe a splash e verifica se já existe configuração válida salva.
2. Sem configuração, o usuário passa pelo onboarding em `WelcomeScreen.tsx`.
3. Com configuração válida, o app abre direto em `HomeScreen.tsx`.
4. O hook `useWaterTracker.ts` centraliza estado, persistência, normalização da virada do dia e sincronização das notificações.

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
|-- index.js
|-- app.json
|-- eas.json
|-- scripts/
|   `-- release.js
|-- src/
|   |-- components/
|   |   |-- DrinkControls.tsx
|   |   |-- ErrorBoundary.tsx
|   |   |-- HydrationTips.tsx
|   |   |-- ProgressRing.tsx
|   |   |-- SettingsModal.tsx
|   |   |-- SplashAnimation.tsx
|   |   `-- WelcomeModeCard.tsx
|   |-- constants/
|   |   |-- config.ts
|   |   `-- theme.ts
|   |-- hooks/
|   |   `-- useWaterTracker.ts
|   |-- screens/
|   |   |-- HomeScreen.tsx
|   |   `-- WelcomeScreen.tsx
|   |-- services/
|   |   |-- hydrationNotifications.ts
|   |   |-- logger.ts
|   |   `-- storage.ts
|   |-- types/
|   |   `-- index.ts
|   `-- utils/
|       |-- configValidation.ts
|       |-- dailyGoal.ts
|       |-- dayHistory.ts
|       |-- notifications.ts
|       |-- onboarding.ts
|       |-- progress.ts
|       |-- reminderSlots.ts
|       |-- time.ts
|       `-- waterTrackerDomain.ts
`-- tests/
    |-- configValidation.test.ts
    |-- dailyGoal.test.ts
    |-- dayHistory.test.ts
    |-- notifications.test.ts
    |-- onboarding.test.ts
    |-- progress.test.ts
    `-- waterTrackerDomain.test.ts
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
# Tipagem
npm run typecheck

# Tipagem + testes
npm run check
```

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
