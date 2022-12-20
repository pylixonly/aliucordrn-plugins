import { React, Forms } from "aliucord/metro";
import { ScrollView } from "react-native";
import { getSettings } from "./patches";

const { FormSection, FormInput } = Forms;

export default function CustomOptionPage() {
    const settings = getSettings();

    return (<>
    {/*
        // @ts-ignore */}
        <ScrollView>
            <FormSection title="Custom Option Page">
                <FormInput
                    title="App Name"
                    value={settings.get("rpc_AppName", "")}
                    placeholder="Insert App Name"
                    onChange={v => {
                        settings.set("rpc_AppName", v);
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
    </>);
}