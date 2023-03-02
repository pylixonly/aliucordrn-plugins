import { Forms, getByName, getModule, NavigationNative, React } from "aliucord/metro";
import { findInReactTree } from "aliucord/utils";
import { useCallback, useEffect } from "react";
import { View } from "react-native";
import { normalizeColorToHex } from "../../utils";
import PageSave from "../components/PageSave";

type ColorType = string | number;
type ColorPickerProps = {
    name: string,
    initColor: ColorType,
    onExit: (color: ColorType) => void
}

const { FormInput } = Forms;
const normalizeColor = getModule(x => x.name === "normalizeColor");
const { default: CustomColorPickerActionSheet } = getByName("CustomColorPickerActionSheet");

function useColorPicker(initColor: ColorType): [ColorType, any, any] {
    const actionSheet = CustomColorPickerActionSheet({
        color: normalizeColor(initColor),
        onSelect: console.log,
    });

    const view = findInReactTree(actionSheet, x => x?.type?.name === "SafeAreaPaddingView");

    const finalColor = findInReactTree(view, x => x?.type?.name === "SuggestedColors").props.color;
    const colorPicker = findInReactTree(view, x => x?.type?.name === "HSVColorPicker");
    const textInput = findInReactTree(view, x => x?.props?.onChangeText);

    return [finalColor, colorPicker, textInput];
}

function ColorPreview({ color }: { color: ColorType }) {
    const styles = ({
        height: 50,
        borderRadius: 8,
        backgroundColor: normalizeColorToHex(color)
    });

    return <View style={styles} />;
}

export default function ColorPickerPage({ name, initColor, onExit }: ColorPickerProps) {
    const navigation = NavigationNative.useNavigation();
    const [color, colorPicker, textInput] = useColorPicker(initColor);

    const exitCallback = useCallback(() => {
        onExit(color);
        navigation.goBack();
    }, [color]);

    useEffect(() => {
        navigation.setOptions({
            title: name,
            headerRight: () => <PageSave text="SAVE" onPress={exitCallback} />
        });
    }, [color]);

    return (
        <View style={{ flexGrow: 1, padding: 12 }}>
            <ColorPreview color={color} />
            <View style={{ alignItems: "center", marginVertical: 18 }}>
                {colorPicker}
            </View>
            <FormInput
                {...textInput.props}
                style={{ ...textInput.props.style, width: "auto" }}
                title="HEX Value"
                placeholder={"#00000000"}
                returnKeyType="done"
            />
        </View>
    );
}
