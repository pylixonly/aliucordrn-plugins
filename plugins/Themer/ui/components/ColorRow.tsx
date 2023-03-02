import { Forms, React } from "aliucord/metro";
import { useState } from "react";
import { View } from "react-native";
import { normalizeColorToHex } from "../../utils";

const { FormRow } = Forms;

type ColorRowProps = {
    name: string,
    color: string
    originalColor: string,
    onPress?: (setColor: (...args: any) => void) => void
}

export default function ColorRow({ name, color: _color, originalColor, onPress }: ColorRowProps) {
    const [color, setColor] = useState(_color);

    const circleStyles = (color) => ({
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: normalizeColorToHex(color),
        marginRight: 8,
    });

    return <FormRow
        key={name}
        label={name}
        subLabel={normalizeColorToHex(color)}
        onPress={onPress && (() => onPress?.(setColor))}
        leading={(
            <View style={{ flexDirection: "row" }}>
                {originalColor !== color && <>
                    <View style={circleStyles(originalColor)} />
                </>}
                <View style={circleStyles(color)} />
            </View>
        )}
        trailing={onPress && FormRow.Arrow}
    />;
}
