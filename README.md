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

### [MagicThemeFixer](https://github.com/amsyarasyiq/aliucordrn-plugins/raw/builds/MagicThemeFixer.zip)
Magically fix the broken theming in AliucordRN

> **Note**
>
> - Yes, it is fixed "magically". I have no idea what it does (besides the AMOLED part), so it might not work for everyone :trollface:
> - AMOLED theme doesn't rely on Discord's settings and force set manually by the plugin during startup, but it should work as usual. You can toggle it in Appearance as usual or directly in `AliucordRN/settings/MagicThemeFixer.json`.

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
