// components/ui/AppText.tsx
import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

export default function AppText(props: TextProps) {
  return (
    <Text {...props} style={[styles.defaultStyle, props.style]}>
      {props.children}
    </Text>
  );
}

const styles = StyleSheet.create({
  defaultStyle: {
    fontFamily: 'Inter_400Regular',
  },
});
