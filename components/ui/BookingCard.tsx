import React, { useState } from 'react';
import { Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import AppText from './AppText';
import ReviewModal from './ReviewModal';

function formatReviewDate(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d as any)) return dateStr ?? '';
  return d
    .toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(',', ' à');
}

interface BookingCardProps {
  title: string;
  dateSchedule: string;
  timeSchedule: string;
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
  reviewId?: string;
  duration?: number;
  paymentId?: number;   // <-- Ajout
  providerId?: number;  // <-- Ajout
  role: 'Admin' | 'Client' | 'Provider';
  onPressConfirm?: () => void;
  onPressCancel?: () => void;
  onPressDeleteReview?: () => void;
  onPressModifyPayment?: () => void;
  onSubmitReview?: (rating: number, comment: string, reviewId?: string | null) => void;
}

export default function BookingCard({
  title,
  dateSchedule,
  timeSchedule,
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
  reviewId,
  duration,
  paymentId,
  providerId,
  role,
  onPressConfirm,
  onPressCancel,
  onPressDeleteReview,
  onPressModifyPayment,
  onSubmitReview,
}: BookingCardProps) {
  const statusColor =
    status === 'Confirmé' ? '#6A0DAD' :
    status === 'Terminé et payé' ? '#4CAF50' : '#000';

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [modifyPaymentModalVisible, setModifyPaymentModalVisible] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    Toast.show({
      type,
      text1: message,
      position: 'bottom',
      visibilityTime: 2000,
    });
  };

  

  // Texte de confirmation selon le rôle
  const getConfirmModalText = () => {
    if (role === 'Provider') {
      return 'Êtes-vous sûr de vouloir indiquer que le paiement a bien été reçu pour cette prestation ?';
    }
    return 'Êtes-vous sûr de vouloir confirmer le paiement ?';
  };

  // Gestion du clic sur le bouton de confirmation (adapté Provider)
  const handleConfirmAction = async () => {
  if (onPressConfirm) {
    await onPressConfirm();
  }
  setConfirmModalVisible(false);
};


  const handleCancelAction = async () => {
    if (onPressCancel) {
      await onPressCancel();
    }
    setCancelModalVisible(false);
  };

  const handleModifyPayment = (option: 'Payé' | 'Litige') => {
    onPressModifyPayment && onPressModifyPayment();
    showToast(`Statut du paiement : ${option}`);
    setModifyPaymentModalVisible(false);
  };

  const handleOpenReviewModalForCreate = () => {
    setEditingReviewId(null);
    setIsEditingReview(false);
    setShowReviewModal(true);
  };

  const handleOpenReviewModalForEdit = () => {
    setEditingReviewId(reviewId ?? null);
    setIsEditingReview(true);
    setShowReviewModal(true);
  };

  const handleSubmitReview = (ratingValue: number, commentValue: string) => {
    onSubmitReview && onSubmitReview(ratingValue, commentValue, editingReviewId ?? null);
    showToast('Avis soumis !');
    setShowReviewModal(false);
    setIsEditingReview(false);
  };

  const formatDateSchedule = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(2);
    return `${day}/${month}/${year}`;
  };

  const formatTimeSchedule = (timeStr: string) => {
    if (!timeStr) return '';
    const date = new Date(`1970-01-01T${timeStr}Z`);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const getFormattedDuration = () => {
    if (!duration) return '';
    if (duration >= 60) {
      const h = Math.floor(duration / 60);
      const m = duration % 60;
      return m === 0 ? `${h}h` : `${h}h${m}`;
    }
    return `${duration} min`;
  };

  const showProviderInfo = role === 'Client' || (role === 'Admin' && providerName);
  const showClientInfo = role === 'Provider' || (role === 'Admin' && clientName);

  return (
    <View style={styles.card}>
      {/* Modal d'avis */}
      <ReviewModal
        visible={showReviewModal}
        onClose={() => { setShowReviewModal(false); setIsEditingReview(false); }}
        initialRating={isEditingReview ? rating ?? 0 : 0}
        initialComment={isEditingReview ? review ?? '' : ''}
        onSubmit={handleSubmitReview}
        modalTitle={isEditingReview ? 'Modifier votre avis' : 'Écrire un avis'}
      />

      {/* Modal Modifier le paiement (ADMIN seulement) */}
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

      {/* Modal confirmer paiement (texte selon rôle) */}
      <Modal transparent visible={confirmModalVisible} animationType="fade" onRequestClose={() => setConfirmModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <AppText style={styles.modalTitle}>Confirmation</AppText>
            <AppText style={styles.modalText}>{getConfirmModalText()}</AppText>
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
        <View style={{ flex: 1 }}>
          <AppText style={styles.title}>{title}</AppText>
          <AppText style={styles.date}>
            {formatDateSchedule(dateSchedule)} à {formatTimeSchedule(timeSchedule)}
          </AppText>
          {status === 'Annulé' && (
            <AppText style={{ color: '#a478dd', fontWeight: 'bold', marginTop: 10 }}>
              Cette réservation a été annulée.
            </AppText>
          )}
        </View>
        <View style={{ alignItems: 'flex-end', marginLeft: 10 }}>
          <AppText style={[styles.status, { color: statusColor }]}>{status}</AppText>
          <AppText style={styles.price}>{price}€</AppText>
        </View>
      </View>

      <View style={styles.row}>
        <Image source={require('../../assets/images/clock.png')} style={styles.icon} />
        <AppText style={styles.duration}>{getFormattedDuration()}</AppText>
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={require('../../assets/images/starbooking.png')} style={styles.starIcon} />
              <AppText style={styles.reviewLabel}>
                Note <AppText style={styles.bold}>{rating}/5</AppText>
              </AppText>
            </View>
            <AppText style={styles.reviewDateTop}>{formatReviewDate(reviewDate)}</AppText>
          </View>
          <AppText style={styles.reviewText}>{review}</AppText>
          {(role === 'Client' || role === 'Admin') && (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 1 }}>
              <TouchableOpacity
                onPress={handleOpenReviewModalForEdit}
                style={[styles.confirmButton, { paddingVertical: 6, paddingHorizontal: 12 }]}
              >
                <AppText style={styles.buttonText}>Modifier l’avis</AppText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        role === 'Client' && status !== 'Annulé' && (
          <TouchableOpacity
            onPress={handleOpenReviewModalForCreate}
            style={[styles.writeReviewButton, { marginTop: 10 }]}
          >
            <AppText style={styles.buttonText}>Écrire un avis</AppText>
          </TouchableOpacity>
        )
      )}

      {/* Boutons principaux selon rôle */}
      {role === 'Admin' && (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.confirmButton} onPress={() => setConfirmModalVisible(true)}>
            <AppText style={styles.buttonText}>Confirmer le paiement</AppText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={() => setModifyPaymentModalVisible(true)}>
            <AppText style={styles.buttonText}>Modifier le paiement</AppText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setCancelModalVisible(true)}>
            <AppText style={styles.buttonText}>Annuler la réservation</AppText>
          </TouchableOpacity>
        </View>
      )}

      {role === 'Client' && status !== 'Annulé' && (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setCancelModalVisible(true)}>
            <AppText style={styles.buttonText}>Annuler la réservation</AppText>
          </TouchableOpacity>
        </View>
      )}

      {/* PROVIDER → "Paiement reçu" */}
      {role === 'Provider' && status === 'Confirmé' && (
  <TouchableOpacity style={styles.confirmButton} onPress={() => setConfirmModalVisible(true)}>
    <AppText style={styles.buttonText}>Paiement reçu</AppText>
  </TouchableOpacity>
)}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F6EDF9',
    borderRadius: 5,
    padding: 17,
    marginBottom: 29,
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: { fontWeight: 'bold', fontSize: 17, color: '#000' },
  status: { fontWeight: 'bold', fontSize: 17 },
  price: { fontWeight: 'bold', fontSize: 18, color: '#000', marginTop: 10, marginRight: 15 },
  date: { fontSize: 15, color: '#000', marginTop: 2, marginBottom: 0 },
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
  reviewText: { fontSize: 14, color: '#000', fontWeight: 'bold', marginTop: 8 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  confirmButton: {
    backgroundColor: '#a478dd',
    borderRadius: 5,
    padding: 8,
    marginRight: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  cancelButton: {
    backgroundColor: '#000',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: { color: '#fff' },
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
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalText: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: '#ddd',
  },
  modalButtonText: { color: '#000', fontWeight: 'bold' },
  writeReviewButton: {
    width: 150,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: '#a478dd',
  },
  reviewDateTop: {
    fontSize: 13,
    color: '#888',
    fontWeight: 'normal',
    marginLeft: 8,
    alignSelf: 'flex-start',
  },
});
