import { getSettings } from "./patches";
import { React, ReactNative, Forms } from "aliucord/metro";

const { ScrollView } = ReactNative;
const { FormSection, FormInput, FormRow, FormSwitch } = Forms;

export default function LastFMConfigurePage() {
const settings = getSettings();

    return (<>
            {/*// @ts-ignore */}
            <ScrollView>
                <FormSection title="LastFM Configurations">
                    <FormInput
                        title="LastFM Username"
                        value={settings.get("lastfm_username", "")}
                        placeholder="Insert LastFM Username"
                        onChange={v => {
                            settings.set("lastfm_username", v);
                        }}
                    />
                    <FormInput
                        title="LastFM API Key"
                        value={settings.get("lastfm_apikey", "")}
                        placeholder="Insert LastFM API Key"
                        onChange={v => {
                            v !== "" && settings.set("lastfm_apikey", v);
                        }}
                    />
                </FormSection>
                <FormSection title="Misc Configuration">
                    <FormRow
                        label="Show album art"
                        subLabel="Show album art in the rich presence."
                        trailing={<FormSwitch
                            value={settings.get("lastfm_show_album_art", false)}
                            onValueChange={(v) => settings.set("lastfm_show_album_art", v)}
                        />}
                    />
                    <FormRow
                        label="Use Youtube as a fallback for album art"
                        subLabel="If LastFM doesn't have an album art for the song, use Youtube as a fallback."
                        trailing={<FormSwitch 
                            value = {settings.get("lastfm_use_youtube", false)}
                            onValueChange={(v) => settings.set("lastfm_use_youtube", v)}
                        />}
                    />
                    <FormRow
                        label='"Listening to" instead of "Playing"'
                        subLabel="Use 'Listening to' instead of 'Playing' in the rich presence."
                        trailing={<FormSwitch
                            value={settings.get("lastfm_listening_to", false)}
                            onValueChange={(v) => settings.set("lastfm_listening_to", v)}
                        />}
                    />
                    <FormRow
                        label='Add "Listen on Youtube Music" button'
                        subLabel="The button will link users to Youtube Music search results for the song."
                        trailing={<FormSwitch
                            value={settings.get("lastfm_add_ytm_button", false)}
                            onValueChange={(v) => settings.set("lastfm_add_ytm_button", v)}
                        />}
                    />
                </FormSection>
            </ScrollView>
    </>);
}