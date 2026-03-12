import type { CalculationMode } from '../types/index.ts';

type OnboardingModeOptionCopy = {
  mode: CalculationMode;
  eyebrow: string;
  title: string;
  description: string;
};

type OnboardingSetupModeCopy = {
  title: string;
  summary: string;
};

export const ROUTINE_SETTINGS_COPY = {
  headerEyebrow: 'Ajustes da rotina',
  headerTitle: 'Refine sua hidrata\u00e7\u00e3o',
  closeButtonLabel: 'Fechar',
  modeSectionTitle: 'Modo de c\u00e1lculo',
  modeOptions: {
    auto: 'Autom\u00e1tico',
    manual: 'Manual',
  } as Record<CalculationMode, string>,
  weightLabel: 'Seu peso (kg)',
  weightPlaceholder: 'Ex: 70,5',
  autoGoalLabel: 'Meta estimada',
  manualGoalLabel: 'Meta di\u00e1ria (ml)',
  manualGoalPlaceholder: '3000',
  manualCupLabel: 'Copo ou garrafa (ml)',
  manualCupPlaceholder: '500',
  remindersTitle: 'Lembretes',
  remindersDescription: 'Ative para manter a rotina distribu\u00edda ao longo do dia.',
  startTimeLabel: 'In\u00edcio do dia',
  startTimePlaceholder: '08:00',
  endTimeLabel: 'Fim do dia',
  endTimePlaceholder: '18:00',
  intervalLabel: 'Intervalo entre lembretes',
  intervalUnit: 'min',
  cancelButtonLabel: 'Cancelar',
  saveButtonLabel: 'Salvar ajustes',
};

export const ONBOARDING_OVERVIEW_COPY: {
  heroEyebrow: string;
  title: string;
  subtitle: string;
  benefits: string[];
  modeOptions: OnboardingModeOptionCopy[];
} = {
  heroEyebrow: 'Primeira configura\u00e7\u00e3o',
  title: 'Monte sua rotina de hidrata\u00e7\u00e3o',
  subtitle:
    'Escolha como a meta ser\u00e1 definida. Voc\u00ea pode ajustar hor\u00e1rios, lembretes e formato depois.',
  benefits: ['Meta clara', 'Lembretes seguros', 'Hist\u00f3rico simples'],
  modeOptions: [
    {
      mode: 'auto',
      eyebrow: 'Peso',
      title: 'Autom\u00e1tico',
      description:
        'Calcula uma meta base a partir do seu peso e mant\u00e9m a rotina mais simples.',
    },
    {
      mode: 'manual',
      eyebrow: 'Livre',
      title: 'Manual',
      description:
        'Voc\u00ea define a meta e o tamanho do copo para seguir sua estrat\u00e9gia atual.',
    },
  ],
};

export const ONBOARDING_SETUP_COPY: {
  formEyebrow: string;
  modes: Record<CalculationMode, OnboardingSetupModeCopy>;
  auto: {
    weightLabel: string;
    weightPlaceholder: string;
    previewLabel: string;
    previewEmpty: string;
  };
  manual: {
    goalLabel: string;
    goalPlaceholder: string;
    cupLabel: string;
    cupPlaceholder: string;
  };
  summaryTitle: string;
  summaryWindowPrefix: string;
  summaryWindowSeparator: string;
  summaryReminderPrefix: string;
  summaryReminderSuffix: string;
  startButtonLabel: string;
  startButtonCaption: string;
  accessoryDoneLabel: string;
} = {
  formEyebrow: 'Configura\u00e7\u00e3o inicial',
  modes: {
    auto: {
      title: 'Informe seu peso',
      summary: 'A meta ser\u00e1 recalculada a partir do peso informado.',
    },
    manual: {
      title: 'Defina sua meta manual',
      summary: 'Voc\u00ea define a meta di\u00e1ria e o tamanho base de cada registro.',
    },
  },
  auto: {
    weightLabel: 'Qual seu peso (kg)?',
    weightPlaceholder: 'Ex: 70,5',
    previewLabel: 'Meta estimada',
    previewEmpty: 'Preencha o peso',
  },
  manual: {
    goalLabel: 'Meta di\u00e1ria (ml)',
    goalPlaceholder: 'Ex: 3000',
    cupLabel: 'Tamanho do copo ou garrafa (ml)',
    cupPlaceholder: 'Ex: 500',
  },
  summaryTitle: 'Ajustes padr\u00e3o',
  summaryWindowPrefix: 'Janela inicial:',
  summaryWindowSeparator: '\u00e0s',
  summaryReminderPrefix: 'Lembretes a cada',
  summaryReminderSuffix: 'min, se a permiss\u00e3o for concedida',
  startButtonLabel: 'Come\u00e7ar jornada',
  startButtonCaption: 'Voc\u00ea pode revisar tudo nas configura\u00e7\u00f5es depois.',
  accessoryDoneLabel: 'Conclu\u00eddo',
};
