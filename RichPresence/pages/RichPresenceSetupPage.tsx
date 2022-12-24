import { React, ReactNative, Forms, Styles } from "aliucord/metro";
import { ScrollView } from "react-native";
import { getSettings } from "../utils/Settings";

const { FormSection, FormInput, FormRow, FormSwitch } = Forms;
const { Text } = ReactNative;

export default function RichPresenceSetupPage() {
    const { get, set } = getSettings("customRpc");
    
    return (<>
        {/*// @ts-ignore */}
        <ScrollView>
            <FormSection title="Basic">
                <FormInput
                    title="Application Name"
                    value={get("app_name")}
                    placeholder="Discord"
                    onChange={v => set("app_name", v)}
                />
                <FormInput
                    title="Details"
                    value={get("details")}
                    placeholder="Insert Details"
                    onChange={v => set("details", v)}
                />
                <FormInput
                    title="State"
                    value={get("state")}
                    placeholder="Insert State"
                    onChange={v => set("state", v)}
                />
            </FormSection>
            <FormSection title="Images">
                <FormInput
                    title="Large Image"
                    value={get("large_image")}
                    placeholder="Insert Large Image"
                    onChange={v => set("large_image", v)}
                />
                <FormInput
                    title="Large Image Text"
                    value={get("large_image_text")}
                    placeholder="Insert Large Image Text"
                    disabled={!get("large_image", false)}
                    onChange={v => set("large_image_text", v)}
                />
                <FormInput
                    title="Small Image"
                    value={get("small_image")}
                    placeholder="Insert Small Image"
                    onChange={v => set("small_image", v)}
                />
                <FormInput
                    title="Small Image Text"
                    value={get("small_image_text")}
                    placeholder="Insert Small Image Text"
                    disabled={!get("small_image", false)}
                    onChange={v => set("small_image_text", v)}
                />
            </FormSection>
            <FormSection title="Timestamps">
                <FormRow
                    label="Enable timestamps"
                    subLabel="Set whether to show timestamps or not"
                    trailing={<FormSwitch 
                        value={get("enable_timestamps")} 
                        onValueChange={v => set("enable_timestamps", v)} 
                    />}
                />
                <FormInput
                    title="Start Timestamp"
                    disabled={!get("enable_timestamps", false)}
                    value={get("start_timestamp")}
                    placeholder="since_start"
                    onChange={v => set("start_timestamp", v)}
                />
                <FormRow
                    label="Use current time as start timestamp" 
                    subLabel="This will override the start timestamp you set above"
                    disabled={!get("enable_timestamps", false)}
                    onPress={() => {
                        set("start_timestamp", String(Date.now() / 1000 | 0));
                    }}
                    trailing={FormRow.Arrow}
                />
                <FormInput
                    title="End Timestamp"
                    value={get("end_timestamp")}
                    disabled={!get("enable_timestamps", false)}
                    placeholder="Insert End Timestamp"
                    onChange={v => set("end_timestamp", v)}
                />
            </FormSection>
            <FormSection title="Buttons">
                <FormInput
                    title="First Button Text"
                    value={get("button1_text")}
                    placeholder="Insert First Button Text"
                    onChange={v => set("button1_text", v)}
                />
                <FormInput
                    title="First Button URL"
                    value={get("button1_URL")}
                    placeholder="Insert First Button URL"
                    disabled={!get("button1_text", false)}
                    onChange={v => set("button1_URL", v)}
                />
                <FormInput
                    title="Second Button Text"
                    value={get("button2_text")}
                    placeholder="Insert Second Button Text"
                    onChange={v => set("button2_text", v)}
                />
                <FormInput                    
                    title="Second Button URL"
                    value={get("button2_URL")}
                    placeholder="Insert Second Button URL"
                    disabled={!get("button2_text", false)}
                    onChange={v => set("button2_URL", v)}
                />
            </FormSection>
        </ScrollView>
    </>);
}