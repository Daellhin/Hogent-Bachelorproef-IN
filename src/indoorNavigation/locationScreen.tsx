import { AntDesign } from '@expo/vector-icons';
import { Accelerometer, Gyroscope, Magnetometer } from 'expo-sensors';
import fromJSON, { JsonGraph, JsonNode } from 'ngraph.fromjson';
import { NodeId } from 'ngraph.graph';
import toJSON from 'ngraph.tojson';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { Circle, Image, Path } from 'react-native-svg';
import SvgPanZoom from 'react-native-svg-pan-zoom';
import floorplan from '../../assets/Floorplan.png';
import { useCompassHeading, useStepLength } from '../react-native-smartpdr/utils/customHooks';
import { range } from '../react-native-smartpdr/utils/sensors_utils';
import { Navigation } from '../stack';
import { graphJsonString } from '../utils/constants';
import { degreesToRadians, radiansToDegrees } from '../utils/mathUtils';
import { createGraphFromPathNodes, createNavigableNodes, createPathFinder } from '../utils/ngraphUtils';
import { describeArc } from '../utils/svgUtils';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height - 64;

const updateInterval = 2000;
const arcAngle = degreesToRadians(80 / 2); // The 'width' of the arc
const xOffset = 55;
const yOffset = 0;
const locationScale = 0.3;
const indicatorScale = 1.5;
const stepScale = 2;

/**
 *  How much the image must be rotated (in radians) to line make indicator line up with north on image
 * */
const imageNorthOffset = Math.PI + Math.PI / 16;

