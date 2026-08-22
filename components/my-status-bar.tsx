import { useTheme } from "@/contexts/theme"
import { StatusBar } from "expo-status-bar"
import React from "react"

export const MyStatusBar = () => {
    const { currentColor, theme } = useTheme()
    return(
        <>
            <StatusBar
                style = {currentColor === "dark" ? "light" : "dark"}
                backgroundColor= {theme.bodyBg}
            />
        </>
    )
}