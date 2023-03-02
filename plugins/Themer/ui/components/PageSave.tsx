import { React, Forms } from "aliucord/metro";
import { TouchableOpacity } from "react-native";

const { FormText } = Forms;

type PageSaveProps = {
    text: string,
    onPress: () => void
}

export default function PageSave({ text, onPress }: PageSaveProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{ marginRight: 16 }}
        >
            <FormText>{text}</FormText>
        </TouchableOpacity>
    );
}
