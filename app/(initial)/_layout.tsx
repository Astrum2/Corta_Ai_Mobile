import FontAwesome from "@expo/vector-icons/FontAwesome"
import { Tabs } from "expo-router"
import React from "react"

export default function Layout() {
    return (
        <Tabs>
            <Tabs.Screen 
                name="home"
                options={{
                    title: "Initial",
                    tabBarIcon: ({ color }) => <FontAwesome size={18} name="home" color={color} />
                }}
            />
            <Tabs.Screen 
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color }) => <FontAwesome size={18} name="user" color={color} />
                }}
            />
            <Tabs.Screen 
                name="pastel"
                options={{
                    title: "Pastel no header",
                    tabBarIcon: ({ color }) => <FontAwesome size={18} name="hand-grab-o" color={color} />
                }}
            />
             <Tabs.Screen 
                name="agendamento"
                options={{
                    title: "agendamento",
                    tabBarIcon: ({ color }) => <FontAwesome size={18} name="home" color={color} />
                }}
            />
        </Tabs>
        
    )
}