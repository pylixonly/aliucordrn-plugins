import { React, ReactNative, Forms } from "aliucord/metro";
import { defaults, getSettings } from "../utils/Settings";

const { ScrollView } = ReactNative;
const { FormSection, FormInput, FormRow, FormSwitch } = Forms;

export default function LastFMConfigurePage() {
const { get, set } = getSettings("lastfm");

    return (<>
            {/*// @ts-ignore */}
            <ScrollView>
                <FormSection title="LastFM Configurations">
                    <FormInput
                        title="LastFM Username"
                        value={get("username")}
                        placeholder="Insert LastFM Username"
                        onChange={v => {
                            set("username", v);
                        }}
                    />
                    <FormInput
                        title="LastFM API Key [optional]"
                        value={get("api_key")}
                        placeholder={defaults.lastfm_apikey}
                        onChange={v => {
                            set("api_key", v);
                        }}
                    />
                </FormSection>
                <FormSection title="Misc Configurations">
                    <FormRow
                        label="Show album art"
                        subLabel="Show album art in the rich presence."
                        trailing={<FormSwitch
                            value={get("show_album_art", true)}
                            onValueChange={(v) => set("show_album_art", v)}
                        />}
                    />
                    { get("show_album_art", true) &&
                        <FormRow
                            label="Use Youtube as a fallback for album art"
                            subLabel="If LastFM doesn't have an album art for the song, use Youtube as a fallback."
                            trailing={<FormSwitch 
                                value = {get("youtube_fallback", false)}
                                onValueChange={(v) => set("youtube_fallback", v)} 
                            />}
                        />
                    }
                    <FormRow
                        label='"Listening to" instead of "Playing"'
                        subLabel="Use 'Listening to' instead of 'Playing' in the rich presence. [WARNING: Real client never sends 'Listening to' status]"
                        trailing={<FormSwitch
                            value={get("listening_to", false)}
                            onValueChange={(v) => set("listening_to", v)}
                        />}
                    />
                    <FormRow
                        label='Add "Listen on Youtube Music" button'
                        subLabel="The button will link users to Youtube Music search results for the song."
                        trailing={<FormSwitch
                            value={get("add_ytm_button", false)}
                            onValueChange={(v) => set("add_ytm_button", v)}
                        />}
                    />
                    <FormRow
                        label='Add "Loved" icon'
                        subLabel="Add a heart icon to the rich presence if the song is loved."
                        trailing={<FormSwitch
                            value={get("add_loved_icon", false)}
                            onValueChange={(v) => set("add_loved_icon", v)}
                        />}
                    />
                    <FormRow
                        label='Show toasts on update'
                        subLabel="Show a toast when the rich presence is updated."
                        trailing={<FormSwitch
                            value={get("show_toast", true)}
                            onValueChange={(v) => set("show_toast", v)}
                        />}
                    />
                </FormSection>
            </ScrollView>
    </>);
}