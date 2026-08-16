import { useTheme } from "@/contexts/theme";
import { Text } from "react-native";

type Props = {
    children: React.ReactNode
}
export const H1 = (props: Props) => {
    const { theme, font, fontSize } = useTheme()
    return (
        <Text
            style={{
                color: theme.bodyColor,
                fontSize: fontSize.h1,
                fontFamily: font.headingFamily,
            }}
        >{props.children}</Text>
    );
}

export const H2 = (props: Props) => {
    const { theme, font, fontSize } = useTheme()
    return (
        <Text
            style={{
                color: theme.secondaryColor,
                fontSize: fontSize.h3,
                fontFamily: font.baseSemibold,
            }}
        >{props.children}</Text>
    );
}