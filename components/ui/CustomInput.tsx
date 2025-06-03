// components/ui/CustomInput.tsx

import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';

interface CustomInputProps extends TextInputProps {
  icon: any;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  showEyeIcon?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
}

export default function CustomInput({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  showEyeIcon = false,
  keyboardType = 'default',
  ...rest
}: CustomInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.inputContainer}>
      <Image source={icon} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#64748B"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        keyboardType={keyboardType}
        {...rest}
      />
      {showEyeIcon && (
        <TouchableOpacity onPress={togglePasswordVisibility}>
          <Image
            source={
              isPasswordVisible
                ? require('../../assets/images/open.png')
                : require('../../assets/images/cache.png')
            }
            style={styles.iconEye}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#A478DD',
    borderRadius: 5,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#A478DD',
    marginRight: 10,
  },
  iconEye: {
    width: 20,
    height: 20,
    tintColor: '#A478DD',
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    color: '#371B34',
    fontFamily: 'Inter_400Regular',
  },
});
