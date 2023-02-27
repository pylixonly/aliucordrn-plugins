declare global {
    const aliucord: typeof import("aliucord");

    interface Window {
        React: typeof import("react");
        ReactNative: typeof import("react-native");
        [key: PropertyKey]: any;
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
}

export { }