import type { UserConfig } from '../types/index.ts';
import { hasCompleteUserConfig } from '../utils/configValidation.ts';

type ResolveStoredConfigPresenceDependencies = {
  loadConfig: () => Promise<Partial<UserConfig> | null>;
};

export const resolveStoredConfigPresence = async ({
  loadConfig,
}: ResolveStoredConfigPresenceDependencies): Promise<boolean> => {
  try {
    const config = await loadConfig();
    return hasCompleteUserConfig(config);
  } catch {
    return false;
  }
};
