import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Dimensions, View, Text } from 'react-native';
import { Accelerometer, Magnetometer, Gyroscope } from 'expo-sensors';
import Canvas, { CanvasRenderingContext2D, Image } from 'react-native-canvas';
import { Asset } from 'expo-asset';


// custom modules
import { range } from '../utils/sensors_utils';
import { useHeading, useStepLength } from '../utils/customHooks';

export function LocationScreen({ navigation }) {
	// Listeners
	const [acc, setAcc] = useState({ x: 0, y: 0, z: 0 });
	const [mag, setMag] = useState({ x: 0, y: 0, z: 0 });
	const [gyr, setGyr] = useState({ x: 0, y: 0, z: 0 });
	const canvasRef = useRef(null);
	const [lineWidth, setLineWidth] = useState({ val: 2.5, sum: 0.2 });
	const [location, setLocation] = useState({ x: 0, y: 0 });

	const image = useMemo(() => {
		if (canvasRef.current) {
			const map = Asset.fromModule(require('../../assets/firecommit_icon.png'))
			const image = new Image(canvasRef.current);
			image.src = map.uri;
			return image;
		}
	}, [canvasRef.current]);

	// Custom Hooks
	const heading = useHeading(acc, mag, gyr);
	const [stepLength, headingStep] = useStepLength(acc, mag, gyr);

	// Constant declarations
	const dt = 100;
	const windowWidth = Dimensions.get('window').width;
	const windowHeight = Dimensions.get('window').height - 64;

	Accelerometer.setUpdateInterval(dt);
	Magnetometer.setUpdateInterval(dt);
	Gyroscope.setUpdateInterval(dt);

	useEffect(() => {
		// TEMP: start location in midle of screen
		setLocation({ x: windowWidth / 2, y: windowHeight / 2 });

		Accelerometer.addListener((data) => {
			setAcc(data);
		});
		Magnetometer.addListener((data) => {
			setMag(data);
		});
		Gyroscope.addListener((data) => {
			setGyr(data);
		});
		handleCanvas(canvasRef.current);
		return () => {
			Accelerometer.removeAllListeners();
			Magnetometer.removeAllListeners();
			Gyroscope.removeAllListeners();
		};
	}, [navigation]);

	useEffect(() => {
		if (lineWidth.val > 5 || lineWidth.val < 2.5) {
			setLineWidth((lw) => ({ ...lw, sum: -lw.sum }));
		}
		setLineWidth((lw) => ({ ...lw, val: lw.val + lw.sum }));
		handleCanvas(canvasRef.current);
	}, [heading]);

	useEffect(() => {
		let nx = stepLength ? stepLength * Math.sin(headingStep) * 10 : 0;
		let ny = stepLength ? stepLength * Math.cos(headingStep) * 10 : 0;
		setLocation((previous) => ({ x: previous.x + nx, y: previous.y - ny }));
		handleCanvas(canvasRef.current);
	}, [stepLength]);

	const handleCanvas = (canvas: Canvas) => {
		canvas.width = windowWidth;
		canvas.height = windowHeight;
		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		if (image)
			ctx.drawImage(image, 0, 0);
		currentUser(ctx, location.x, location.y);
	};

	const currentUser = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
		// user around field
		ctx.beginPath();
		ctx.fillStyle = 'rgba(252, 129, 50, 0.1)';
		ctx.strokeStyle = 'fc8132';
		ctx.lineWidth = 0.3;
		ctx.arc(x, y, 40, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
		
		// user heading direction
		ctx.beginPath();
		ctx.fillStyle = 'rgba(252, 129, 50, 0.3)';
		ctx.arc(
			x,
			y,
			55,
			range(heading - Math.PI / 2 - (20 * Math.PI) / 180, '2PI'),
			range(heading - Math.PI / 2 + (20 * Math.PI) / 180, '2PI'),
			false
		);
		ctx.lineTo(x, y);
		ctx.fill();
		ctx.closePath();
		// shadow #1
		ctx.shadowColor = 'gray';
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
		ctx.shadowBlur = 10;
		// user circle
		ctx.beginPath();
		ctx.fillStyle = 'fc8132';
		ctx.strokeStyle = 'white';
		ctx.lineWidth = lineWidth.val;
		ctx.arc(x, y, 10, 0, 2 * Math.PI, false);
		ctx.fill();
		// shadow #2
		ctx.shadowColor = 'gray';
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
		ctx.shadowBlur = 0;
		// user circle stroke
		ctx.stroke();
		ctx.closePath();
	};

	return (
		<View style={{ flex: 1, backgroundColor: '#B9B9B9' }}>
			<Text>{headingStep} te</Text>
			<Canvas ref={canvasRef} />
		</View>
	);
}
