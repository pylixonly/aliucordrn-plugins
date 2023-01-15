import { Navigation, NavigationStack, NavigationNative, Styles, Constants, React, ReactNative } from "aliucord/metro";
import { getAssetId } from "aliucord/utils";

interface Props {
    name: string;
    children: JSX.Element;
}

const styles = Styles.createThemedStyleSheet({
    container: {
        backgroundColor: Styles.ThemeColorMap.BACKGROUND_MOBILE_SECONDARY,
        flex: 1,
    },
    card: {
        backgroundColor: Styles.ThemeColorMap.BACKGROUND_MOBILE_PRIMARY,
        color: Styles.ThemeColorMap.TEXT_NORMAL,
    },
    header: {
        backgroundColor: Styles.ThemeColorMap.BACKGROUND_MOBILE_SECONDARY,
        shadowColor: "transparent",
        elevation: 0,
    },
    headerTitleContainer: {
        color: Styles.ThemeColorMap.HEADER_PRIMARY,
    },
    headerTitle: {
        fontFamily: Constants.Fonts.PRIMARY_BOLD,
        color: Styles.ThemeColorMap.HEADER_PRIMARY,
    },
    backIcon: {
        tintColor: Styles.ThemeColorMap.INTERACTIVE_ACTIVE,
        marginLeft: 15,
        marginRight: 20,
    }
});

export const Settings = NavigationStack.createStackNavigator();
const { TouchableOpacity, Image } = ReactNative;

export function Page({ name, children }: Props) {
    return (
        <NavigationNative.NavigationContainer independent>
            <Settings.Navigator
                initialRouteName={name}
                style={styles.container}
                screenOptions={{
                    cardOverlayEnabled: false,
                    cardShadowEnabled: false,
                    cardStyle: styles.card,
                    headerStyle: styles.header,
                    headerTitleContainerStyle: styles.headerTitleContainer,
                    safeAreaInsets: {
                        top: 0,
                    },
                }}
            >
                <Settings.Screen
                    name={name}
                    component={children}
                    options={{
                        headerTitleStyle: styles.headerTitle,
                        headerLeft: () => (
                            <TouchableOpacity
                                onPress={() => Navigation.pop()}
                            >
                                <Image style={styles.backIcon} source={getAssetId("back-icon")} />
                            </TouchableOpacity>
                        ),
                        ...NavigationStack.TransitionPresets.BottomSheetAndroid
                    }}
                />
            </Settings.Navigator>
        </NavigationNative.NavigationContainer>
    );
}
