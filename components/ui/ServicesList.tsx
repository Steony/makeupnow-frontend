import { api } from '@/config/api';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

// 👉 Types pour props et services
export interface MakeupService {
  id: number;
  title: string;
  price: number;
  categoryTitle: string;
  description: string;
  duration: number; // durée en minutes
}

interface ServicesListProps {
  services: MakeupService[];
  onEdit: (id: number) => void;
  refreshServices: () => void;
}

const ServicesList: React.FC<ServicesListProps> = ({ services, onEdit, refreshServices }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);

  // Formate la durée en "XhYY" (ex: 1h30)
  const formatDuration = (durationInMinutes: number) => {
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    const minutesFormatted = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}h${minutesFormatted}`;
  };

  // Ouvre le modal de confirmation
  const askDelete = (serviceId: number) => {
    setServiceToDelete(serviceId);
    setModalVisible(true);
  };

  // Supprime le service (après confirmation)
  const handleDeleteConfirmed = async () => {
    if (!serviceToDelete) return;
    try {
      await api.delete(`/makeup-services/${serviceToDelete}`);
      Toast.show({
        type: 'success',
        text1: 'Supprimé',
        text2: 'Service supprimé avec succès.',
      });
      setModalVisible(false);
      setServiceToDelete(null);
      refreshServices();
    } catch {
      setModalVisible(false);
      setServiceToDelete(null);
      Toast.show({
  type: 'error',
  text1: 'Suppression impossible',
  text2: 'Impossible de supprimer une prestation qui a déjà des réservations.',
});

    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {services.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.price}>{item.price}€</Text>
            </View>
            <Text style={styles.category}>{item.categoryTitle}</Text>
            <Text style={styles.description}>
              <Text style={styles.bold}>Description :</Text> {item.description}
            </Text>
            <View style={styles.rowBetween}>
              <View style={styles.row}>
                <Ionicons name="time-outline" size={16} color="#8a2be2" />
                <Text style={styles.duration}> {formatDuration(item.duration)}</Text>
              </View>
              <View style={styles.row}>
                <TouchableOpacity style={styles.button} onPress={() => onEdit(item.id)}>
                  <Text style={styles.buttonText}>Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={() => askDelete(item.id)}
                >
                  <Text style={[styles.buttonText, styles.deleteButtonText]}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal de confirmation */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirmation</Text>
            <Text style={styles.modalText}>
              Êtes-vous sûr de vouloir supprimer ce service ?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteConfirmed}
                style={[styles.modalButton, { backgroundColor: '#a478dd' }]}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Oui</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f9f0f5',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  price: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  category: {
    fontStyle: 'italic',
    color: '#888',
    marginBottom: 4,
  },
  description: {
    marginVertical: 8,
    fontSize: 14,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
  },
  duration: {
    color: '#333',
  },
  button: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  deleteButton: {
    backgroundColor: '#333',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginLeft: 45,
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
  },
  deleteButtonText: {
    color: '#fff',
  },
  // Modal styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: '#ddd',
  },
  modalButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default ServicesList;
