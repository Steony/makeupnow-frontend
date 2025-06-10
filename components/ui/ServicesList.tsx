import { api } from '@/config/api';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

// 👉 Types pour props et services
export interface MakeupService {
  id: number;
  title: string;
  price: number;
  categoryTitle: string;
  description: string;
  duration: number;
}

interface ServicesListProps {
  services: MakeupService[];
  onEdit: (id: number) => void;
  refreshServices: () => void;
}

const ServicesList: React.FC<ServicesListProps> = ({ services, onEdit, refreshServices }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);

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
    } catch  {
      setModalVisible(false);
      setServiceToDelete(null);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: "Impossible de supprimer ce service.",
      });
    }
  };

  return (
    <>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
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
                <Text style={styles.duration}> {item.duration / 60}h</Text>
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
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

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
    backgroundColor: '#d3c4d8',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginHorizontal: 4,
  },
  deleteButton: {
    backgroundColor: '#333',
  },
  buttonText: {
    fontSize: 13,
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
