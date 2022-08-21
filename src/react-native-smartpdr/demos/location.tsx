import { Accelerometer, Gyroscope, Magnetometer } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, View } from 'react-native';
import Canvas from 'react-native-canvas';
import { useHeading, useStepLength } from '../utils/customHooks';
import { range } from '../utils/sensors_utils';

export function LocationScreen({ navigation }) {
  // Listeners
  const [acc, setAcc] = useState({ x: 0, y: 0, z: 0 });
  const [mag, setMag] = useState({ x: 0, y: 0, z: 0 });
  const [gyr, setGyr] = useState({ x: 0, y: 0, z: 0 });
  const canvasRef = useRef(null);
  const [lineWidth, setLineWidth] = useState({ val: 2.5, sum: 0.2 });
  const [location, setLocation] = useState({ x: 0, y: 0 });

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
    Accelerometer.addListener((data) => {
      setAcc(data);
    });
    Magnetometer.addListener((data) => {
      setMag(data);
    });
    Gyroscope.addListener((data) => {
      setGyr(data);
    });
    _handleCanvas(canvasRef.current);
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
    _handleCanvas(canvasRef.current);
  }, [heading]);

  useEffect(() => {
    let nx = stepLength ? stepLength * Math.sin(headingStep) * 10 : 0,
      ny = stepLength ? stepLength * Math.cos(headingStep) * 10 : 0;
    setLocation((l) => ({
      x: l.x ? l.x + nx : windowWidth / 2,
      y: l.y ? l.y - ny : windowHeight / 2,
    }));
    _handleCanvas(canvasRef.current);
  }, [stepLength]);

  const _handleCanvas = (canvas) => {
    canvas.width = windowWidth;
    canvas.height = windowHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    _current_user(ctx, location.x, location.y);
  };

  const _current_user = (ctx, x, y) => {
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
      <Canvas ref={canvasRef} />
    </View>
  );
}