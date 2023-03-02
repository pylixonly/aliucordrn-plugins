import { getByProps, NavigationNative, React } from "aliucord/metro";
import { FlatList, ScrollView } from "react-native";
import { getCurrentThemeName, normalizeColorToHex } from "../../utils";
import ColorRow from "../components/ColorRow";

const { RawColor, SemanticColor } = getByProps("SemanticColor");

const getColorMap = (theme: string) => Object.fromEntries(
    Object.entries(
        SemanticColor
    ).map(([k, v]: any) => [k, RawColor[v[theme].raw]])
);

const colorMap = {
    dark: getColorMap("dark"),
    light: getColorMap("light"),
    amoled: getColorMap("amoled"),
};

export default function SemanticColorsPage() {
    const navigation = NavigationNative.useNavigation();

    const currentTheme = getCurrentThemeName();
    const colors = getColorMap(currentTheme);
    const origColors = colorMap[currentTheme];

    return (<>
        <ScrollView>
            <FlatList
                data={Object.keys(origColors)}
                renderItem={({ item }) => <ColorRow
                    name={item}
                    color={colors[item]}
                    originalColor={origColors[item]}
                    onPress={(setColor) => {
                        navigation.push("ColorPickerPage", {
                            name: item,
                            initColor: colors[item],
                            onExit: (color: number) => {
                                const hex = normalizeColorToHex(color);
                                const refSymbol = Symbol(item);

                                RawColor[refSymbol] = hex;
                                SemanticColor[item][currentTheme].raw = refSymbol;

                                setColor(color);
                            }
                        });
                    }}
                />}
            />
        </ScrollView>
    </>);
}
