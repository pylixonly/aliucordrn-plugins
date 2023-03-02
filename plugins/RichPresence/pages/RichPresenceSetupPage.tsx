import { Constants, Forms, getByProps, React, ReactNative, Styles, URLOpener } from "aliucord/metro";
import { useSettings } from "../utils/Settings";

const { FormSection, FormInput, FormRow, FormSwitch } = Forms;
const { View, Text, ScrollView } = ReactNative;

const ThemeColorMap = Styles.ThemeColorMap ?? getByProps("SemanticColor").SemanticColor;

const styles = Styles.createThemedStyleSheet({
    subText: {
        fontSize: 14,
        marginLeft: 16,
        marginRight: 16,
        color: ThemeColorMap.TEXT_MUTED,
        fontFamily: Constants.Fonts.PRIMARY_NORMAL
    },

    textLink: {
        color: ThemeColorMap.TEXT_LINK,
    }
});

export default function RichPresenceSetupPage() {
    const { get, set } = useSettings("customRpc");

    return (<>
        <ScrollView>
            <FormSection title="Basic">
                <FormInput
                    title="Application Name"
                    value={get("app_name")}
                    placeholder="Discor"
                    onChange={v => set("app_name", v)}
                />
                <FormInput
                    title="Details"
                    value={get("details")}
                    placeholder="Competitive"
                    onChange={v => set("details", v)}
                />
                <FormInput
                    title="State"
                    value={get("state")}
                    placeholder="Playing Solo"
                    onChange={v => set("state", v)}
                />
            </FormSection>
            <FormSection title="Images">
                <FormInput
                    title="Large Image Asset Key or URL"
                    value={get("large_image")}
                    placeholder="large_image_here"
                    onChange={v => set("large_image", v)}
                />
                <FormInput
                    title="Large Image Text"
                    value={get("large_image_text")}
                    placeholder="Playing on Joe's lobby"
                    disabled={!get("large_image", false)}
                    onChange={v => set("large_image_text", v)}
                />
                <FormInput
                    title="Small Image Asset Key or URL"
                    value={get("small_image")}
                    placeholder="small_image_here"
                    onChange={v => set("small_image", v)}
                />
                <FormInput
                    title="Small Image Text"
                    value={get("small_image_text")}
                    placeholder="Solo"
                    disabled={!get("small_image", false)}
                    onChange={v => set("small_image_text", v)}
                />
                <Text style={styles.subText}>
                    Image assets key can be either a Discord asset name or a URL to an image.
                </Text>
            </FormSection>
            <FormSection title="Timestamps">
                <Text style={styles.subText}>
                    Timestamps are in Epoch seconds. You may use <Text style={styles.textLink} onPress={() => URLOpener.openURL("https://www.epochconverter.com/")}>this</Text> to convert your time to Unix Epoch time.
                </Text>
                <View style={{ height: 12 }} />
                <FormRow
                    label="Enable timestamps"
                    subLabel="Set whether to show timestamps or not"
                    trailing={<FormSwitch
                        value={get("enable_timestamps")}
                        onValueChange={v => set("enable_timestamps", v)}
                    />}
                />
                <FormInput
                    title="Start Timestamp (seconds)"
                    value={get("start_timestamp")}
                    placeholder="1234567890"
                    disabled={!get("enable_timestamps", false)}
                    onChange={v => set("start_timestamp", v)}
                />
                <FormInput
                    title="End Timestamp (seconds)"
                    value={get("end_timestamp")}
                    placeholder="1234567890"
                    disabled={!get("enable_timestamps", false)}
                    onChange={v => set("end_timestamp", v)}
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
                <Text style={styles.subText}>
                    NOTE: Leaving start timestamp blank will use the time RPC started.
                </Text>
            </FormSection>
            <FormSection title="Buttons">
                <FormInput
                    title="First Button Text"
                    value={get("button1_text")}
                    placeholder="random link #1"
                    onChange={v => set("button1_text", v)}
                />
                <FormInput
                    title="First Button URL"
                    value={get("button1_URL")}
                    placeholder="https://discord.com/vanityurl/dotcom/steakpants/flour/flower/index11.html"
                    disabled={!get("button1_text", false)}
                    onChange={v => set("button1_URL", v)}
                />
                <FormInput
                    title="Second Button Text"
                    value={get("button2_text")}
                    placeholder="random link #2"
                    onChange={v => set("button2_text", v)}
                />
                <FormInput
                    title="Second Button URL"
                    value={get("button2_URL")}
                    placeholder="https://youtu.be/w0AOGeqOnFY"
                    disabled={!get("button2_text", false)}
                    onChange={v => set("button2_URL", v)}
                />
            </FormSection>
        </ScrollView>
    </>);
}
