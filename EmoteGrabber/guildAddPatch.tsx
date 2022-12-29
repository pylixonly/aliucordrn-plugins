// @ts-ignore
import { Constants, getByProps, getByStoreName, GuildStore, Toasts } from "aliucord/metro";
import { Patcher } from "aliucord/api";

const LazyActionSheet = getByProps("openLazy", "hideActionSheet");
const EmojiModule = getByProps("uploadEmoji");
const GuildInvite = getByProps("showGuildInviteActionSheet");
const PermissionStore = getByStoreName("PermissionStore");

const Permissions = Constants.Permissions;

export const open = (args) => GuildInvite.showGuildInviteActionSheet("emote-grabber-patch", args);

export const patch = (patcher: Patcher) => {
    patcher.after(GuildInvite, "useServerInviteRows", ({ args: [recipient] }, x: any, __) => {
        if (recipient !== "emote-grabber-patch") return;

        const [_ownServer, otherServers] = x;
        x[1] = otherServers.filter(x => x && PermissionStore.can(Permissions.MANAGE_GUILD_EXPRESSIONS, x.guild));
    });

    patcher.before(GuildInvite, "sendGuildInvite", (x) => {
        const [recipient, serverId, emojiNode] = x.args;
        console.log(recipient, serverId, emojiNode);

        if (recipient !== "emote-grabber-patch") return;

        (async () => {
            const blob = await fetch(emojiNode.src).then(res => res.blob());
            const reader = new FileReader();
            reader.readAsDataURL(blob);

            reader.onloadend = () => {
                const dataUrl = reader.result;

                EmojiModule.uploadEmoji({
                    guildId: serverId,
                    image: dataUrl,
                    name: emojiNode.alt
                }).then(() => {
                    const guildName = GuildStore.getGuild(serverId)?.name;
                    Toasts.open({ content: `Cloned :${emojiNode.alt}: to ${guildName}`, source: { uri: emojiNode.src } })
                });
            };

            LazyActionSheet.hideActionSheet("invite-to-guilds-emote-grabber-patch");
        })();

        x._returnEarly = true;
        return true;
    })

    patcher.before(LazyActionSheet, "openLazy", (ctx) => {
        const [component, sheet] = ctx.args;

        if (sheet !== "invite-to-guilds-emote-grabber-patch") return;

        component.then(instance => {
            patcher.after(instance, "default", (_, component: any, { recipientId, source }) => {
                if (recipientId !== "emote-grabber-patch") return;

                const sheet = component.props.header.props.children;
                if (!sheet) return;

                sheet[0].props.title = `Clone :${source.alt}: to...`;
                sheet[1].props.children.length = 1;

                // sheet[1].props.children[1].props.children = "";

                // imagine...
                patcher.after(component.props, "children", (_, comp: any) => {
                    patcher.after(comp.type, "render", (_, comp: any) => {
                        patcher.after(comp.props, "renderItem", (_, comp: any) => {
                            patcher.after(comp.type, "type", (_, comp: any) => {
                                comp.props.trailing = () => null;
                            });
                        });
                    });
                });
            })
        });
    });
}