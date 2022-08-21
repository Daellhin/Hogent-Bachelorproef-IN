import { Accelerometer, Gyroscope, Magnetometer } from 'expo-sensors';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useCompassHeading, useHeading } from '../utils/customHooks';
import { round } from '../utils/sensors_utils';
import { styles } from '../utils/styles';
import { radiansToDegrees } from '../../utils/mathUtils';

const updateInterval = 100;

export function CompassScreen({ navigation }) {
	// Listeners
	const [subscription, setSubscription] = useState(null);
	const [acc, setAcc] = useState({ x: 0, y: 0, z: 0 });
	const [mag, setMag] = useState({ x: 0, y: 0, z: 0 });
	const [gyr, setGyr] = useState({ x: 0, y: 0, z: 0 });

	// Custom Hooks
	const heading = useHeading(acc, mag, gyr);
	const compassHeading = useCompassHeading(mag);

	const headingData = round(radiansToDegrees(heading));
	const compassHeadingData = round(radiansToDegrees(compassHeading));

	Accelerometer.setUpdateInterval(updateInterval);
	Magnetometer.setUpdateInterval(updateInterval);
	Gyroscope.setUpdateInterval(updateInterval);

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

	return (
		<View style={styles.container}>
			<View style={styles.container}>
				<Text style={styles.title}>Compass Direction</Text>
				<Text style={styles.text}>{compassHeadingData}</Text>

				<Text style={styles.title}>Heading Direction</Text>
				<Text style={styles.text}>{headingData}</Text>
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
