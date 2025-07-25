import { StyleSheet, Text, View } from 'react-native'

const Index = () => {
    return (
        <View style={styles.container}>
            <View>
                <View>
                    <Text>SimpleMemo</Text>
                    <Text>ログアウト</Text>
                </View>
            </View>
            <View>
                <View>
                    <View>
                        <Text>買い物リスト</Text>
                        <Text>2025年7月25日 20:38</Text>
                    </View>
                    <View>
                        <Text>X</Text>
                    </View>
                </View>

                <View>
                    <View>
                        <Text>買い物リスト</Text>
                        <Text>2025年7月25日 20:38</Text>
                    </View>
                    <View>
                        <Text>X</Text>
                    </View>
                </View>

                <View>
                    <View>
                        <Text>買い物リスト</Text>
                        <Text>2025年7月25日 20:38</Text>
                    </View>
                    <View>
                        <Text>X</Text>
                    </View>
                </View>
            </View>

            <View>
                <Text>+</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})

export default Index
