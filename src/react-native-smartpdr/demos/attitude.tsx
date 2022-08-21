import { Accelerometer, Gyroscope, Magnetometer } from 'expo-sensors';
import React, { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import image from '../assets/deviceAttitude.png';
import { useAttitude } from '../utils/customHooks';
import { round } from '../utils/sensors_utils';
import { styles } from '../utils/styles';

export function AttitudeScreen({ navigation }) {
  // Listeners
  const [subscription, setSubscription] = useState(null);
  const [acc, setAcc] = useState({ x: 0, y: 0, z: 0 });
  const [mag, setMag] = useState({ x: 0, y: 0, z: 0 });
  const [gyr, setGyr] = useState({ x: 0, y: 0, z: 0 });

  // Custom Hooks
  const { pitch, roll, yaw } = useAttitude(acc, mag, gyr);

  // Constant declarations
  const dt = 100;

  Accelerometer.setUpdateInterval(dt);
  Magnetometer.setUpdateInterval(dt);
  Gyroscope.setUpdateInterval(dt);

  const _subscribe = () => {
    const sensor = {
      acc: Accelerometer.addListener((data) => {
        setAcc(data);
      }),
      mag: Magnetometer.addListener((data) => {
        setMag(data);
      }),
      gyr: Gyroscope.addListener((data) => {
        setGyr(data);
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

  const deg = (ang) => {
    return round((ang * 180) / Math.PI);
  };

  return (
    <View style={styles.container}>
      <View>
        <Image
          source={image}
          style={{ width: 280, height: 300 }}
        />
      </View>
      <Text style={styles.title}>Attitude</Text>
      <Text style={styles.text}>
        pitch: {deg(pitch)} roll: {deg(roll)} yaw: {deg(yaw)}
      </Text>
      <Text style={styles.title}>Range: (±90°, ±180°, ±180°)</Text>
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
  );
}
