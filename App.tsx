import React from 'react';
import HomeScreen from './src/screens/HomeScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import SplashAnimation from './src/components/SplashAnimation';
import ErrorBoundary from './src/components/ErrorBoundary';
import { useAppBootstrap } from './src/hooks/useAppBootstrap';

export default function App() {
  const { hasConfig, isLoadingConfig, isSplashFinished, finishSplash, finishOnboarding } =
    useAppBootstrap();

  if (!isSplashFinished || isLoadingConfig) {
    return <SplashAnimation isLoading={isLoadingConfig} onFinish={finishSplash} />;
  }

  return (
    <ErrorBoundary>
      {!hasConfig ? <WelcomeScreen onFinish={finishOnboarding} /> : <HomeScreen />}
    </ErrorBoundary>
  );
}
