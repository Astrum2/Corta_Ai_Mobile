import { MyStatusBar } from "@/components/my-status-bar";
import { ThemeProvider } from "@/contexts/theme";
import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <MyStatusBar />
    </ThemeProvider>
  );
}
