import { NavigationContainer, ParamListBase } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Appbar, useTheme } from 'react-native-paper';
import { FeedScreen } from './feed';
import { LocationScreen } from './indoorNavigation/locationScreen';
import { LocationSelectScreen } from './indoorNavigation/locationSelectScreen';

export type Navigation = StackNavigationProp<ParamListBase, string>

function Header({ scene, previous, navigation }) {
  const { options } = scene.descriptor;
  const title = options.headerTitle ?? options.title ?? scene.route.name;
  const theme = useTheme();

  return (
    <Appbar.Header theme={{ colors: { primary: theme.colors.surface } }}>
      {previous ? (
        <Appbar.BackAction
          onPress={navigation.goBack}
          color={theme.colors.primary}
        />
      ) : null}
      <Appbar.Content
        title={
          previous ? title : 'IN: Indoor navigatie POC'
        }
      />
    </Appbar.Header>
  );
}

export function StackNavigator() {
  const Stack = createStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Feed"
        headerMode="screen"
        screenOptions={{
          header: ({ scene, previous, navigation }) => (
            <Header scene={scene} previous={previous} navigation={navigation} />
          ),
        }}
      >
        {Object.entries(StackScreen).map(([rootName, params], idx) => (
          <Stack.Screen key={idx} name={rootName} {...params} />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const StackScreen = {
  Feed: {
    component: FeedScreen,
    options: { headerTitle: 'Feed' }
  },
  Location: {
    component: LocationScreen,
    options: { headerTitle: 'Locatie estimatie' },
  },
  LocationSelect: {
    component: LocationSelectScreen,
    options: { headerTitle: 'Vind een pad' },
  },
};
