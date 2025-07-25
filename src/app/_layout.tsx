import { JSX } from 'react'
import { Stack } from 'expo-router'

const Layout = (): JSX.Element => {
    return (
        <Stack
            screenOptions={{
                headerStyle: { 
                    backgroundColor: '#467FD3'
                },
                headerTintColor: '#ffffff',
                headerTitle: 'SimpleMemo',
                headerBackTitle: 'Back',
                headerTitleStyle: {
                    fontSize: 22,
                    fontWeight: 'bold',
                },
            }}
        />
    )
}

export default Layout
