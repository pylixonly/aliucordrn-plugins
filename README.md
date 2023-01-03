# AliucordRN Plugins

> **Warning**
>
> AliucordRN is not yet finished, therefore these plugins may break anytime due to breaking changes. These plugins has to be installed manually.

### [RichPresence](https://github.com/amsyarasyiq/aliucordrn-plugins/raw/builds/RichPresence.zip)
Allows you to set your Discord Rich Presence based on your last.fm or your custom settings

### [NoIdle](https://github.com/amsyarasyiq/aliucordrn-plugins/raw/builds/NoIdle.zip)
Don't idle when Discord is running in the background

### [HideGiftButton](https://github.com/amsyarasyiq/aliucordrn-plugins/raw/builds/HideGiftButton.zip)
Hides the gift button next to chat input

### [EmoteGrabber](https://github.com/amsyarasyiq/aliucordrn-plugins/raw/builds/EmoteGrabber.zip)
Grab emote's link or clone them to your server

### [ThemePatcher](https://github.com/amsyarasyiq/aliucordrn-plugins/raw/builds/ThemePatcher.zip) (EXPERIMENTAL!)
Patch coloring in AliucordRN (settings/ThemePatcher.json)
> **Warning**
>
> ThemePatcher is experimental and only expected to behave correctly with AliucordRN with commit [`f8e7d3e`](https://github.com/Aliucord/AliucordRN/tree/f8e7d3e5e0c1569317e4e99c76e8c3d0acb5959e) or earlier. Builds with commit further than that might have to re-apply the theme by turning off->on AMOLED theme every app restart


<details>
<summary>Building plugins</summary>

\
Build Plugin:
```sh
pnpm build [PLUGIN_NAME]
```

Watch for changes and auto compile & deploy* :
```sh
pnpm watch [PLUGIN_NAME]
```
\* Requires adb installed and to be connected to your phone

</details>
