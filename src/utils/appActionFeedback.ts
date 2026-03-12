import { DEFAULT_WARNING_TITLE } from '../constants/interactionDescriptors.ts';
import type { AppActionResult } from '../types/index.ts';
import { collapseNotices, mergeErrorMessageWithNotices } from '../hooks/noticeHelpers.ts';

type PresentFeedbackDialog = (
  title: string,
  message: string,
  acknowledgeLabel?: string,
) => Promise<void>;

type PresentAppActionFeedbackOptions = {
  presentDialog: PresentFeedbackDialog;
  onSuccess?: () => void;
  successAcknowledgeLabel?: string;
  warningTitle?: string;
};

export const presentAppActionFeedback = async (
  result: AppActionResult,
  {
    presentDialog,
    onSuccess,
    successAcknowledgeLabel,
    warningTitle = DEFAULT_WARNING_TITLE,
  }: PresentAppActionFeedbackOptions,
): Promise<boolean> => {
  if (result.warningMessage) {
    await presentDialog(warningTitle, result.warningMessage);
  }

  if (!result.ok) {
    await presentDialog(
      result.errorTitle,
      mergeErrorMessageWithNotices(result.errorMessage, result.notices),
    );
    return false;
  }

  const collapsedNotices = collapseNotices(result.notices);
  if (collapsedNotices) {
    await presentDialog(collapsedNotices.title, collapsedNotices.message, successAcknowledgeLabel);
  }

  onSuccess?.();
  return true;
};
