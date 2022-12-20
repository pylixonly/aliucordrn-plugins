import { React, Forms } from "aliucord/metro";
import { ScrollView } from "react-native";
import { getSettings } from "./patches";

const { FormSection, FormInput, FormRow } = Forms;

export default function RichPresenceSetupPage() {
    const settings = getSettings();

    return (<>
        {/*// @ts-ignore */}
        <ScrollView>
            <FormSection title="Rich Presence Setup">
                <FormInput
                    title="Application Name"
                    value={settings.get("rpc_AppName", "Discord")}
                    placeholder="Discord"
                    onChange={v => {
                        settings.set("rpc_AppName", v);
                    }}
                />
                <FormInput
                    title="Details"
                    value={settings.get("rpc_Details", "")}
                    placeholder="Insert Details"
                    onChange={v => {
                        settings.set("rpc_Details", v);
                    }}
                />
                <FormInput
                    title="State"
                    value={settings.get("rpc_State", "")}
                    placeholder="Insert State"
                    onChange={v => {
                        settings.set("rpc_State", v);
                    }}
                />
                <FormInput
                    title="Large Image"
                    value={settings.get("rpc_LargeImage", "")}
                    placeholder="Insert Large Image"
                    onChange={v => {
                        settings.set("rpc_LargeImage", v);
                    }}
                />
                { !!settings.get("rpc_LargeImage", false) && <FormInput
                    title="Large Image Text"
                    value={settings.get("rpc_LargeImageText", "")}
                    placeholder="Insert Large Image Text"
                    onChange={v => {
                        settings.set("rpc_LargeImageText", v);
                    }}
                /> }
                <FormInput
                    title="Small Image"
                    value={settings.get("rpc_SmallImage", "")}
                    placeholder="Insert Small Image"
                    onChange={v => {
                        settings.set("rpc_SmallImage", v);
                    }}
                />
                { !!settings.get("rpc_SmallImage", false) && <FormInput
                    title="Small Image Text"
                    value={settings.get("rpc_SmallImageText", "")}
                    placeholder="Insert Small Image Text"
                    onChange={v => {
                        settings.set("rpc_SmallImageText", v);
                    }}
                /> }
                <FormInput
                    title="Start Timestamp"
                    value={settings.get("rpc_StartTimestamp", "")}
                    placeholder="since_start"
                    onChange={v => {
                        settings.set("rpc_StartTimestamp", v);
                    }}
                />
                <FormRow
                    label="Use current time as start timestamp" 
                    onPress={() => {
                        settings.set("rpc_StartTimestamp", String(Date.now() / 1000 | 0));
                    }}
                    trailing={FormRow.Arrow}
                />
                <FormInput
                    title="End Timestamp"
                    value={settings.get("rpc_EndTimestamp", "")}
                    placeholder="Insert End Timestamp"
                    onChange={v => {
                        settings.set("rpc_EndTimestamp", v);
                    }}
                />
                <FormInput
                    title="First Button Text"
                    value={settings.get("rpc_Button1Text", "")}
                    placeholder="Insert First Button Text"
                    onChange={v => {
                        settings.set("rpc_Button1Text", v);
                    }}
                />
                { settings.get("rpc_Button1Text", "") != "" && 
                <FormInput
                    title="First Button URL"
                    value={settings.get("rpc_Button1URL", "")}
                    placeholder="Insert First Button URL"
                    onChange={v => {
                        settings.set("rpc_Button1URL", v);
                    }}
                />}
                <FormInput
                    title="Second Button Text"
                    value={settings.get("rpc_Button2Text", "")}
                    placeholder="Insert Second Button Text"
                    onChange={v => {
                        settings.set("rpc_Button2Text", v);
                    }}
                />
                { settings.get("rpc_Button2Text", "") != "" &&
                <FormInput                    
                    title="Second Button URL"
                    value={settings.get("rpc_Button2URL", "")}
                    placeholder="Insert Second Button URL"
                    onChange={v => {
                        settings.set("rpc_Button2URL", v);
                    }}
                />}
            </FormSection>
        </ScrollView>
    </>);
}