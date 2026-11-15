import FontAwesome from "@expo/vector-icons/FontAwesome"
import { Link, Tabs } from "expo-router"
import React from "react"
import { Pressable } from "react-native"

export default function Layout() {
    return (
        <Tabs
            screenOptions={{
                headerRight: () => (
                    <Link href="/(initial)/profile" asChild>
                        <Pressable accessibilityLabel="Abrir perfil" hitSlop={8}  style={{ marginRight: 20, width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: '#000000', justifyContent: 'center', alignItems: 'center', }}>
                            <FontAwesome size={20} name="user" color="#000000" />
                        </Pressable>
                    </Link>
                ),
            }}
        >
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
                    tabBarIcon: ({ color }) => <FontAwesome size={18} name="question-circle" color={color} />
                }}
            />
            <Tabs.Screen
                name="services"
                options={{
                    title: "Serviços",
                    tabBarIcon: ({ color }) => <FontAwesome size={18} name="bars" color={color} />
                }}
            />
            <Tabs.Screen
                name="reviews"
                options={{
                    title: "Reviews",
                    tabBarIcon: ({ color }) => <FontAwesome size={18} name="star" color={color} />
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Perfil",
                    href: null
                }}
            />
            <Tabs.Screen
                name="agendamento"
                options={{
                    title: "Agendamento",
                    tabBarIcon: ({ color }) => <FontAwesome size={18} name="calendar" color={color} />
                }}
            />

            <Tabs.Screen
                name="meus-agendamentos"
                options={{
                    href: null,
                    title: "Meus agendamentos",
                }}
            />

            <Tabs.Screen
                name="agenda-barbeiro"
                options={{
                    href: null,
                    title: "Agenda do Barbeiro",
                }}
            />
        </Tabs>

    )
}