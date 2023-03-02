import { NavigationNative, React } from "aliucord/metro";
import { FlatList, ScrollView } from "react-native";
import Themer from "../..";
import { getCurrentThemeName, normalizeColorToHex, RawColor, SemanticColor } from "../../utils";
import ColorRow from "../components/ColorRow";

export default function SemanticColorsPage() {
    const navigation = NavigationNative.useNavigation();

    const currentTheme = getCurrentThemeName();
    const origColors = Themer.origColorMap[currentTheme];

    return (<>
        <ScrollView>
            <FlatList
                data={Object.keys(SemanticColor)}
                renderItem={({ item }) => <ColorRow
                    name={item}
                    color={RawColor[SemanticColor[item][currentTheme].raw]}
                    originalColor={origColors[item]}
                    onPress={(setColor) => {
                        navigation.push("ColorPickerPage", {
                            name: item,
                            initColor: RawColor[SemanticColor[item][currentTheme].raw],
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
