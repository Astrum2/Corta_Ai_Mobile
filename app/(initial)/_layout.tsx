import FontAwesome from "@expo/vector-icons/FontAwesome"
import { Tabs } from "expo-router"
import React from "react"

export default function Layout() {
    return (
        <Tabs>
            <Tabs.Screen 
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color }) => <FontAwesome size={18} name="home" color={color} />
                }}
            />
            <Tabs.Screen 
                name="sobre"
                options={{
                    title: "Sobre",
                    tabBarIcon: ({ color }) => <FontAwesome size={18} name="home" color={color} />
                }}
            />
            <Tabs.Screen 
                name="services"
                options={{
                    title: "Serviços",
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
                name="agendamento"
                options={{
                    title: "Agendamento",
                    tabBarIcon: ({ color }) => <FontAwesome size={18} name="user" color={color} />
                }}
            />
        </Tabs>
        
    )
}