import { Alert, Platform } from 'react-native';

export type ConfirmChoice<T> = {
  label: string;
  value: T;
  style?: 'default' | 'cancel' | 'destructive';
};

export type ShowConfirmAsyncOptions<T> = {
  title: string;
  message: string;
  cancelChoice: ConfirmChoice<T>;
  confirmChoice: ConfirmChoice<T>;
};

export const showConfirmAsync = <T>({
  title,
  message,
  cancelChoice,
  confirmChoice,
}: ShowConfirmAsyncOptions<T>): Promise<T> =>
  new Promise((resolve) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`${title}\n\n${message}`);
      resolve(confirmed ? confirmChoice.value : cancelChoice.value);
      return;
    }

    Alert.alert(
      title,
      message,
      [
        {
          text: cancelChoice.label,
          style: cancelChoice.style ?? 'cancel',
          onPress: () => resolve(cancelChoice.value),
        },
        {
          text: confirmChoice.label,
          style: confirmChoice.style,
          onPress: () => resolve(confirmChoice.value),
        },
      ],
      {
        cancelable: false,
      },
    );
  });