type Props = {
	route: { key: string, name: string, params: { startId: string, endId: string } }
	navigation: Navigation
}
export function LocationScreen({ route, navigation }: Props) {
	const theme = useTheme();

	const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
	const [magnetometerData, setMagnetometerData] = useState({ x: 0, y: 0, z: 0 });
	const [gyroscopeData, setGyroscopeData] = useState({ x: 0, y: 0, z: 0 });

	const [accelerometerSubscription, setAccelerometerSubscription] = useState(null);
	const [magnetometerSubscription, setMagnetometerSubscription] = useState(null);
	const [gyroscopeSubscription, setGyroscopeSubscription] = useState(null);

	const [location, setLocation] = useState({ x: 0, y: 0 });
	const headingCompas = useCompassHeading(magnetometerData, imageNorthOffset);
	const [stepLength, headingStep, heading] = useStepLength(accelerometerData, magnetometerData, gyroscopeData, stepScale, imageNorthOffset);

	const [checkPoints, setCheckPoints] = useState<JsonNode[]>();
	const [currentCheckpointIndex, setcurrentCheckpointIndex] = useState(0);

	useEffect(() => {
		Accelerometer.setUpdateInterval(updateInterval);
		Magnetometer.setUpdateInterval(updateInterval);
		Gyroscope.setUpdateInterval(updateInterval);

		setAccelerometerSubscription(Accelerometer.addListener(setAccelerometerData));
		setMagnetometerSubscription(Magnetometer.addListener(setMagnetometerData));
		setGyroscopeSubscription(Gyroscope.addListener(setGyroscopeData));

		return () => {
			accelerometerSubscription && accelerometerSubscription.remove();
			setAccelerometerSubscription(null);
			magnetometerSubscription && magnetometerSubscription.remove();
			setMagnetometerSubscription(null);
			gyroscopeSubscription && gyroscopeSubscription.remove();
			setGyroscopeSubscription(null);
		};
	}, [navigation]);

	useEffect(() => {
		const nx = stepLength ? stepLength * Math.sin(headingStep) * 10 : 0;
		const ny = stepLength ? stepLength * Math.cos(headingStep) * 10 : 0;
		setLocation((previous) => ({ x: previous.x + nx, y: previous.y - ny }));
	}, [stepLength]);

	function setLocationWithNode(node: JsonNode) {
		const startX = node.data.x * locationScale + xOffset;
		const startY = node.data.y * locationScale + yOffset;
		setLocation({ x: startX, y: startY });
	}

	const graphJsonInput = useMemo(() => {
		const fullGraph = fromJSON(graphJsonString);
		const pathfinder = createPathFinder(fullGraph);

		if (route?.params?.startId && route?.params?.endId) {
			const startNode = fullGraph.getNode(route.params.startId);
			setLocationWithNode(startNode);

			const path = pathfinder.find(route.params.startId, route.params.endId);
			setCheckPoints(createNavigableNodes(path.reverse()));
			const pathGraph = createGraphFromPathNodes(path);
			const pathJsonStringGraph = toJSON(pathGraph);
			return JSON.parse(pathJsonStringGraph) as JsonGraph;
		} else {
			setLocation({ x: windowWidth / 2, y: windowHeight / 2 });
			return JSON.parse(graphJsonString) as JsonGraph;
		}
	}, [route]);

	const navVisualisation = useMemo(() => {
		function createNavVisualisation(graphJson: JsonGraph) {
			function createNavVisualisationLine(key: number, startX: number, startY: number, endX: number, endY: number) {
				return (
					<Path
						key={key} stroke={theme.colors.placeholder} strokeWidth={4} strokeLinecap={'round'} opacity={0.9}
						d={`M ${startX * locationScale + xOffset},${startY * locationScale + yOffset} ${endX * locationScale + xOffset},${endY * locationScale + yOffset}`}
					/>
				);
			}

			function findNodeData(nodeId: NodeId) {
				return graphJson.nodes.find((node) => node.id === nodeId).data;
			}

			return graphJson.links.map((link, index) => {
				const fromNodeData = findNodeData(link.fromId);
				const toNodeData = findNodeData(link.toId);
				return createNavVisualisationLine(index, fromNodeData.x, fromNodeData.y, toNodeData.x, toNodeData.y);
			});
		}

		return createNavVisualisation(graphJsonInput);
	}, [graphJsonInput]);

	const arcPath = useMemo(() => {
		return describeArc(location.x, location.y, 12 * indicatorScale,
			range(headingCompas - Math.PI / 2 - arcAngle, '2PI'),
			range(headingCompas - Math.PI / 2 + arcAngle, '2PI')
		);
	}, [location, headingCompas]);

	function goToNextCheckpoint() {
		const currentCheckpoint = checkPoints[currentCheckpointIndex + 1];
		setLocationWithNode(currentCheckpoint);
		setcurrentCheckpointIndex(currentCheckpointIndex + 1);
	}

	function hasReachedFinalCheckpoint() {
		return currentCheckpointIndex === checkPoints.length - 1;
	}

	const checkpoinComponent = useMemo(() => {
		if (checkPoints) {
			function renderCheckpoints() {
				if (hasReachedFinalCheckpoint()) {
					return (<Text style={s.checkPointText}>Doel bereikt</Text>);
				} else {
					const currentCheckpoint = checkPoints[currentCheckpointIndex];
					const nextCheckpoint = checkPoints[currentCheckpointIndex + 1];
					return (
						<Text style={{ alignContent: 'center' }}>
							<Text style={s.checkPointText}>{currentCheckpoint.id}  </Text>
							<AntDesign name="arrowright" size={20} color="black" />
							<Text style={s.checkPointText}>  {nextCheckpoint.id}</Text>
						</Text>
					);
				}
			}

			return (
				<View style={[s.bottomTab, s.topShadow]}>
					{renderCheckpoints()}
					<Button disabled={hasReachedFinalCheckpoint()} onPress={goToNextCheckpoint} mode={'outlined'}>
						Volgende punt
					</Button>
				</View>
			);
		}
	}, [currentCheckpointIndex, checkPoints]);

	return (
		<View>
			{
				<View style={{ position: 'absolute', zIndex: 1, width: '100%', marginLeft: 10, marginTop: 10 }}>
					<Text>Location| x:{location.x.toFixed(3)}, y:{location.y.toFixed(3)}</Text>
					<Text>HeadingCompass| {radiansToDegrees(headingCompas).toFixed(2)}°</Text>
					<Text>HeadingStep| {radiansToDegrees(headingStep ?? 0)}</Text>
				</View>
			}

			<View style={{ width: '100%', height: '100%', }} >
				<SvgPanZoom
					canvasWidth={500} canvasHeight={500}
					minScale={0.75} maxScale={2} initialZoom={1}

				>
					<Image
						href={floorplan}
						width={'100%'}
						height={'100%'}
						opacity={0.99}
					/>
					{navVisualisation}

					<Circle
						cx={location.x} cy={location.y} r={12 * indicatorScale}
						strokeWidth={indicatorScale}
						fill={theme.colors.primary}
						opacity={0.25}
					/>
					<Circle
						cx={location.x} cy={location.y} r={4 * indicatorScale}
						stroke={theme.colors.accent} strokeWidth={indicatorScale}
						fill={theme.colors.primary}
						opacity={0.45}
					/>
					<Path
						stroke={theme.colors.accent} strokeWidth={2 * indicatorScale}
						d={arcPath} opacity={0.70}
					/>
				</SvgPanZoom>

				{checkpoinComponent}
			</View>
		</View>
	);
}

const s = StyleSheet.create({
	topShadow: {
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 12,
		},
		shadowOpacity: 0.58,
		shadowRadius: 25.00,
		elevation: 24,
	},
	bottomTab: {
		alignItems: 'center',
		paddingVertical: 7,
		zIndex: 1,
		bottom: 0,
		backgroundColor: 'white',
	},
	checkPointText: {
		fontWeight: 'bold',
		fontSize: 20
	}
});
