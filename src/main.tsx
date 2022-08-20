import React from 'react';
import { LogBox } from 'react-native';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { StackNavigator } from './stack';

export function Main() {
  LogBox.ignoreLogs(['Warning: componentWillMount']);

  return (
    <PaperProvider
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: '#397AF9',
          accent: "#873df2",
          
        },
      }}
    >
      <StackNavigator />
    </PaperProvider>
  );
}
