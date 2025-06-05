import React, { useState } from 'react';
import { Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import AppText from './AppText'; // ✅ Ajouté AppText
import ReviewModal from './ReviewModal';

interface BookingCardProps {
  title: string;
  date: string;
  time: string;
  price: number;
  status: string;
  address: string;
  providerName: string;
  providerEmail: string;
  providerPhone: string;
  rating?: number;
  review?: string;
  reviewDate?: string;
  onPressConfirm?: () => void;
  onPressCancel?: () => void;
}

export default function BookingCard({
  title,
  date,
  time,
  price,
  status,
  address,
  providerName,
  providerEmail,
  providerPhone,
  rating,
  review,
  reviewDate,
  onPressConfirm,
  onPressCancel,
}: BookingCardProps) {
  const statusColor =
    status === 'Confirmée' ? '#6A0DAD' :
    status === 'Terminée et payée' ? '#4CAF50' : '#000';

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  const showToast = (message: string) => {
    Toast.show({
      type: 'success',
      text1: message,
      position: 'bottom',
      visibilityTime: 2000,
    });
  };

  const handleConfirmAction = () => {
    onPressConfirm && onPressConfirm();
    showToast('Paiement confirmé avec succès !');
    setConfirmModalVisible(false);
  };

  const handleCancelAction = () => {
    onPressCancel && onPressCancel();
    showToast('Réservation annulée !');
    setCancelModalVisible(false);
  };

  return (
    <View style={styles.card}>
      <ReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        initialRating={rating}
        initialComment={review}
        onSubmit={(newRating, comment) => console.log('Avis soumis :', newRating, comment)}
        modalTitle={isEditingReview ? 'Modifier mon avis' : 'Écrire un avis'}
      />

      {/* Modal confirmation paiement */}
      <Modal
        animationType="fade"
        transparent
        visible={confirmModalVisible}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <AppText style={styles.modalTitle}>Confirmation</AppText>
            <AppText style={styles.modalText}>Êtes-vous sûr de vouloir confirmer le paiement ?</AppText>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setConfirmModalVisible(false)} style={styles.modalButton}>
                <AppText style={styles.modalButtonText}>Annuler</AppText>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmAction} style={[styles.modalButton, { backgroundColor: '#a478dd' }]}>
                <AppText style={[styles.modalButtonText, { color: '#fff' }]}>Oui</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal confirmation annulation */}
      <Modal
        animationType="fade"
        transparent
        visible={cancelModalVisible}
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <AppText style={styles.modalTitle}>Confirmation</AppText>
            <AppText style={styles.modalText}>Êtes-vous sûr de vouloir annuler la réservation ?</AppText>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setCancelModalVisible(false)} style={styles.modalButton}>
                <AppText style={styles.modalButtonText}>Non</AppText>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCancelAction} style={[styles.modalButton, { backgroundColor: '#000' }]}>
                <AppText style={[styles.modalButtonText, { color: '#fff' }]}>Oui</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Infos réservation */}
      <View style={styles.header}>
        <AppText style={styles.title}>{title}</AppText>
        <View style={{ alignItems: 'flex-end' }}>
          <AppText style={[styles.status, { color: statusColor }]}>{status}</AppText>
          <AppText style={styles.price}>{price}€</AppText>
        </View>
      </View>

      <AppText style={styles.date}>{date} à {time}</AppText>
      <View style={styles.row}>
        <Image source={require('../../assets/images/clock.png')} style={styles.icon} />
        <AppText style={styles.duration}>2h</AppText>
      </View>

      <View style={styles.row}>
        <Image source={require('../../assets/images/locationbooking.png')} style={styles.icon} />
        <AppText style={styles.address}>{address}</AppText>
      </View>

      <View style={styles.separator} />

      {/* Coordonnées prestataire */}
      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>Coordonnées du prestataire :</AppText>
        <AppText style={styles.text}>{providerName}</AppText>
        <AppText style={styles.link}>{providerEmail}</AppText>
        <AppText style={styles.text}>{providerPhone}</AppText>
      </View>

      <View style={styles.separator} />

      {/* Avis client */}
      {rating && review ? (
        <View style={styles.reviewSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Image source={require('../../assets/images/starbooking.png')} style={styles.starIcon} />
            <AppText style={styles.reviewLabel}>Note <AppText style={styles.bold}>{rating}/5</AppText></AppText>
          </View>
          <AppText style={styles.reviewDate}>{reviewDate}</AppText>
          <AppText style={styles.reviewText}>{review}</AppText>
          <TouchableOpacity onPress={() => { setShowReviewModal(true); setIsEditingReview(true); }}>
            <AppText style={[styles.link, { marginBottom: 8 }]}>Modifier son avis</AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TouchableOpacity onPress={() => { setShowReviewModal(true); setIsEditingReview(false); }} style={{ marginTop: 2, padding: 1 }}>
            <AppText style={styles.link}>Écrire un avis</AppText>
          </TouchableOpacity>
          <View style={styles.separator} />
        </>
      )}

      {/* Boutons actions */}
      {status === 'Confirmée' && (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.confirmButton} onPress={() => setConfirmModalVisible(true)}>
            <AppText style={styles.buttonText}>Confirmer le paiement</AppText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setCancelModalVisible(true)}>
            <AppText style={styles.buttonText}>Annuler</AppText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // inchangés !
  card: { backgroundColor: '#F6EDF9', borderRadius: 5, padding: 17, marginBottom: 29, shadowColor: '#000', shadowOpacity: 0.8, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontWeight: 'bold', fontSize: 17, color: '#000' },
  status: { fontWeight: 'bold', fontSize: 17 },
  price: { fontWeight: 'bold', fontSize: 18, color: '#000', marginTop: 10, marginRight: 15 },
  date: { fontSize: 15, marginVertical: 7, color: '#000', marginTop: -19 },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 1 },
  icon: { width: 28, height: 28, marginRight: 4 },
  address: { fontSize: 16, color: '#000' },
  duration: { fontSize: 16, color: '#000' },
  separator: { borderBottomWidth: 1, borderBottomColor: '#ccc', marginVertical: 8 },
  section: { marginTop: 6, padding: 10, backgroundColor: '#fff', borderRadius: 5, gap: 5 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 4, color: '#000' },
  text: { fontSize: 16, color: '#000' },
  link: { fontSize: 16, color: '#6A0DAD', textDecorationLine: 'underline' },
  reviewSection: { marginTop: 10, backgroundColor: '#fff', padding: 9, borderRadius: 5 },
  reviewLabel: { fontSize: 14, color: '#000', marginBottom: 4, marginTop: 5 },
  starIcon: { width: 20, height: 20, marginRight: 6 },
  bold: { fontWeight: 'bold' },
  reviewDate: { fontSize: 14, color: '#000', marginVertical: 4, marginBottom: 6 },
  reviewText: { fontSize: 14, color: '#000', marginBottom: 6 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  confirmButton: { backgroundColor: '#a478dd', borderRadius: 5, padding: 8, marginRight: 7 },
  cancelButton: { backgroundColor: '#000', borderRadius: 5, padding: 8 },
  buttonText: { color: '#fff' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '80%', backgroundColor: '#fff', borderRadius: 8, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalText: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: { flex: 1, alignItems: 'center', padding: 10, marginHorizontal: 5, borderRadius: 5, backgroundColor: '#ddd' },
  modalButtonText: { color: '#000', fontWeight: 'bold' },
});
