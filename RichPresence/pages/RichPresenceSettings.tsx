import { React, ReactNative, Styles, Forms } from "aliucord/metro"
import { getAssetId } from "aliucord/utils"
import RichPresence from "..";
import { getSettings } from "./patches";

const { View, Text, ScrollView } = ReactNative;

const { FormRow, FormSection, FormSwitch, FormInput, FormDivider, FormText } = Forms;
const Toasts = (window as any).aliucord.metro.Toasts;

// TODO: option for lfm
export default function RichPresenceSettings({ navigation }) {
    const settings = getSettings();

    return (<>
    {/*
        // @ts-ignore */}
        <ScrollView>
            <FormSection title="Rich Presence Settings" android_noDivider={true}>
                <FormRow
                    label="Enable Rich Presence"
                    subLabel="Rich presence will be updated when this toggle is turned on or after your Discord client is restarted."
                    description="Enable Rich Presence"
                    trailing={<FormSwitch 
                        value = {settings.get("rpc_enabled", false)}
                        onValueChange={v => {
                            if (v && settings.get("rpc_AppID", "") === "") {
                                Toasts.open({ content: "Please insert an App ID before enabling Rich Presence.", source: getAssetId("Small")})
                                return;
                            }
                            settings.set("rpc_enabled", v);
                            RichPresence.classInstance.init();
                        }}
                    />}
                />
                <FormDivider />
                <FormInput
                    title="Application ID [REQUIRED]"
                    value={settings.get("rpc_AppID", "")}
                    placeholder="Insert Application ID"
                    onChange={v => {
                        settings.set("rpc_AppID", v);
                    }}
                />
                <FormRow
                    label="Configure Custom Rich Presence"
                    subLabel="Show how cool you are to your friends by customizing your Rich Presence."
                    trailing={FormRow.Arrow}
                    onPress={() => navigation.push("CustomOptionPage")}
                />
            </FormSection>
        </ScrollView>
    </>)
}