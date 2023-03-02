import { pluginManager } from "aliucord";
import { Plugin } from "aliucord/entities";
import { Dialog, getByProps, Toasts } from "aliucord/metro";
import { constants, getAssetId } from "aliucord/utils";

const SimpleActionSheetUtils = getByProps("showSimpleActionSheet");
const ActionSheetUtils = getByProps("hideActionSheet");

export default class PluginDownloader extends Plugin {
    public start() {
        this.patcher.before(SimpleActionSheetUtils, "showSimpleActionSheet", ({ args: [info] }) => {
            if (info?.key !== "LongPressUrl") return;

            const repo = this.getRepo(info.header.title);
            if (!repo) return;

            info.options.unshift({
                label: "Install a plugin",
                onPress: async () => {
                    ActionSheetUtils.hideActionSheet();
                    let plugins;

                    try {
                        plugins = await this.getPlugins(repo);
                    } catch (e) {
                        Toasts.open({
                            content: "Failed to get plugins from url",
                            source: "Small",
                        });
                        return;
                    }

                    SimpleActionSheetUtils.showSimpleActionSheet({
                        key: "PluginDownloader",
                        header: { title: "Select plugin to install" },
                        options: plugins.map(({ name, url }) => ({
                            label: name,
                            onPress: () => this.handlePluginInstall(name, url)
                        }))
                    });
                }
            });
        });
    }

    async handlePluginInstall(name: string, url: string) {
        if (!await this.confirmInstall(name)) {
            return;
        }

        const installPath = constants.PLUGINS_DIRECTORY + name + ".zip";
        if (AliuFS.exists(installPath)) {
            AliuFS.remove(installPath);
        }

        this.logger.info(`Downloading ${name} from ${url} to ${installPath}...`);
        await nativeModuleProxy.AliucordNative.download(url, installPath);

        if (pluginManager.plugins[name]) {
            await pluginManager.disablePlugin(name);
        }

        const plugin = this.loadPlugin(name + ".zip");
        if (!plugin) return;

        try {
            this.logger.info(`Starting plugin ${plugin}`);
            await plugin.start();
            // @ts-ignore
            plugin.enabled = true;
        } catch (err: any) {
            // @ts-ignore
            plugin.errors.push(err?.stack ?? err);
            this.logger.error(`Failed while starting plugin: ${name}`, err);
            Toasts.open({
                content: `${name} had an error while starting.`,
                source: getAssetId("Small")
            });
        }
    }

    // modified from aliucord repo since it is not exported
    loadPlugin(pluginZip: string): Plugin | null {
        try {
            this.logger.info("Loading plugin " + pluginZip);
            const zip = new ZipFile(constants.PLUGINS_DIRECTORY + pluginZip, 0, "r");

            zip.openEntry("manifest.json");
            const manifest = JSON.parse(zip.readEntry("text"));
            zip.closeEntry();

            zip.openEntry("index.js.bundle");
            const pluginBuffer = zip.readEntry("binary");
            zip.closeEntry();

            zip.close();

            const PluginClass = AliuHermes.run(pluginZip, pluginBuffer) as typeof Plugin;

            if (!(PluginClass?.prototype instanceof Plugin))
                throw new Error(`Plugin ${manifest.name} does not export a valid Plugin`);
            if (manifest.name !== PluginClass.name)
                throw new Error(`Plugin ${manifest.name} must export a class named ${manifest.name}`);

            const loadedPlugin = new PluginClass(manifest as any) as any;

            loadedPlugin.pluginBuffer = pluginBuffer;
            loadedPlugin.enabled = false;
            loadedPlugin.localPath = constants.PLUGINS_DIRECTORY + pluginZip;

            pluginManager.plugins[manifest.name] = loadedPlugin;

            Toasts.open({
                content: `Installed plugin ${manifest.name}`,
                source: getAssetId("Check")
            });

            return loadedPlugin;
        } catch (err: any) {
            Toasts.open({
                content: `Error while trying to install plugin ${pluginZip}`,
                source: getAssetId("Small")
            });

            this.logger.error(err);
            return null;
        }
    }

    getRepo(url: string): string | null {
        try {
            const urlObj = new URL(url.trim());

            if (urlObj.hostname !== "github.com") {
                return null;
            }

            return urlObj.pathname.split("/").slice(1, 3).join("/");
        } catch {
            return null;
        }
    }

    async getPlugins(repo: string): Promise<{ name: string, url: string }[]> {
        const res = await fetch(`https://api.github.com/repos/${repo}/git/trees/builds`);

        if (!res.ok) {
            this.logger.error("Failed to fetch plugins, response code: " + res.status);
            throw new Error("Failed to fetch plugins, response code: " + res.status);
        }

        const files = (await res.json())?.tree;

        if (!files || !Array.isArray(files) || !files.length) {
            this.logger.error("Failed to fetch plugins, invalid response", files);
            throw new Error("Failed to fetch plugins, invalid response");
        }

        return files
            .filter(x => x.path.endsWith(".zip"))
            .map(({ path }) => ({
                name: path.slice(0, -4),
                url: `https://raw.githubusercontent.com/${repo}/builds/${path}`
            }));
    }

    async confirmInstall(name: string): Promise<boolean> {
        if (!pluginManager.plugins[name]) return true;

        return await new Promise((res, rej) => {
            Dialog.show({
                title: "Reinstall plugin?",
                body: `${name} is already installed.`,
                confirmText: "Yes",
                cancelText: "No",
                isDismissable: true,
                onConfirm: () => res(true),
                onCancel: () => rej(false),
                onDismiss: () => rej(false)
            });
        });
    }
}
