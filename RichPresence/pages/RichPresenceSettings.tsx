import { Forms, getByProps, React, ReactNative } from "aliucord/metro";
import { getAssetId } from "aliucord/utils";
import RichPresence from "..";
import { RPLogger } from "../utils/Logger";
import { defaults, useSettings } from "../utils/Settings";
import LastFMConfigurePage from "./LastFMConfigurePage";
import RichPresenceSetupPage from "./RichPresenceSetupPage";

const { ScrollView } = ReactNative;

const { FormRow, FormSection, FormSwitch, FormInput, FormDivider } = Forms;
const Toasts = (window as any).aliucord.metro.Toasts;

export default function RichPresenceSettings() {
    const { get, set } = useSettings();
    const navigation = getByProps("NavigationContainer").useNavigation();
    const checkIcon = getAssetId("checked");

    return (<>
        {/*// @ts-ignore */}
        <ScrollView>
            <FormSection title="Rich Presence Settings" android_noDivider={true}>
                <FormRow
                    label="Enable Rich Presence"
                    subLabel="Rich presence will be updated when this toggle is turned on or after your Discord client is restarted."
                    trailing={<FormSwitch 
                        value={get("enabled", false)}
                        onValueChange={v => {
                            if (v && get("mode", "none") == "none") {
                                Toasts.open({ content: "Please select a mode before enabling rich presence.", source: getAssetId("Small")})
                                return;
                            }

                            if (v && get("mode", "none") === "lastfm" && !get("lastfm", {})["username"]) {
                                Toasts.open({ content: "Please insert a Last.fm username or switch mode.", source: getAssetId("Small")})
                                return;
                            }

                            set("enabled", v);
                            RichPresence.classInstance.init().then(() => {
                                Toasts.open({ content: `Rich presence ${v? "enabled" : "disabled"}.`})
                            }).catch(e => {
                                Toasts.open({ content: `Failed to ${v? "enable" : "disable"} rich presence.`, source: getAssetId("Small")})
                                RPLogger.error(e)
                            });
                        }}
                    />}
                />
                <FormRow
                    label="Force update rich presence"
                    subLabel="Use this to apply changes to your rich presence settings."
                    trailing={FormRow.Arrow}
                    disabled={!get("enabled", false)}
                    onPress={() => {
                        RichPresence.classInstance.init().then(() => {
                            Toasts.open({ content: "Rich presence updated."})
                        }).catch(e => {
                            Toasts.open({ content: "Failed to update rich presence.", source: getAssetId("Small")})
                            RPLogger.error(e)
                        });
                    }}
                />
            </FormSection>
            <FormSection title="Mode">
                <FormRow
                    label="Last.fm"
                    subLabel="Show what you're listening to through Last.fm."
                    trailing={get("mode", "none") === "lastfm" ? 
                        <FormRow.Icon source={checkIcon} color="#5865F2" /> : undefined
                    }
                    onPress={() => {
                        const old = get("mode", "none");
                        set("mode", "lastfm");
                        RichPresence.classInstance.init().then(() => {
                            Toasts.open({ content: "Rich presence updated to mode last.fm."})
                        }).catch(e => {
                            set("mode", old);
                            Toasts.open({ content: "Failed to update rich presence. \nEnsure the username is set.", source: getAssetId("Small")})
                            RPLogger.error(e)
                        });
                    }}
                />
                <FormRow
                    label="Custom settings"
                    subLabel="Set the rich presence according to your own settings."
                    trailing={get("mode", "none") === "custom" ? 
                        <FormRow.Icon source={checkIcon} color="#5865F2" /> : undefined
                    }
                    onPress={() => { 
                        set("mode", "custom");
                        RichPresence.classInstance.init().then(() => {
                            Toasts.open({ content: "Rich presence updated to mode custom."})
                        }).catch(e => {
                            Toasts.open({ content: "Failed to update rich presence.", source: getAssetId("Small")})
                            RPLogger.error(e)
                        });
                    }}
                />
            </FormSection>
            <FormSection title="Configurations">
                <FormInput
                    title="Discord Application ID [optional]"
                    value={get("appID")}
                    placeholder={defaults.discord_application_id}
                    onChange={v => set("appID", v)}
                />
                <FormDivider />
                <FormRow
                    label="Configure Last.fm settings"
                    subLabel="Show what you're listening to through Last.fm."
                    trailing={FormRow.Arrow}
                    onPress={() => {
                        if (aliucord.metro.DiscordNavigator) {
                            navigation.push("LastFMConfigurePage");
                            return;
                        }
                        
                        if (aliucord.ui?.Page) {
                            const { ui: { Page }, metro: { Navigation } } = aliucord;
                            Navigation.push(Page, {
                                name: "Last.fm Configurations",
                                children: LastFMConfigurePage
                            });
                            return;
                        }

                        navigation.push("LastFMConfigurePage");
                    }}
                />
                <FormRow
                    label="Configure custom rich presence"
                    subLabel="Show how cool you are to your friends by manually customizing your rich presence."
                    trailing={FormRow.Arrow}
                    onPress={() => {
                        if (aliucord.metro.DiscordNavigator) {
                            navigation.push("RichPresenceSetupPage");
                            return;
                        }

                        if (aliucord.ui?.Page) {
                            const { ui: { Page }, metro: { Navigation } } = aliucord;
                            Navigation.push(Page, {
                                name: "Rich Presence Setup",
                                children: RichPresenceSetupPage
                            });
                            return;
                        }
                        
                        navigation.push("RichPresenceSetupPage")
                    }}
                />
            </FormSection>
        </ScrollView>
    </>)
}

declare const aliucord: any;
