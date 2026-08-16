import { Redirect } from "expo-router"
import React from "react"

export default function Index() {
    const userHasAuthenticated = false

    if (!userHasAuthenticated) {
        return (
            <Redirect href={"/login"}/>
        )
    }else {
        return (
            <Redirect href={"/profile"} />
        )
    }

}