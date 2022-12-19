import { getByProps, React, ReactNative, Styles, Forms } from "aliucord/metro"
import { getAssetId } from "aliucord/utils"

const { View, Text } = ReactNative;
const Button: any = ReactNative.Button;
const ScrollView: any = ReactNative.ScrollView;

const { FormRow, FormSection, FormSwitch, FormInput, FormDivider, FormText } = Forms;
const { ThemeColorMap } = Styles;

export function RichPresenceSettings() {
    return (<>
        <ScrollView>
            <FormSection title="Settings" android_noDivider={true}>
                <FormRow
                    label="Enable Rich Presence"
                    trailing={<FormSwitch value={false} onValueChange={v => {}} />}
                />
                <FormDivider />
                <FormInput 
                    value="Name"
                    onChangeText={v => {}}
                />
            </FormSection>
        </ScrollView>
    </>)
}