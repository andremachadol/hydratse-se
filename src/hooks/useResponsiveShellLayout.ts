import { useWindowDimensions } from 'react-native';

export type ResponsiveShellTier = 'compact' | 'medium' | 'expanded';

type UseResponsiveShellLayoutOptions = {
  compactMaxWidth: number;
  mediumMaxWidth: number;
  expandedMaxWidth: number;
  mediumMinWidth?: number;
  expandedMinWidth?: number;
};

export const useResponsiveShellLayout = ({
  compactMaxWidth,
  mediumMaxWidth,
  expandedMaxWidth,
  mediumMinWidth = 600,
  expandedMinWidth = 840,
}: UseResponsiveShellLayoutOptions) => {
  const { width } = useWindowDimensions();
  const isExpanded = width >= expandedMinWidth;
  const isMedium = width >= mediumMinWidth && width < expandedMinWidth;

  const tier: ResponsiveShellTier = isExpanded ? 'expanded' : isMedium ? 'medium' : 'compact';
  const shellMaxWidth = isExpanded ? expandedMaxWidth : isMedium ? mediumMaxWidth : compactMaxWidth;

  return {
    width,
    tier,
    isExpanded,
    isMedium,
    shellMaxWidth,
  };
};
