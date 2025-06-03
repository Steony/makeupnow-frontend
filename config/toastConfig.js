import { BaseToast, ErrorToast } from 'react-native-toast-message';

export const toastConfig = {
  error: (props) => (
    <ErrorToast
      {...props}
      text1NumberOfLines={2}
      text1Style={{
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
      }}
      text2NumberOfLines={10}
      text2Style={{
        fontSize: 20,
        color: '#333',
      }}
      style={{
        borderLeftColor: 'red',
        alignSelf: 'center',
        width: '95%',
        minHeight: 100,
        shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 2,
      }}
      containerStyle={{
        width: '100%',
        alignSelf: 'center',
      }}
    />
  ),
  success: (props) => (
    <BaseToast
      {...props}
      text1NumberOfLines={2}
      text1Style={{
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
      }}
      text2NumberOfLines={10}
      text2Style={{ fontSize: 20, color: '#333' }}
      style={{
        borderLeftColor: 'green', 
        width: '95%',
        alignSelf: 'center',
        minHeight: 100,
        shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 2,
      }}
      containerStyle={{
        width: '100%',
        alignSelf: 'center',
      }}
    />
  ),
};
