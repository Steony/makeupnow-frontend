import React, { useState } from 'react';
import { Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import AppText from './AppText';
import ReviewModal from './ReviewModal';

interface BookingCardProps {
  title: string;
  date: string;
  time: string;
  price: number;
  status: string;
  address: string;
  providerName?: string;
  providerEmail?: string;
  providerPhone?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  rating?: number;
  review?: string;
  reviewDate?: string;
  role: 'Admin' | 'Client' | 'Provider';
  onPressConfirm?: () => void;
  onPressCancel?: () => void;
  onPressDeleteReview?: () => void;
  onPressModifyPayment?: () => void;
  onSubmitReview?: (rating: number, comment: string) => void;
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
  clientName,
  clientEmail,
  clientPhone,
  rating,
  review,
  reviewDate,
  role,
  onPressConfirm,
  onPressCancel,
  onPressDeleteReview,
  onPressModifyPayment,
  onSubmitReview,
}: BookingCardProps) {
  const statusColor =
    status === 'Confirmée' ? '#6A0DAD' :
    status === 'Terminée et payée' ? '#4CAF50' : '#000';

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [modifyPaymentModalVisible, setModifyPaymentModalVisible] = useState(false);
  const [deleteReviewModalVisible, setDeleteReviewModalVisible] = useState(false);

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

  const handleModifyPayment = (option: 'Payé' | 'Litige') => {
    onPressModifyPayment && onPressModifyPayment();
    showToast(`Statut du paiement : ${option}`);
    setModifyPaymentModalVisible(false);
  };

  const handleSubmitReview = (ratingValue: number, commentValue: string) => {
    onSubmitReview && onSubmitReview(ratingValue, commentValue);
    showToast('Avis soumis !');
    setShowReviewModal(false);
    setIsEditingReview(false);
  };

  const showProviderInfo = role === 'Client' || (role === 'Admin' && providerName);
  const showClientInfo = role === 'Provider' || (role === 'Admin' && clientName);

  return (
    <View style={styles.card}>
      <ReviewModal
        visible={showReviewModal}
        onClose={() => { setShowReviewModal(false); setIsEditingReview(false); }}
        initialRating={isEditingReview ? rating ?? 0 : 0}
        initialComment={isEditingReview ? review ?? '' : ''}
        onSubmit={handleSubmitReview}
        modalTitle={isEditingReview ? 'Modifier votre avis' : 'Écrire un avis'}
      />

      {/* Modal Modifier le paiement */}
      <Modal transparent visible={modifyPaymentModalVisible} animationType="fade" onRequestClose={() => setModifyPaymentModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <AppText style={styles.modalTitle}>Modifier le paiement</AppText>
            <AppText style={styles.modalText}>Choisir un statut :</AppText>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => handleModifyPayment('Payé')} style={[styles.modalButton, { backgroundColor: '#4CAF50' }]}>
                <AppText style={[styles.modalButtonText, { color: '#fff' }]}>Payé</AppText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleModifyPayment('Litige')} style={[styles.modalButton, { backgroundColor: '#e54d4d' }]}>
                <AppText style={[styles.modalButtonText, { color: '#fff' }]}>Litige</AppText>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.modalButton, { marginTop: 10, alignSelf: 'center' }]}
              onPress={() => setModifyPaymentModalVisible(false)}
            >
              <AppText style={styles.modalButtonText}>Annuler</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal confirmer paiement */}
      <Modal transparent visible={confirmModalVisible} animationType="fade" onRequestClose={() => setConfirmModalVisible(false)}>
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

      {/* Modal annuler réservation */}
      <Modal transparent visible={cancelModalVisible} animationType="fade" onRequestClose={() => setCancelModalVisible(false)}>
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

      {showProviderInfo && (
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Coordonnées du prestataire :</AppText>
          <AppText style={styles.text}>{providerName}</AppText>
          <AppText style={styles.link}>{providerEmail}</AppText>
          <AppText style={styles.text}>{providerPhone}</AppText>
        </View>
      )}
      {showClientInfo && (
        <View style={styles.section}>
          <AppText style={styles.sectionTitle}>Coordonnées du client :</AppText>
          <AppText style={styles.text}>{clientName}</AppText>
          <AppText style={styles.link}>{clientEmail}</AppText>
          <AppText style={styles.text}>{clientPhone}</AppText>
        </View>
      )}

      <View style={styles.separator} />

      {rating !== undefined && review ? (
        <View style={styles.reviewSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Image source={require('../../assets/images/starbooking.png')} style={styles.starIcon} />
            <AppText style={styles.reviewLabel}>Note <AppText style={styles.bold}>{rating}/5</AppText></AppText>
          </View>
          <AppText style={styles.reviewDate}>{reviewDate}</AppText>
          <AppText style={styles.reviewText}>{review}</AppText>

          {(role === 'Client' || role === 'Admin') && (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              {/* Modifier l'avis */}
              <TouchableOpacity onPress={() => { setIsEditingReview(true); setShowReviewModal(true); }} style={[styles.confirmButton, { paddingVertical: 6, paddingHorizontal: 12 }]}>
                <AppText style={styles.buttonText}>Modifier l’avis</AppText>
              </TouchableOpacity>

              {/* Supprimer l'avis uniquement Admin */}
              {role === 'Admin' && (
                <TouchableOpacity onPress={() => setDeleteReviewModalVisible(true)} style={styles.cancelButton}>
                  <AppText style={styles.buttonText}>Supprimer l’avis</AppText>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      ) : (
       // Pas d'avis : bouton pour écrire un avis (uniquement client)
role === 'Client' && (
  <TouchableOpacity
    onPress={() => { setIsEditingReview(false); setShowReviewModal(true); }}
    style={[styles.writeReviewButton, { marginTop: 10 }]}
  >
    <AppText style={styles.buttonText}>Écrire un avis</AppText>
  </TouchableOpacity>
)

)}{/* Boutons principaux selon rôle */}
      {role === 'Admin' && (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.confirmButton} onPress={() => setModifyPaymentModalVisible(true)}>
            <AppText style={styles.buttonText}>Modifier le paiement</AppText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setCancelModalVisible(true)}>
            <AppText style={styles.buttonText}>Annuler la réservation</AppText>
          </TouchableOpacity>
        </View>
      )}

      {role === 'Client' && (
        <View style={styles.buttonRow}>
          {status === 'Confirmée' && (
            <TouchableOpacity style={styles.confirmButton} onPress={() => setConfirmModalVisible(true)}>
              <AppText style={styles.buttonText}>Confirmer le paiement</AppText>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.cancelButton} onPress={() => setCancelModalVisible(true)}>
            <AppText style={styles.buttonText}>Annuler la réservation</AppText>
          </TouchableOpacity>
        </View>
      )}

      {role === 'Provider' && status === 'Confirmée' && (
        <TouchableOpacity style={styles.confirmButton} onPress={() => setConfirmModalVisible(true)}>
          <AppText style={styles.buttonText}>Confirmer le paiement</AppText>
        </TouchableOpacity>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
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
  deleteReviewButton: { backgroundColor: '#000', borderRadius: 5, paddingVertical: 8, paddingHorizontal: 12, alignSelf: 'flex-start', marginTop: 10, marginBottom: 10 },
  buttonText: { color: '#fff' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '80%', backgroundColor: '#fff', borderRadius: 8, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalText: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: { flex: 1, alignItems: 'center', padding: 10, marginHorizontal: 5, borderRadius: 5, backgroundColor: '#ddd' },
  modalButtonText: { color: '#000', fontWeight: 'bold' },
  writeReviewButton: {
  width: 150,       // largeur fixe ou ce que tu veux
  alignItems: 'center', // pour centrer le texte horizontalement
  paddingVertical: 8,   // conserve un padding vertical confortable
  borderRadius: 5,
  backgroundColor: '#a478dd',
},

});
