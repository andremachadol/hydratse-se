// App.tsx
import React, { useState, useEffect } from 'react';
import HomeScreen from './src/screens/HomeScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import SplashAnimation from './src/components/SplashAnimation';
import ErrorBoundary from './src/components/ErrorBoundary';
import * as Storage from './src/services/storage';

export default function App() {
  // Estado 1: Splash terminou a animação visual?
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  
  // Estado 2: Sabemos se o usuário já tem config? (null = verificando)
  const [hasConfig, setHasConfig] = useState<boolean | null>(null);

  useEffect(() => {
    checkConfig();
  }, []);

  const checkConfig = async () => {
    try {
      const config = await Storage.loadConfig();
      setHasConfig(!!config);
    } catch (e) {
      console.error(e);
      setHasConfig(false); // Na dúvida, joga pro Welcome
    }
  };

  // --- CENA 1: SPLASH SCREEN ---
  // Roda enquanto a animação não acabar OU enquanto não soubermos se tem config
  if (!isSplashFinished || hasConfig === null) {
    return (
      <SplashAnimation 
        // Avisa a animação: "Pode sair quando quiser?" (Só se já carregamos os dados)
        isLoading={hasConfig === null} 
        onFinish={() => setIsSplashFinished(true)} 
      />
    );
  }

  return (
    <ErrorBoundary>
      {/* --- CENA 2: DECISÃO --- */}
      {!hasConfig ? (
        // Se não tem config -> Tela de Boas Vindas (Seleção Auto/Manual)
        <WelcomeScreen 
          onFinish={() => setHasConfig(true)} // Quando terminar o setup, vai pra Home
        />
      ) : (
        // Se já tem config -> Home Direto
        <HomeScreen />
      )}
    </ErrorBoundary>
  );
}