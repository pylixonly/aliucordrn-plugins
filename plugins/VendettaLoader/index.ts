import { Plugin } from "aliucord/entities";
import { constants } from "aliucord/utils";

export default class VendettaLoader extends Plugin {
    // https://github.com/vendetta-mod/Vendetta/blob/7d36903b2c4d7c0444ee185decc2eebc2f7817d9/src/def.d.ts#L288
    loaderConfig!: {
        customLoadUrl: {
            enabled: boolean;
            url: string;
        };
        loadReactDevTools: boolean;
    };

    INSTALL_PATH = constants.ALIUCORD_DIRECTORY + "vendetta.js";
    REF_LINK = "https://api.github.com/repos/vendetta-mod/builds/git/refs/heads/master";
    RAW_LINK = "https://github.com/vendetta-mod/builds/raw/master/vendetta.js";

    public start() {
        // we don't want to block the plugin loading
        this.asyncStart().catch(error => {
            this.logger.error(error);
            // @ts-ignore
            this.errors?.push(error?.stack ?? error);
        });
    }

    async asyncStart() {
        this.writeLoader();

        // fresh install
        if (!AliuFS.exists(this.INSTALL_PATH)) {
            await this.download();
            this.inject();
            return;
        }

        if (this.loaderConfig.customLoadUrl?.enabled) {
            try {
                await this.download(this.loaderConfig.customLoadUrl.url);
            } catch (err) {
                this.logger.error("Failed to download Vendetta from custom endpoint, using cached if exists");
                this.logger.error(err);
            }
        }

        if (!this.loaderConfig.customLoadUrl?.enabled && await this.isUpdateAvailable()) {
            AliuFS.remove(this.INSTALL_PATH);
            await this.download();
        }

        this.logger.info("Injecting Vendetta");
        this.inject();
    }

    public async stop() {
        super.stop();
        window.vendetta?.unload();
    }

    writeLoader() {
        window.__vendetta_loader = {
            name: "VendettaLoader (AliucordRN)",
            features: {
                loaderConfig: true
            }
        };

        const { DocumentsDirPath } = nativeModuleProxy.DCDFileManager.getConstants();
        const configPath = DocumentsDirPath + "/vendetta_loader.json";

        if (!AliuFS.exists(configPath)) {
            AliuFS.writeFile(configPath, JSON.stringify({
                customLoadUrl: {
                    enabled: false,
                    url: "http://localhost:4040/vendetta.js"
                }
            }));
        }

        this.loaderConfig = JSON.parse(AliuFS.readFile(configPath, "text") as string);
    }

    inject() {
        try {
            window.vendetta?.unload();
        } catch (err) {
            this.logger.error("Failed to unload Vendetta");
            this.logger.error(err);
            delete window.vendetta
        }

        const decoder = new TextDecoder("utf-8");
        const content = decoder.decode(
            AliuFS.readFile(this.INSTALL_PATH, "binary") as ArrayBuffer
        );

        try {
            eval?.(content);
        } catch (err) {
            this.logger.error("Failed to eval Vendetta");
            this.logger.error(err);
        }
    }

    async download(link?: string) {
        link ??= this.RAW_LINK;

        const res = await fetch(link);
        if (!res.ok) {
            throw new Error(`[${res.status}] Failed to download Vendetta from endpoint: ${link}`);
        }

        this.settings.set("currentHash", await this.getLatestHash());
        AliuFS.writeFile(this.INSTALL_PATH, await res.text());
    }

    async isUpdateAvailable() {
        const latestHash = await this.getLatestHash();
        const currentHash = this.settings.get("currentHash", null);

        return currentHash !== latestHash;
    }

    async getLatestHash() {
        const res = await fetch(this.REF_LINK);
        const json = await res.json();
        return json.object.sha;
    }
}