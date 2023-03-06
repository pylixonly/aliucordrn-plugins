import { Constants, Forms, getByName, getByProps, getModule, React, Styles, Toasts } from "aliucord/metro";
import { getAssetId } from "aliucord/utils";
import { View } from "react-native";
import { getManagableGuilds, uploadEmoji } from "./utils";

const { FormRow, FormText, FormDivider } = Forms;

const ActionSheetUtils = getByProps("hideActionSheet");
const ColorMap = Constants.ThemeColorMap || getByProps("SemanticColorsByThemeTable")?.SemanticColor || getByProps("colors", "meta").colors;

const { default: Icon, IconSizes } = getByName("Icon", { default: false });
const { default: GuildIcon, GuildIconSizes } = getByName("GuildIcon", { default: false });
const ActionSheet = getModule((m) => m?.default?.render?.name === "ActionSheet")?.default?.render;

const { ActionSheetTitleHeader } = getModule(m => m.ActionSheetTitleHeader);
const { BottomSheetFlatList } = getByProps("BottomSheetFlatList");

const styles = Styles.createThemedStyleSheet({
    button: {
        flexDirection: "row",
        backgroundColor: ColorMap.BUTTON_SECONDARY_BACKGROUND,
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        alignItems: "center",
        justifyContent: "center",
    }
});

export function openClonerActionSheet(emojiNode) {
    ActionSheetUtils.openLazy(
        new Promise(r => r({ default: ClonerActionSheet })),
        "ClonerActionSheet",
        { emojiNode }
    );
}

type ServerRowProps = {
    guild: any;
    emojiNode: any;
};

type ClonerActionSheetProps = {
    emojiNode: any;
};

type SimpleActionButtonProps = {
    text: string;
    showCheckmark: boolean;
};

function SimpleActionButton({ text, showCheckmark }: SimpleActionButtonProps) {
    return (
        <View style={styles.button}>
            {showCheckmark && <Icon
                source={getAssetId("Check")}
                size={14}
                style={{ marginRight: 4 }}
                disableColor
            />}
            <FormText style={{ fontSize: 14, color: "white" }}>
                {text}
            </FormText>
        </View>
    );
}

function ServerRow({ guild, emojiNode }: ServerRowProps) {
    const [uploaded, setUploaded] = React.useState(false);
    const [isUploading, setIsUploading] = React.useState(false);

    return (
        <FormRow
            label={guild.name}
            leading={(
                <GuildIcon
                    guild={guild}
                    size={GuildIconSizes.NORMAL}
                />
            )}
            trailing={<SimpleActionButton
                text={uploaded ? "Uploaded" : isUploading ? "Uploading..." : "Upload"}
                showCheckmark={uploaded}
            />}
            onPress={async () => {
                setIsUploading(true);

                await uploadEmoji(emojiNode.alt, emojiNode.src, guild.id);

                Toasts.open({
                    content: `Uploaded ${emojiNode.alt} to ${guild.name}`,
                    source: getAssetId("Check")
                });

                setUploaded(true);
                setIsUploading(false);
            }}
            disabled={isUploading}
        />
    );
}

function ClonerActionSheet({ emojiNode }: ClonerActionSheetProps) {
    return (
        <ActionSheet scrollable>
            <ActionSheetTitleHeader
                leading={<Icon
                    style={{ marginRight: 12 }}
                    source={{ uri: emojiNode.src }}
                    size={IconSizes.SMALL}
                    disableColor // WHY IN THE WORLD IT DOES THE OPPOSITE
                />}
                title={"Clone emote to..."}
            />
            <BottomSheetFlatList
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 24 }}
                data={getManagableGuilds()}
                renderItem={({ item }) => (
                    <ServerRow
                        guild={item}
                        emojiNode={emojiNode}
                    />
                )}
                // This has no effect on Android
                ItemSeparatorComponent={FormDivider}
                keyExtractor={x => x.id}
            />
        </ActionSheet>
    );
}
