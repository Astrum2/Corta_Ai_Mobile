import { useTheme } from "@/contexts/theme";
import { Image } from "expo-image";
import { View } from "react-native";

type Props = {
    fotoUrl: string
}

export const ProfilePicture = (props: Props) => {
    const { theme, space, radius } = useTheme()
    return (
        <View
            style={{
                width: 200,
                height: 200,
                borderRadius: radius.circle,
                marginBottom: space[5],
                borderWidth: 1,
                borderColor: theme.borderColor,
                overflow: "hidden"
            }}
        >
            <Image
                source={{
                    uri: props.fotoUrl
                }}
                style={{
                    width: "100%",
                    height: "100%"
                }}
            />
        </View>
    );
}