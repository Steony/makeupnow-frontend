import AppText from '@/components/ui/AppText';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface ScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (slotData: { date: string; startTime: string; endTime: string }) => void;
  initialData?: { date: string; startTime: string; endTime: string }; // Pour modification
  mode?: 'add' | 'edit';
}

export default function ScheduleModal({
  visible,
  onClose,
  onSubmit,
  initialData,
  mode = 'add',
}: ScheduleModalProps) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setStartTime(initialData.startTime);
      setEndTime(initialData.endTime);
    } else {
      setDate('');
      setStartTime('');
      setEndTime('');
    }
  }, [initialData, visible]);

  const handleSubmit = () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!dateRegex.test(date)) {
      alert("Date invalide. Format attendu : AAAA-MM-JJ (ex: 2025-06-10)");
      return;
    }
    if (!timeRegex.test(startTime)) {
      alert("Heure de début invalide. Format attendu : HH:mm (ex: 09:00)");
      return;
    }
    if (!timeRegex.test(endTime)) {
      alert("Heure de fin invalide. Format attendu : HH:mm (ex: 13:00)");
      return;
    }

    onSubmit({ date, startTime, endTime });
    // onClose est appelé après succès dans le parent pour éviter fermeture prématurée
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <AppText style={styles.title}>
            {mode === 'add' ? 'Ajouter un créneau' : 'Modifier le créneau'}
          </AppText>

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
            <AppText style={styles.buttonText}>
              {mode === 'add' ? 'Valider' : 'Enregistrer'}
            </AppText>
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
