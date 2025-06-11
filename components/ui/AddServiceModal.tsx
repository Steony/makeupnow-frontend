import AppText from '@/components/ui/AppText';
import FilterModalCategory from '@/components/ui/FilterModalCategory';
import { api } from '@/config/api';
import { useAuth } from '@/utils/AuthContext';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

interface MakeupService {
  id: number;
  title: string;
  price: number;
  categoryTitle: string;
  categoryId: number;
  description: string;
  duration: number;
}

interface AddServiceModalProps {
  visible: boolean;
  onClose: () => void;
  onServiceAdded: () => void;
  serviceToEdit?: MakeupService | null; // MODIF : service à modifier (optionnel)
}

export default function AddServiceModal({
  visible,
  onClose,
  onServiceAdded,
  serviceToEdit = null, // MODIF : valeur par défaut null
}: AddServiceModalProps) {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categoryTitle, setCategoryTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  // MODIF : Remplir les champs si serviceToEdit change
  useEffect(() => {
    if (serviceToEdit) {
      setTitle(serviceToEdit.title);
      setCategoryId(serviceToEdit.categoryId);
      setCategoryTitle(serviceToEdit.categoryTitle);
      setDescription(serviceToEdit.description);
      setPrice(serviceToEdit.price.toString());
      setDuration(serviceToEdit.duration.toString());
    } else {
      resetForm();
    }
  }, [serviceToEdit, visible]);

  const resetForm = () => {
    setTitle('');
    setCategoryId(null);
    setCategoryTitle('');
    setDescription('');
    setPrice('');
    setDuration('');
  };

  const handleSubmit = async () => {
    if (!title || !categoryId || !description || !price || !duration) {
      Toast.show({ type: 'error', text1: 'Tous les champs sont requis' });
      return;
    }
    if (!currentUser?.id) {
      Toast.show({ type: 'error', text1: 'Utilisateur non connecté' });
      return;
    }

    try {
      if (serviceToEdit) {
        // MODIF : PUT ou PATCH pour modifier
        await api.put(`/makeup-services/${serviceToEdit.id}`, {
          title,
          categoryId,
          description,
          price: parseFloat(price),
          duration: parseInt(duration, 10),
          providerId: currentUser.id,
        });
        Toast.show({ type: 'success', text1: 'Prestation modifiée !' });
      } else {
        // POST pour création
        await api.post('/makeup-services', {
          title,
          categoryId,
          description,
          price: parseFloat(price),
          duration: parseInt(duration, 10),
          providerId: currentUser.id,
        });
        Toast.show({ type: 'success', text1: 'Prestation ajoutée !' });
      }

      onServiceAdded();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la création/modification de la prestation :', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: serviceToEdit
          ? "Impossible de modifier la prestation"
          : "Impossible d'ajouter la prestation",
      });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <AppText style={styles.title}>
            {serviceToEdit ? 'Modifier une prestation' : 'Ajouter une prestation'}
          </AppText>

          <AppText style={styles.label}>Titre</AppText>
          <TextInput
            style={styles.input}
            placeholder="Titre de la prestation"
            value={title}
            onChangeText={setTitle}
          />

          <AppText style={styles.label}>Catégorie</AppText>
          <TouchableOpacity
            style={[styles.input, { justifyContent: 'center' }]}
            onPress={() => setIsCategoryModalVisible(true)}
          >
            <AppText style={{ color: categoryTitle ? '#000' : '#999' }}>
              {categoryTitle || 'Sélectionner une catégorie'}
            </AppText>
          </TouchableOpacity>

          <AppText style={styles.label}>Description</AppText>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <View style={styles.rowContainer}>
            <View style={styles.rowItem}>
              <AppText style={styles.label}>Prix (€)</AppText>
              <TextInput
                style={styles.input}
                placeholder="Prix"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>

            <View style={styles.rowItem}>
              <AppText style={styles.label}>Durée (min)</AppText>
              <TextInput
                style={styles.input}
                placeholder="Durée"
                keyboardType="numeric"
                value={duration}
                onChangeText={setDuration}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <AppText style={styles.buttonText}>
              {serviceToEdit ? 'Modifier' : 'Valider'}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={() => {
            onClose();
            resetForm();
          }}>
            <AppText style={styles.closeButtonText}>Fermer</AppText>
          </TouchableOpacity>

          <FilterModalCategory
            visible={isCategoryModalVisible}
            onClose={() => setIsCategoryModalVisible(false)}
            onSelect={(selected) => {
              if (selected.length > 0) {
                setCategoryId(selected[0].id);
                setCategoryTitle(selected[0].title);
              } else {
                setCategoryId(null);
                setCategoryTitle('');
              }
              setIsCategoryModalVisible(false);
            }}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    padding: 20,
    marginVertical: 50,
    marginLeft: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 15,
    color: '#a478dd',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowItem: {
    flex: 1,
  },
  button: {
    backgroundColor: '#a478dd',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#a478dd',
    textDecorationLine: 'underline',
  },
});
