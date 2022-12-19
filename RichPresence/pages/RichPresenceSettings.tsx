import { React, ReactNative, Styles, Forms } from "aliucord/metro"
import { getAssetId } from "aliucord/utils"
import RichPresence from "..";

const { View, Text, ScrollView } = ReactNative;

const { FormRow, FormSection, FormSwitch, FormInput, FormDivider, FormText } = Forms;

function getSettings() {
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    return {
        get(key, defaultValue) {
            return RichPresence.classInstance.settings.get(key, defaultValue);
        },
        set(key, value) {
            RichPresence.classInstance.settings.set(key, value);
            forceUpdate(); 
        }
    };
}

export default function RichPresenceSettings() {
    const settings = getSettings();

    return (<>
    {/*
        // @ts-ignore */}
        <ScrollView>
            <FormSection title="RPCSettings" android_noDivider={true}>
                <FormRow
                    label="Enable Rich Presence"
                    trailing={<FormSwitch 
                        value = {settings.get("rpc_enabled", false)}
                        onValueChange={v => {
                            settings.set("rpc_enabled", v);
                        }}
                    />}
                />
                <FormDivider />
                <FormInput
                    title="App Name"
                    value={settings.get("rpc_AppName", undefined)}
                    placeholder="Insert App Name"
                    onChange={v => {
                        settings.set("rpc_AppName", v);
                    }}
                />
            </FormSection>
        </ScrollView>
    </>)
}