import { Forms, NavigationNative, React } from "aliucord/metro";
import { getAssetId } from "aliucord/utils";
import { ScrollView } from "react-native";

const { FormRow, FormSection, FormIcon } = Forms;

export default function MainPage() {
    const navigation = NavigationNative.useNavigation();

    return (
        <ScrollView>
            <FormSection title="Themer" titleStyleType="no_border">
                <FormRow
                    label="Semantic Colors"
                    subLabel="View and edit semantic colors."
                    leading={<FormIcon source={getAssetId("ic_theme_24px")} />}
                    trailing={FormRow.Arrow}
                    onPress={() => navigation.push("SemanticColorsPage")}
                />
                <FormRow
                    label="Row Colors"
                    subLabel="View all raw colors."
                    leading={<FormIcon source={getAssetId("ic_theme_24px")} />}
                    trailing={FormRow.Arrow}
                    onPress={() => navigation.push("RawColorsPage")}
                />
            </FormSection>
        </ScrollView>
    );
}
