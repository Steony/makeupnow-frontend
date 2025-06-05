import AppText from '@/components/ui/AppText'; // 👈 Ajouté pour remplacer <Text>
import React, { useState } from 'react';
import { Image, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  initialRating?: number;
  initialComment?: string;
  modalTitle?: string;
}

export default function ReviewModal({
  visible,
  onClose,
  onSubmit,
  initialRating = 0,
  initialComment = '',
  modalTitle = 'Écrire un avis',
}: ReviewModalProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);

  const handleStarPress = (index: number) => {
    setRating(index);
  };

  const handleSubmit = () => {
    onSubmit(rating, comment);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <AppText style={styles.title}>{modalTitle}</AppText>

          <View style={styles.separator} />

          <AppText style={styles.label}>Note</AppText>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <TouchableOpacity key={i} onPress={() => handleStarPress(i)}>
                <Image
                  source={
                    i <= rating
                      ? require('../../assets/images/starbooking.png')
                      : require('../../assets/images/starbookingempty.png')
                  }
                  style={styles.starIcon}
                />
              </TouchableOpacity>
            ))}
          </View>

          <AppText style={styles.label}>Commentaire</AppText>
          <TextInput
            style={styles.input}
            multiline
            value={comment}
            onChangeText={setComment}
            placeholder="Écrire son avis"
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
  starsRow: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  starIcon: {
    width: 30,
    height: 30,
    marginRight: 4,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 8,
    minHeight: 150,
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
