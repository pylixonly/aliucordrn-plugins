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
                        title="LastFM API Key [optional]"
                        value={settings.get("lastfm_apikey", "")}
                        placeholder="615322f0047e12aedbc610d9d71f7430"
                        onChange={v => {
                            settings.set("lastfm_apikey", v);
                        }}
                    />
                </FormSection>
                <FormSection title="Misc Configuration">
                    <FormRow
                        label="Show album art"
                        subLabel="Show album art in the rich presence."
                        trailing={<FormSwitch
                            value={settings.get("lastfm_show_album_art", true)}
                            onValueChange={(v) => settings.set("lastfm_show_album_art", v)}
                        />}
                    />
                    { settings.get("lastfm_show_album_art", true) &&
                        <FormRow
                            label="Use Youtube as a fallback for album art"
                            subLabel="If LastFM doesn't have an album art for the song, use Youtube as a fallback."
                            trailing={<FormSwitch 
                                value = {settings.get("lastfm_use_youtube", false)}
                                onValueChange={(v) => settings.set("lastfm_use_youtube", v)} 
                            />}
                        />
                    }
                    { settings.get("lastfm_show_album_art", true) &&
                        <FormInput
                            title="Default album art"
                            value={settings.get("lastfm_default_album_art", "")}
                            placeholder="https://www.last.fm/static/images/lastfm_avatar_twitter.52a5d69a85ac.png"
                            onChange={v => {
                                settings.set("lastfm_default_album_art", v != ""? v : "https://www.last.fm/static/images/lastfm_avatar_twitter.52a5d69a85ac.png");
                            }}
                        />
                    }
                    <FormRow
                        label='"Listening to" instead of "Playing"'
                        subLabel="Use 'Listening to' instead of 'Playing' in the rich presence. [WARNING: Real client never sends 'Listening to' status]"
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