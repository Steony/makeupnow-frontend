import AppText from '@/components/ui/AppText';
import React, { useState } from 'react';
import { Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface ScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (slotData: { date: string; startTime: string; endTime: string }) => void;
  providerAddress?: string; // ✅ Ajout pour affichage en lecture seule
}

export default function ScheduleModal({
  visible,
  onClose,
  onSubmit,
  providerAddress, // ✅ récupère l’adresse en prop
}: ScheduleModalProps) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleSubmit = () => {
    onSubmit({ date, startTime, endTime });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <AppText style={styles.title}>Ajouter un créneau</AppText>

          

          <View style={styles.separator} />

          <AppText style={styles.label}>Date</AppText>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="Ex: 2025-06-10"
          />

          <AppText style={styles.label}>Heure de début</AppText>
          <TextInput
            style={styles.input}
            value={startTime}
            onChangeText={setStartTime}
            placeholder="Ex: 11:00"
          />

          <AppText style={styles.label}>Heure de fin</AppText>
          <TextInput
            style={styles.input}
            value={endTime}
            onChangeText={setEndTime}
            placeholder="Ex: 13:00"
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <AppText style={styles.buttonText}>Valider</AppText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <AppText style={styles.closeButtonText}>Fermer</AppText>
          </TouchableOpacity>
        </View>
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
    borderRadius: 8,
    width: '90%',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 10,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#a478dd',
    padding: 12,
    borderRadius: 5,
    marginTop: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#a478dd',
    textDecorationLine: 'underline',
  },
});
