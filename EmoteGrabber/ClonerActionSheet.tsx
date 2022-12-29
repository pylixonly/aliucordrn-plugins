import { Patcher } from "aliucord/api";
// @ts-ignore
import { Constants, getByProps, getByStoreName, Toasts } from "aliucord/metro";
import EmoteGrabber from ".";

const LazyActionSheet = getByProps("openLazy", "hideActionSheet");
const EmojiModule = getByProps("uploadEmoji");
const GuildInvite = getByProps("showGuildInviteActionSheet");
const PermissionStore = getByStoreName("PermissionStore");

const Permissions = Constants.Permissions;
const uniqueIdentifier = "emote-grabber-patch";

const onGuildPress = async (emojiNode, guild) => {
    const blob = await fetch(emojiNode.src).then(res => res.blob());
    const reader = new FileReader();
    reader.readAsDataURL(blob);

    reader.onloadend = async () => {
        try {
            const dataUrl = reader.result;

            const response = await EmojiModule.uploadEmoji({
                guildId: guild.id,
                image: dataUrl,
                name: emojiNode.alt
            });

            Toasts.open({
                content: `Cloned :${emojiNode.alt}: to ${guild.name}`,
                source: { uri: emojiNode.src }
            });
        } catch (e) {
            Toasts.open({
                content: `Failed to clone :${emojiNode.alt}: to ${guild.name}`,
                source: { uri: emojiNode.src }
            });
            
            EmoteGrabber.instance.logger.error("Failed to clone emote", e)
            throw e;
        }
    };

    LazyActionSheet.hideActionSheet(`invite-to-guilds-${uniqueIdentifier}`);
};

export const openClonerActionSheet = (args) => GuildInvite.showGuildInviteActionSheet(uniqueIdentifier, args);

export const patch = (patcher: Patcher) => {
    patcher.after(GuildInvite, "useServerInviteRows", ({ args: [recipient] }, x: any, __) => {
        if (recipient !== uniqueIdentifier) return;

        const [_ownServer, otherServers] = x;
        x[1] = otherServers.filter(x => x && PermissionStore.can(Permissions.MANAGE_GUILD_EXPRESSIONS, x.guild));
    });

    patcher.before(LazyActionSheet, "openLazy", (ctx) => {
        const [component, sheet] = ctx.args;

        if (sheet !== `invite-to-guilds-${uniqueIdentifier}`) return;

        component.then(instance => {
            patcher.after(instance, "default", (_, component: any, { recipientId, source }) => {
                if (recipientId !== uniqueIdentifier) return;

                const sheet = component.props.header.props.children;
                if (!sheet) return;

                sheet[0].props.title = `Clone :${source.alt}: to...`;
                sheet[1].props.children.length = 1;

                // sheet[1].props.children[1].props.children = "";

                // imagine...
                const unpatch = patcher.after(component.props, "children", (_, comp: any) => {
                    const _unpatch = patcher.after(comp.type, "render", (_, comp: any) => {
                        const __unpatch = patcher.after(comp.props, "renderItem", (_, comp: any) => {
                            const ___unpatch = patcher.after(comp.type, "type", (ctx, comp: any) => {
                                const { row: { guild }, recipientId: reference, source: emojiNode } = ctx.args[0];

                                if (reference !== uniqueIdentifier) {
                                    ___unpatch();
                                    return;
                                }

                                comp.props.trailing = () => null;
                                comp.props.onPress = () => onGuildPress(emojiNode, guild);
                            });
                            __unpatch();
                        });
                        _unpatch();
                    });
                    unpatch();
                });
            })
        });
    });
}