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

<details>
<summary>Deprecated plugins</summary>

### ThemePatcher
#### (deprecated in favour of [AliucordRN#52](https://github.com/Aliucord/AliucordRN/pull/52) and [AliucordRN#53](https://github.com/Aliucord/AliucordRN/pull/53))
Patch coloring in AliucordRN (settings/ThemePatcher.json)

### MagicThemeFixer 
#### (deprecated in favour of [AliucordRN#42](https://github.com/Aliucord/AliucordRN/pull/42))
Magically fix the broken theming in AliucordRN

</details>

<details>
<summary>Building plugins</summary>

\
Build Plugin:
```sh
pnpm build [PLUGIN_NAME]
```

Build and deploy only*:
```sh
pnpm build --deploy [PLUGIN_NAME] <PACKAGE_NAME>
```

Watch for changes and auto compile & deploy* :
```sh
pnpm watch [PLUGIN_NAME]
```
\* Requires adb installed and to be connected to your phone

</details>
