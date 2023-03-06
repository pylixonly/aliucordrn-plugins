import { Constants, getByProps, getByStoreName, GuildStore } from "aliucord/metro";

const EmojiModule = getByProps("uploadEmoji");
const PermissionStore = getByStoreName("PermissionStore");
const { Permissions } = Constants;

export function getManagableGuilds() {
    const guilds = GuildStore.getGuilds();
    return Object.values(guilds).filter(x =>
        x && PermissionStore.can(Permissions.MANAGE_GUILD_EXPRESSIONS, x)
    );
}

async function urlToBase64(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        } catch (e) {
            reject(e);
        }
    });
}

export async function uploadEmoji(name, src, guildId): Promise<any> {
    return await EmojiModule.uploadEmoji({
        guildId: guildId,
        image: await urlToBase64(src),
        name: name
    });
}
