# Hidrate-se

App mobile para acompanhamento de hidratacao diaria, com foco em rotina real, lembretes locais e UX simples.

## Stack
- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript (strict)
- AsyncStorage
- expo-notifications
- react-native-svg
- expo-linear-gradient
- expo-av

## Funcionalidades
- Meta automatica por peso (`35 ml/kg`) ou meta manual
- Controle de consumo diario com historico de goles
- Streak diario (sequencia de dias)
- Anel de progresso
- Splash animada com audio
- Notificacoes locais com janela configuravel

## Regras de notificacao (atual)
- Janela do usuario: `startTime` ate `endTime`
- Intervalo: `30` ou `60` minutos
- Slots comecam no `startTime` (nao perde a primeira janela)
- Agendamento por `DATE` para hoje e amanha
- Ao bater meta: cancela somente notificacoes de hoje
- Amanhana continua garantido mesmo sem abrir o app
- Se notificacoes forem desativadas: remove todas as notificacoes de hidratacao gerenciadas pelo app

## Inicio tardio no onboarding
- Se o usuario configurar no meio da janela diaria, o app oferece duas opcoes:
1. Manter meta normal
2. Ajustar somente a meta de hoje por seguranca
- Esse ajuste vira um override diario e expira automaticamente no dia seguinte

## Estrutura
```text
src/
  components/
    DrinkControls.tsx
    ErrorBoundary.tsx
    HydrationTips.tsx
    ProgressRing.tsx
    SettingsModal.tsx
    SplashAnimation.tsx
    WelcomeModeCard.tsx
  constants/
    config.ts
    theme.ts
  hooks/
    useWaterTracker.ts
  screens/
    HomeScreen.tsx
    WelcomeScreen.tsx
  services/
    hydrationNotifications.ts
    logger.ts
    storage.ts
  types/
    index.ts
  utils/
    dailyGoal.ts
    notifications.ts
    onboarding.ts
    progress.ts
    reminderSlots.ts
    time.ts
    waterTrackerDomain.ts
tests/
  dailyGoal.test.ts
  notifications.test.ts
  onboarding.test.ts
  progress.test.ts
  waterTrackerDomain.test.ts
```

## Como rodar

### Requisitos
- Node.js 18+
- npm
- Emulador Android/iOS (Android Studio/Xcode) ou dispositivo fisico

### Instalar
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
- `npm run check`

## Testes
Este projeto usa o test runner nativo do Node com TypeScript via `--experimental-strip-types`.

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

# Checagem completa (tipagem + testes)
npm run check
```

## Build
```bash
# Android preview (APK)
eas build --platform android --profile preview

# Producao
eas build --platform android --profile production
```

## Versionamento e releases
- Fluxo baseado em commits e tags semanticas (`vMAJOR.MINOR.PATCH`)
- Scripts:
  - `npm run release:patch`
  - `npm run release:minor`
  - `npm run release:major`
- Guia completo:
  - `RELEASES.md`

## Licenca
MIT
