import { JsonGraph } from 'ngraph.fromjson';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import DropDown from 'react-native-paper-dropdown';
import { Navigation } from '../stack';
import { areEmpty } from '../utils/javasciptUtils';
import { createNavigableOptions } from '../utils/ngraphUtils';
import { graphJsonString } from "../utils/constants";

type Props = {
    navigation: Navigation
}
export function LocationSelectScreen({ navigation }: Props) {
    const [showDropDownStart, setShowDropDownStart] = useState(false);
    const [showDropDownEnd, setShowDropDownEnd] = useState(false);

    const [dropDownStartValue, setDropDownStartValue] = useState<string>("wc");
    const [dropDownEndValue, setDropDownEndValue] = useState<string>("teras");

    const navigableOptions = useMemo(() => {
        const jsonGraph: JsonGraph = JSON.parse(graphJsonString);
        return createNavigableOptions(jsonGraph)
    }, []);

    function startNavigation() {
        navigation.navigate("Location", { startId: dropDownStartValue, endId: dropDownEndValue })
    }

    return (

        <View style={s.viewWrapper}>
            <Text style={s.title}>Kiest een startpunt</Text>
            <DropDown
                label={"Start"}
                mode={"outlined"}
                visible={showDropDownStart}
                showDropDown={() => setShowDropDownStart(true)}
                onDismiss={() => setShowDropDownStart(false)}
                value={dropDownStartValue}
                setValue={setDropDownStartValue}
                list={navigableOptions}
            />
            <View style={s.spacerMd}></View>

            <Text style={s.title}>Kies een eindpunt</Text>
            <DropDown
                label={"Einde"}
                mode={"outlined"}
                visible={showDropDownEnd}
                showDropDown={() => setShowDropDownEnd(true)}
                onDismiss={() => setShowDropDownEnd(false)}
                value={dropDownEndValue}
                setValue={setDropDownEndValue}
                list={navigableOptions}
            />
            <View style={s.spacerLg}></View>

            <Button disabled={areEmpty(dropDownEndValue, dropDownEndValue)} icon="map-marker-radius" mode="contained" onPress={startNavigation}>
                Start
            </Button>
        </View>
    );
}

const s = StyleSheet.create({
    viewWrapper: {
        marginTop: 20,
        marginHorizontal: 10
    },
    title: {
        fontSize: 17,
        fontWeight: "700"
    },
    spacerMd: {
        marginBottom: 10
    },
    spacerLg: {
        marginBottom: 20
    }
});