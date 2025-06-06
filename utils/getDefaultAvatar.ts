
// utils/getDefaultAvatar.ts

export const getDefaultAvatar = (role: 'CLIENT' | 'PROVIDER' | 'ADMIN') => {
  switch (role) {
    case 'CLIENT':
      return require('@/assets/images/avatarclient.png');
    case 'PROVIDER':
      return require('@/assets/images/avatarprovider.png');
    case 'ADMIN':
      return require('@/assets/images/avataradmin.png');
    default:
      return require('@/assets/images/avatarclient.png'); // fallback par défaut
  }
};
