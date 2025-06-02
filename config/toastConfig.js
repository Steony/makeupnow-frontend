import { BaseToast, ErrorToast } from 'react-native-toast-message';

export const toastConfig = {
  error: (props) => (
    <ErrorToast
      {...props}
      text1NumberOfLines={2}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
      }}
      text2NumberOfLines={10} // 👈 Augmente le nombre de lignes
      text2Style={{
        fontSize: 14,
        color: '#333',
      }}
      style={{
        borderLeftColor: 'red',
        alignSelf: 'center',
        width: '95%', // 👈 Augmente encore la largeur
        minHeight: 100, // 👈 Ajoute une hauteur minimale
      }}
      containerStyle={{
        width: '100%', // 👈 Prend toute la largeur du container parent
        alignSelf: 'center',
      }}
    />
  ),
  success: (props) => (
    <BaseToast
      {...props}
      text1NumberOfLines={2}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
      }}
      text2NumberOfLines={5}
      text2Style={{ fontSize: 14, color: '#333' }}
      style={{
        width: '95%',
        alignSelf: 'center',
        minHeight: 80,
      }}
      containerStyle={{
        width: '100%',
        alignSelf: 'center',
      }}
    />
  ),
};
