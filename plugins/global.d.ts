declare global {
    const aliucord: typeof import("aliucord");

    interface Window {
        React: typeof import("react");
        ReactNative: typeof import("react-native");
        [key: PropertyKey]: any;
    }

    const AliuHermes: {
        run: (path: string, buffer?: ArrayBuffer) => any;
        findStrings: (fun: Function) => string[];
        unfreeze: (obj: any) => any;
    };

    const AliuFS: {
        readdir: (path: string) => { name: string, type: "file" | "directory"; }[];
        mkdir: (path: string) => void;
        exists: (path: string) => boolean;
        remove: (path: string) => void;
        readFile: (path: string, encoding: "text" | "binary") => string | ArrayBuffer;
        writeFile: (path: string, content: string | ArrayBuffer) => void;
    };

    const nativeModuleProxy: {
        AliucordNative: {
            listNativeModules: () => Promise<Record<string, string[]>>;
            checkPermissions: () => Promise<boolean>;
            requestPermissions: () => Promise<boolean>;
            download: (url: string, path: string) => Promise<void>;
            restartApp: () => void;

            externalStorageDirectory: string;
            codeCacheDirectory: string;
            cacheDirectory: string;
            packageCodePath: string;
        };

        DCDFileManager: any;
    }

    class ZipFile {
        constructor(path: string, level: number, mode: "w" | "r" | "a" | "d");

        openEntry(name: string);
        readEntry(encoding: "text"): string;
        readEntry(encoding: "binary"): ArrayBuffer;
        closeEntry();

        close();
    }
}

// temporary while we wait for the aliucord typings to update
declare module 'aliucord' {
    module metro {
        export function getByName(name: string, options?: { [key: PropertyKey]: boolean }): any;

        // Common modules
        export const Toasts: any;
        export const Navigation: any;
        export const DiscordNavigator: any;
        export const Dialog: any;
    }

    module utils {
        module constants {
            export const PLUGINS_DIRECTORY: string;
            export const ALIUCORD_DIRECTORY: string;
        }
    }

    export const pluginManager: typeof import("aliucord/api/PluginManager").PluginManager | any;
}

export { }