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

// TODO: option for lfm
export default function RichPresenceSettings() {
    const settings = getSettings();

    return (<>
    {/*
        // @ts-ignore */}
        <ScrollView>
            <FormSection title="Rich Presence Settings" android_noDivider={true}>
                <FormRow
                    label="Enable Rich Presence"
                    description="Enable Rich Presence"
                    trailing={<FormSwitch 
                        value = {settings.get("rpc_enabled", false)}
                        onValueChange={v => {
                            settings.set("rpc_enabled", v);
                            RichPresence.classInstance.init();
                        }}
                    />}
                />
                <FormRow label="Rich presence will be applied when this toggle is turned on or after you restarted your Discord client." />
                <FormDivider />
                <FormInput
                    title="App Name"
                    value={settings.get("rpc_AppName", "")}
                    placeholder="Insert App Name"
                    onChange={v => {
                        settings.set("rpc_AppName", v);
                    }}
                />
                <FormInput
                    title="App ID"
                    value={settings.get("rpc_AppID", "")}
                    placeholder="Insert App ID"
                    onChange={v => {
                        settings.set("rpc_AppID", v);
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
                    title="Details"
                    value={settings.get("rpc_Details", "")}
                    placeholder="Insert Details"
                    onChange={v => {
                        settings.set("rpc_Details", v);
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
                <FormInput
                    title="Large Image Text"
                    value={settings.get("rpc_LargeImageText", "")}
                    placeholder="Insert Large Image Text"
                    onChange={v => {
                        settings.set("rpc_LargeImageText", v);
                    }}
                />
                <FormInput
                    title="Small Image"
                    value={settings.get("rpc_SmallImage", "")}
                    placeholder="Insert Small Image"
                    onChange={v => {
                        settings.set("rpc_SmallImage", v);
                    }}
                />
                <FormInput
                    title="Small Image Text"
                    value={settings.get("rpc_SmallImageText", "")}
                    placeholder="Insert Small Image Text"
                    onChange={v => {
                        settings.set("rpc_SmallImageText", v);
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
    </>)
}