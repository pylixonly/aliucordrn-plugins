import { getByProps, React } from "aliucord/metro";
import { FlatList, ScrollView } from "react-native";
import ColorRow from "../components/ColorRow";

const { RawColor } = getByProps("SemanticColor");

export default function RawColorsPage() {
    return (<>
        <ScrollView>
            <FlatList
                data={Object.keys(RawColor)}
                renderItem={({ item }) => <ColorRow
                    name={item}
                    color={RawColor[item]}
                    originalColor={RawColor[item]}
                />}
            />
        </ScrollView>
    </>);
}
