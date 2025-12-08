import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle, StyleSheet } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  style?: ViewStyle;
  borderRadius?: number;
}

const SkeletonLoader = ({ 
  width = '100%', 
  height = 20, 
  style, 
  borderRadius = 8 
}: SkeletonLoaderProps) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { 
          toValue: 0.7, 
          duration: 800, 
          useNativeDriver: true 
        }),
        Animated.timing(opacity, { 
          toValue: 0.3, 
          duration: 800, 
          useNativeDriver: true 
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        // 👇 AQUÍ ESTABA EL ERROR: Agregamos "as any" para que TS no se queje de la animación
        { opacity, width, height, borderRadius } as any, 
        style
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E0E0E0', 
    overflow: 'hidden',
  },
});

export default SkeletonLoader;