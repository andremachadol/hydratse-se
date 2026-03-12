import { DEFAULT_ACKNOWLEDGE_LABEL } from '../constants/interactionDescriptors.ts';
import { Alert, Platform } from 'react-native';

export const showAlertAsync = (
  title: string,
  message: string,
  acknowledgeLabel = DEFAULT_ACKNOWLEDGE_LABEL,
): Promise<void> =>
  new Promise((resolve) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
      resolve();
      return;
    }

    Alert.alert(
      title,
      message,
      [
        {
          text: acknowledgeLabel,
          onPress: () => resolve(),
        },
      ],
      {
        cancelable: false,
      },
    );
  });
