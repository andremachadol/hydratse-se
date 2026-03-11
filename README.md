# Hidrate-se

App mobile de hidratação diária com onboarding guiado, meta automática ou manual, histórico local e lembretes por notificação local. O projeto é 100% client-side: não depende de backend e persiste os dados do usuário no dispositivo com `AsyncStorage`.

## Stack

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript (`strict`)
- `@react-native-async-storage/async-storage`
- `expo-notifications`
- `expo-linear-gradient`
- `expo-av`
- `react-native-svg`

## Fluxo do app

1. `App.tsx` usa `useAppBootstrap.ts` para decidir entre splash, onboarding e dashboard.
2. Sem configuração válida, o app abre `WelcomeScreen.tsx`.
3. O onboarding usa `useOnboardingFlow.ts` e `application/onboardingFlow.ts` para validar entrada, salvar a configuração inicial e tratar casos de início tardio.
4. Com configuração válida, o app abre `HomeScreen.tsx`.
5. `useWaterTracker.ts` concentra a lógica principal do tracker e `useTrackerPersistence.ts` faz carga e persistência do estado.

## Funcionalidades atuais

- Meta automática por peso (`35 ml/kg`) ou meta manual
- Onboarding guiado com modo automático ou manual
- Jornada padrão inicial de `08:00` às `18:00`
- Controle diário com registro de goles
- Sugestão de próximo consumo ao longo da janela do dia
- Sequência diária
- Histórico com filtros de `7`, `14` e `30` dias
- Melhor dia registrado
- Anel de progresso
- Splash animada com áudio
- Ajuste de horários, meta e intervalo de lembretes
- Desfazer último gole e zerar o dia

## Regras de lembrete

- Janela configurável entre `startTime` e `endTime`
- Intervalo de `30` ou `60` minutos
- Agendamento por `DATE` para hoje e amanhã
- Ao bater a meta, o app cancela apenas os lembretes de hoje
- Os lembretes de amanhã continuam agendados
- Ao desativar notificações, o app remove os lembretes gerenciados por ele

## Início tardio no onboarding

Se o usuário finalizar a configuração no meio da janela diária, o app oferece duas opções:

1. Manter a meta normal
2. Ajustar somente a meta de hoje por segurança

Esse ajuste vira um override diário e expira automaticamente no dia seguinte.

## Estrutura principal

```text
.
|-- App.tsx
|-- app.json
|-- eas.json
|-- package.json
|-- src/
|   |-- application/
|   |   |-- appBootstrap.ts
|   |   `-- onboardingFlow.ts
|   |-- components/
|   |   |-- ActionControlsCard.tsx
|   |   |-- AmbientBackdrop.tsx
|   |   |-- DailyGoalSummaryCard.tsx
|   |   |-- HistoryInsightsCard.tsx
|   |   |-- HomeActionSection.tsx
|   |   |-- HomeHeader.tsx
|   |   |-- HydrationInsightCard.tsx
|   |   |-- OnboardingOverviewPanel.tsx
|   |   |-- OnboardingSetupCard.tsx
|   |   |-- ProgressRing.tsx
|   |   `-- RoutineSettingsSheet.tsx
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
|   |   |-- hydrationNotifications.ts
|   |   |-- logger.ts
|   |   `-- storage.ts
|   |-- types/
|   `-- utils/
`-- tests/
```

## Como rodar

### Requisitos

- Node.js com suporte a `--experimental-strip-types`
- npm
- Android Studio ou emulador/dispositivo compatível

### Instalar dependências

```bash
npm install
```

### Desenvolvimento com Metro

```bash
npm run start
```

### Fluxo recomendado no Android Studio

1. Abra a pasta `android/` no Android Studio.
2. Inicie um emulador ou conecte um dispositivo.
3. Na raiz do projeto, rode `npm run start`.
4. No Android Studio, execute o app em `debug`.

Depois da primeira execução, mudanças em `ts`, `tsx` e `js` entram por Fast Refresh.

### Scripts disponíveis

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

## Testes e qualidade

O projeto usa o test runner nativo do Node com TypeScript via `--experimental-strip-types`.

```bash
npm run check
```

Esse comando executa:

- lint
- verificação de formato
- typecheck
- testes automatizados

## CI

- GitHub Actions em `.github/workflows/ci.yml`
- Executa `npm run check` em `push` para `main` e em `pull_request`

## Build

### APK/AAB com EAS

```bash
eas build --platform android --profile preview
eas build --platform android --profile production
```

### Build local Android

Com a pasta `android/` presente, também é possível gerar builds locais com Gradle e Android Studio.

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
