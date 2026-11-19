import { useCallback } from 'react';
import { message } from 'antd';
import { useCopyToClipboard as useSharedCopyToClipboard } from '@/shared/hooks/useCopyToClipboard';

export function useCopyToClipboard(resetDelayMs = 2000) {
  const { copied, copy } = useSharedCopyToClipboard(resetDelayMs);

  const copyWithFeedback = useCallback(
    async (text: string, successMsg?: string) => {
      const succeeded = await copy(text);
      if (succeeded && successMsg) {
        message.success(successMsg);
      }
      return succeeded;
    },
    [copy]
  );

  return { copied, copy: copyWithFeedback };
}
