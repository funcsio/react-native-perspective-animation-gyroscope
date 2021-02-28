import React, {useEffect} from 'react';
import {SafeAreaView, StyleSheet, View, Image} from 'react-native';
import {gyroscope} from 'react-native-sensors';
import MockUI from './MockUI';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const App = () => {
  const gyroValue = useSharedValue({x: 0, y: 0, z: 0});
  const prev = useSharedValue({x: 0, y: 0});
  const derivedTranslations = useDerivedValue(() => {
    'worklet';
    const MAX_X = 40;
    const MAX_Y = 40;

    let newX = prev.value.x + gyroValue.value.y * -2;
    let newY = prev.value.y + gyroValue.value.x * -2;

    // Can be more cleaner
    if (Math.abs(newX) >= MAX_X) {
      newX = prev.value.x;
    }
    if (Math.abs(newY) >= MAX_Y) {
      newY = prev.value.y;
    }
    prev.value = {
      x: newX,
      y: newY,
    };
    return {
      x: newX,
      y: newY,
    };
  }, [gyroValue.value]);

  useEffect(() => {
    const subscription = gyroscope.subscribe(({x, y, z, timestamp}) => {
      gyroValue.value = {x, y, z};
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [gyroValue.value]);

  const AnimatedStyles = {
    motion: useAnimatedStyle(() => {
      const inputRange = [-100, 0, 100];

      const outputRange = [-20, 0, 20];
      return {
        transform: [
          {
            translateX: withSpring(
              interpolate(
                derivedTranslations.value.x,
                inputRange,
                outputRange,
                Easing.bezier(0.16, 1, 0.3, 1),
              ),
            ),
          },
          {
            translateY: withSpring(
              interpolate(
                derivedTranslations.value.y,
                inputRange,
                outputRange,
                Easing.bezier(0.16, 1, 0.3, 1),
              ),
            ),
          },
        ],
      };
    }),
  };

  return (
    <SafeAreaView>
      <View style={styles.cont}>
        <Animated.Image
          source={require('./assets/bkg.jpg')}
          style={[styles.background]}
          blurRadius={2}
          resizeMode="cover"
        />
        <Animated.View style={AnimatedStyles.motion}>
          <MockUI />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cont: {
    height: '100%',
    width: '100%',
    backgroundColor: '#111',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    position: 'absolute',
    alignItems: 'center',
    aspectRatio: 1,
    bottom: '-5%',
    width: '120%',
    height: '120%',
  },
});

export default App;
