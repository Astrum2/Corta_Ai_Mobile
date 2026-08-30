import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

const DARK = {
    bodyBg: "#080B12",
    secondaryBg: "#0D1E2A",
    tertiaryBg: "#12162A",
    borderColor: "#243747",

    primary: "#082af0",
    primaryText: "#FFFFFF",

    danger: "#C43A32",
    success: "#3E8E68",

    bodyColor: "#F7F6F3",
    secondaryColor: "#C9C7C3",
    tertiaryColor: "#8E959C",

    backdrop: "rgba(0,0,0,0.65)",
};

const LIGHT = {
    bodyBg: "#FFFFFF",
    secondaryBg: "#FFFFFF",
    tertiaryBg: "#FAFAFA",
    borderColor: "#E6E2DC",

    primary: "#9A1F1B",
    primaryText: "#020202",

    danger: "#C43A32",
    success: "#3E8E68",

    bodyColor: "#1B1B1B",
    secondaryColor: "#4A4A4A",
    tertiaryColor: "#77736F",

    backdrop: "rgba(0,0,0,0.22)",
};

const FONT = {
    headingFamily: "BebasNeue_400Regular",
    base: "PlusJakartaSans_400Regular",
    baseMedium: "PlusJakartaSans_500Medium",
    baseSemibold: "PlusJakartaSans_600SemiBold",
    baseBold: "PlusJakartaSans_700Bold",
};

const FONT_SIZE = {
    sm: 11,
    base: 13,
    lg: 15,
    h4: 17,
    h3: 22,
    h2: 28,
    h1: 36,
    display: 52,
};

const SPACE = {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 32,
    8: 48,
    9: 64,
};

const RADIUS = {
    sm: 4,
    base: 8,
    lg: 14,
    xl: 20,
    circle: 9999,
};

type ThemeColor = "light" | "dark";

type ThemeContextType = {
    currentColor: ThemeColor;
    theme: typeof DARK;
    font: typeof FONT;
    fontSize: typeof FONT_SIZE;
    space: typeof SPACE;
    radius: typeof RADIUS;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

type Props = {
    children: React.ReactNode;
};

export const ThemeProvider = ({ children }: Props) => {
    const colorScheme = useColorScheme();
    const initialColor: ThemeColor = colorScheme === "light" ? "light" : "dark";

    const [color, setColor] = useState<ThemeColor>(initialColor);
    const [theme, setTheme] = useState(initialColor === "light" ? LIGHT : DARK);

    const toggleTheme = () => {
        if (color === "light") {
            setTheme(DARK);
            setColor("dark");
            return;
        }

        setTheme(LIGHT);
        setColor("light");
    };

    useEffect(() => {
        const systemColor: ThemeColor = colorScheme === "light" ? "light" : "dark";
        setColor(systemColor);
        setTheme(systemColor === "light" ? LIGHT : DARK);
    }, [colorScheme]);

    return (
        <ThemeContext.Provider
            value={{
                currentColor: color,
                theme,
                font: FONT,
                fontSize: FONT_SIZE,
                radius: RADIUS,
                space: SPACE,
                toggleTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (context === null) {
        throw new Error("Use dentro do <ThemeProvider>");
    }

    return context;
};