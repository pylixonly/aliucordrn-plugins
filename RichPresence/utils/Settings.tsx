import * as React from "react";
import RichPresence from "..";

const settingsInstance = () => RichPresence.classInstance.settings;

export const defaults = {
    lastfm_apikey: "615322f0047e12aedbc610d9d71f7430",
    discord_application_id: "1054951789318909972",
};

export const fromFile = {
    rpc_enabled: getValueOf("rpc_enabled", false),
    rpc_mode: getValueOf("rpc_mode", "none"),
    rpc_AppName: getValueOf("rpc_AppName", "Discord"),
    rpc_AppID: getValueOf("rpc_AppID", defaults.discord_application_id),

    rpc_State: getValueOf("rpc_State"),
    rpc_Details: getValueOf("rpc_Details"),
    rpc_StartTimestamp: getValueOf("rpc_StartTimestamp", "since_start"),
    rpc_EndTimestamp: getValueOf("rpc_EndTimestamp"),
    rpc_LargeImage: getValueOf("rpc_LargeImage"),
    rpc_LargeImageText: getValueOf("rpc_LargeImageText"),
    rpc_SmallImage: getValueOf("rpc_SmallImage"),
    rpc_SmallImageText: getValueOf("rpc_SmallImageText"),
    rpc_Button1Text: getValueOf("rpc_Button1Text"),
    rpc_Button1URL: getValueOf("rpc_Button1URL"),
    rpc_Button2Text: getValueOf("rpc_Button2Text"),
    rpc_Button2URL: getValueOf("rpc_Button2URL"),

    lastfm_username: getValueOf("lastfm_username"),
    lastfm_apikey: getValueOf("lastfm_apikey", defaults.lastfm_apikey),
    lastfm_showAlbumArt: getValueOf("lastfm_show_album_art", true),

}

export const settings = {
    Enabled: fromFile.rpc_enabled,
    Mode: fromFile.rpc_mode,
    ApplicationId: fromFile.rpc_AppID,

    LastFm: {
        enabled: () => fromFile.rpc_mode() === "lastfm",
        username: fromFile.lastfm_username,
        apiKey: fromFile.lastfm_apikey,
        showAlbumArt: getValueOf("lastfm_showAlbumArt", true),
        youtubeFallback: getValueOf("lastfm_use_youtube", false),
        listeningTo: getValueOf("lastfm_listening_to", false),
        linkYtmSearch: getValueOf("lastfm_add_ytm_button", false),
    },

    Custom: {
        enabled: () => fromFile.rpc_mode() === "custom",
        appName: fromFile.rpc_AppName,
        state: fromFile.rpc_State,
        details: fromFile.rpc_Details,
        startTimestamp: fromFile.rpc_StartTimestamp,
        endTimestamp: fromFile.rpc_EndTimestamp,
        largeImage: fromFile.rpc_LargeImage,
        largeImageText: fromFile.rpc_LargeImageText,
        smallImage: fromFile.rpc_SmallImage,
        smallImageText: fromFile.rpc_SmallImageText,
        button1Text: fromFile.rpc_Button1Text,
        button1URL: fromFile.rpc_Button1URL,
        button2Text: fromFile.rpc_Button2Text,
        button2URL: fromFile.rpc_Button2URL,
    }
}

function getValueOf(key: string, defaultValue?: any) {
    return () => {
        const val = settingsInstance().get<string, any>(key, undefined);
        if (val === undefined || val.length === 0) {
            return defaultValue;
        }
        
        return val;
    }
}

export const getSettings = () => {
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    return {
        get(key, defaultValue) {
            return settingsInstance().get(key, defaultValue);
        },
        set(key, value) {
            settingsInstance().set(key, value);
            forceUpdate(); 
        }
    };
}