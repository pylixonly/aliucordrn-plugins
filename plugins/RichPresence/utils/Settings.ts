import * as React from "react";
import RichPresence from "..";

const settingsInstance = () => RichPresence.classInstance.settings;

export const defaults = {
    lastfm_apikey: "615322f0047e12aedbc610d9d71f7430",
    discord_application_id: "1054951789318909972",
};

export const settings = {
    get enabled() { return settingsInstance().get("enabled", false); },
    get mode() { return settingsInstance().get("mode", "none"); },
    get applicationId() { return settingsInstance().get("appID", "") || defaults.discord_application_id; },

    lastFm: {
        get enabled() { return settingsInstance().get("mode", "none") === "lastfm"; },
        get(name) {
            return settingsInstance().get("lastfm", {})[name];
        }
    },

    custom: {
        get enabled() { return settingsInstance().get("mode", "none") === "lastfm"; },
        get(name: string, defaultValue?: any) {
            return settingsInstance().get("customRpc", {})[name] || defaultValue;
        }
    }
};

export const useSettings = (name?: string) => {
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    return {
        get(key, defaultValue?) {
            if (name) {
                return settingsInstance().get(name, {})[key] ?? defaultValue;
            }
            return settingsInstance().get(key, defaultValue);
        },
        set(key, value) {
            if (name) {
                const obj = settingsInstance().get(name, {});
                obj[key] = value.length === 0 ? undefined : value;
                settingsInstance().set(name, obj);
            } else {
                settingsInstance().set(key, value);
            }
            forceUpdate();
        }
    };
};
