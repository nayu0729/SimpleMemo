import { Redirect, router } from 'expo-router'
import { onAuthStateChanged } from 'firebase/auth'
import { JSX, useEffect } from 'react'

import { auth } from '../config'

const Index = (): JSX.Element => {
    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user !== null) {
                router.replace('/memo/list')
            } 
        })
    }, [])

    return <Redirect href="/auth/logIn" />
}

export default Index
