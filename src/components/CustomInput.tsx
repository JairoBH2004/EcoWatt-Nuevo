import React, { useState } from 'react';
// 👇 Importamos StyleProp y TextStyle
import { TextInput, TextInputProps, StyleSheet, StyleProp, TextStyle } from 'react-native';

interface CustomInputProps extends TextInputProps {
  // 👇 CAMBIO CLAVE: Ahora acepta estilos de texto (color, font, etc.)
  style?: StyleProp<TextStyle>; 
}

const CustomInput = ({ style, ...props }: CustomInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TextInput
      {...props}
      onFocus={(e) => {
        setIsFocused(true);
        props.onFocus && props.onFocus(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        props.onBlur && props.onBlur(e);
      }}
      style={[
        styles.input,
        style,
        isFocused && styles.inputFocused 
      ]}
      placeholderTextColor="#888"
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 15,
  },
  inputFocused: {
    borderColor: '#00FF7F', 
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
});

export default CustomInput;