import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'

import Hello from './src/components/Hello'

const App = (): React.ReactElement => {
    return (
        <View style={styles.container}>
            <Hello bang>World</Hello>
            <Hello style={{fontSize: 16}}>World</Hello>
            <Text>Open up App.tsx to start working on your app!!!</Text>
            <StatusBar style="auto" />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
})

export default App
