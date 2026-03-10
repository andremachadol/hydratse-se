# Hidrate-se

App mobile de hidratacao diaria com onboarding simples, meta automatica/manual, historico local e lembretes por notificacao local. O projeto e 100% client-side: nao depende de backend e persiste os dados do usuario no dispositivo com AsyncStorage.

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
1. `App.tsx` exibe a splash e verifica se ja existe configuracao valida salva.
2. Sem configuracao, o usuario passa pelo onboarding em `WelcomeScreen.tsx`.
3. Com configuracao valida, o app abre direto em `HomeScreen.tsx`.
4. O hook `useWaterTracker.ts` centraliza estado, persistencia, normalizacao da virada do dia e sincronizacao das notificacoes.

## Funcionalidades atuais
- Meta automatica por peso (`35 ml/kg`) ou meta manual
- Controle diario com registro de goles
- Streak diaria
- Historico de dias com filtro `7`, `14` e `30`
- Melhor dia registrado
- Anel de progresso
- Splash animada com audio
- Configuracao de janela de hidratacao e intervalo de lembretes
- Desfazer ultimo gole e zerar o dia

## Regras de notificacao
- Janela configuravel com `startTime` ate `endTime`
- Intervalo de `30` ou `60` minutos
- Slots comecam no `startTime`
- Agendamento por `DATE` para hoje e amanha
- Ao bater a meta, cancela apenas as notificacoes de hoje
- As notificacoes de amanha continuam agendadas
- Ao desativar notificacoes, o app remove todos os lembretes gerenciados por ele

## Inicio tardio no onboarding
Se o usuario finalizar a configuracao no meio da janela diaria, o app oferece duas opcoes:
1. Manter a meta normal
2. Ajustar somente a meta de hoje por seguranca

Esse ajuste vira um override diario e expira automaticamente no dia seguinte.

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
- Emulador Android/iOS ou dispositivo fisico

### Instalar dependencias
```bash
npm install
```

### Desenvolvimento
```bash
npm run start
```

Scripts disponiveis:
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

# Producao
eas build --platform android --profile production
```

## Releases
- Fluxo baseado em commits e tags semanticas `vMAJOR.MINOR.PATCH`
- Script de release:
  - `npm run release:patch`
  - `npm run release:minor`
  - `npm run release:major`
- O script atualiza `CHANGELOG.md`, `package.json`, `package-lock.json` e `app.json`
- Guia complementar: `RELEASES.md`

## Licenca
MIT
