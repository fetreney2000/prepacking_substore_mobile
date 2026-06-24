import React, { useState } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonModal, IonInput, IonLabel, IonItem, IonAlert, useIonActionSheet, IonRefresher, IonRefresherContent } from '@ionic/react';
import { add, create, trash, close, checkmark, people } from 'ionicons/icons';
import { useAppContext } from '../App';
import { api } from '../utils/api';
import { Group } from '../utils/types';

const GroupsPage: React.FC = () => {
  const { groups, skus, refreshData, showToast } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [presentActionSheet] = useIonActionSheet();

  const openAdd = () => {
    setEditId(null);
    setFormName('');
    setFormNotes('');
    setShowModal(true);
  };

  const openEdit = (g: Group) => {
    setEditId(g.id);
    setFormName(g.name);
    setFormNotes(g.notes || '');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      showToast('Nama kumpulan diperlukan', 'error');
      return;
    }
    try {
      if (editId) {
        await api.updateGroup(editId, { name: formName.trim(), notes: formNotes.trim() });
        showToast('Kumpulan dikemaskini');
      } else {
        await api.createGroup({ name: formName.trim(), notes: formNotes.trim() });
        showToast('Kumpulan ditambah');
      }
      setShowModal(false);
      await refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const confirmDelete = (id: number) => {
    setDeleteTarget(id);
    setShowDeleteAlert(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteGroup(deleteTarget);
      showToast('Kumpulan dipadam');
      await refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
    setShowDeleteAlert(false);
    setDeleteTarget(null);
  };

  const showActions = (g: Group) => {
    presentActionSheet({
      header: g.name,
      buttons: [
        { text: 'Edit', icon: create, handler: () => openEdit(g) },
        { text: 'Padam', icon: trash, role: 'destructive', handler: () => confirmDelete(g.id) },
        { text: 'Batal', role: 'cancel' }
      ]
    });
  };

  const handleRefresh = async (e: CustomEvent) => {
    await refreshData();
    e.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Pengurusan Kumpulan</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={openAdd}>
              <IonIcon slot="icon-only" icon={add} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingText="Tarik untuk muat semula" refreshingText="Memuatkan..." />
        </IonRefresher>

        {groups.length === 0 ? (
          <div className="empty-state">
            <IonIcon icon={people} style={{ fontSize: '48px', opacity: 0.3 }} />
            <p>Tiada kumpulan</p>
          </div>
        ) : (
          groups.map(g => {
            const skuCount = skus.filter(s => s.groupId === g.id).length;
            return (
              <div className="list-card-item" key={g.id} onClick={() => showActions(g)} style={{ cursor: 'pointer' }}>
                <div className="lci-title">{g.name}</div>
                {g.notes && <div className="lci-sub">{g.notes}</div>}
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{skuCount} SKU</div>
              </div>
            );
          })
        )}

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{editId ? 'Edit Kumpulan' : 'Tambah Kumpulan'}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}><IonIcon icon={close} /></IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="form-section" style={{ paddingTop: '16px' }}>
              <IonItem>
                <IonLabel position="stacked">Nama</IonLabel>
                <IonInput value={formName} onIonInput={e => setFormName(e.detail.value!)} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Nota</IonLabel>
                <IonInput value={formNotes} onIonInput={e => setFormNotes(e.detail.value!)} placeholder="Pilihan" />
              </IonItem>
              <div style={{ padding: '16px 0' }}>
                <IonButton expand="block" onClick={handleSave}>
                  <IonIcon icon={checkmark} slot="start" />
                  Simpan
                </IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Pengesahan"
          message="Adakah anda pasti mahu memadam kumpulan ini?"
          buttons={[
            { text: 'Batal', role: 'cancel' },
            { text: 'Padam', role: 'destructive', handler: handleDelete }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default GroupsPage;
