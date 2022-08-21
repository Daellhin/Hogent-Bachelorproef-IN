import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Accelerometer, Magnetometer, Gyroscope } from 'expo-sensors';
import { Button } from 'react-native-paper';
import { styles } from '../utils/styles';
import { round } from '../utils/sensors_utils';
import { useHeading } from '../utils/customHooks';

const updateInterval = 50;

export function HeadingDirectionScreen({ navigation }) {
  // Listeners
  const [subscription, setSubscription] = useState(null);
  const [acc, setAcc] = useState({ x: 0, y: 0, z: 0 });
  const [mag, setMag] = useState({ x: 0, y: 0, z: 0 });
  const [gyr, setGyr] = useState({ x: 0, y: 0, z: 0 });

  // Custom Hooks
  const heading = useHeading(acc, mag, gyr);

  // Constant declarations

  const data = round((heading * 180) / Math.PI);

  Accelerometer.setUpdateInterval(updateInterval);
  Magnetometer.setUpdateInterval(updateInterval);
  Gyroscope.setUpdateInterval(updateInterval);

  const _subscribe = () => {
    const sensor = {
      acc: Accelerometer.addListener((e) => {
        setAcc(e);
      }),
      mag: Magnetometer.addListener((e) => {
        setMag(e);
      }),
      gyr: Gyroscope.addListener((e) => {
        setGyr(e);
      }),
    };
    setSubscription(sensor);
  };

  const _unsubscribe = () => {
    subscription.acc.remove();
    subscription.mag.remove();
    subscription.gyr.remove();
    setSubscription(null);
  };

  useEffect(() => {
    _subscribe;
    return () => {
      Accelerometer.removeAllListeners();
      Magnetometer.removeAllListeners();
      Gyroscope.removeAllListeners();
      _unsubscribe;
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.title}>Heading Direction</Text>
        <Text style={styles.text}>{data}</Text>
        <View style={styles.buttonContainer}>
          <Button
            style={styles.button}
            dark={true}
            mode={subscription ? 'contained' : 'outlined'}
            onPress={subscription ? _unsubscribe : _subscribe}
          >
            {subscription ? 'On' : 'Off'}
          </Button>
        </View>
      </View>
    </View>
  );
}
