import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon,
  IonInput, IonLabel, IonItem, IonSelect, IonSelectOption, IonRefresher, IonRefresherContent } from '@ionic/react';
import { save } from 'ionicons/icons';
import { useAppContext } from '../App';
import { api } from '../utils/api';

const SettingsPage: React.FC = () => {
  const { settings, refreshData, showToast } = useAppContext();
  const [form, setForm] = useState({
    appTitle: '',
    minWeeks: 2,
    bufferWeeks: 4,
    maxWeeks: 6,
    defaultFilename: '',
    layoutMode: 'table' as string
  });

  useEffect(() => {
    setForm({
      appTitle: settings.appTitle || '',
      minWeeks: settings.minWeeks || 2,
      bufferWeeks: settings.bufferWeeks || 4,
      maxWeeks: settings.maxWeeks || 6,
      defaultFilename: settings.defaultFilename || '',
      layoutMode: settings.layoutMode || 'table'
    });
  }, [settings]);

  const handleSave = async () => {
    try {
      await api.updateSettings({
        appTitle: form.appTitle.trim(),
        minWeeks: Number(form.minWeeks) || 2,
        bufferWeeks: Number(form.bufferWeeks) || 4,
        maxWeeks: Number(form.maxWeeks) || 6,
        defaultFilename: form.defaultFilename.trim(),
        layoutMode: form.layoutMode
      });
      document.title = form.appTitle || 'Sistem Inventori Prabungkus';
      showToast('Tetapan disimpan');
      await refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRefresh = async (e: CustomEvent) => {
    await refreshData();
    e.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tetapan</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingText="Tarik untuk muat semula" refreshingText="Memuatkan..." />
        </IonRefresher>

        <div className="form-section" style={{ paddingTop: '12px' }}>
          <IonItem>
            <IonLabel position="stacked">Tajuk Aplikasi</IonLabel>
            <IonInput value={form.appTitle} onIonInput={e => setForm({...form, appTitle: e.detail.value!})} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Minggu Minimum</IonLabel>
            <IonInput type="number" value={form.minWeeks} min={1} max={12}
              onIonInput={e => setForm({...form, minWeeks: Number(e.detail.value)})} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Minggu Penimbal (Buffer)</IonLabel>
            <IonInput type="number" value={form.bufferWeeks} min={1} max={12}
              onIonInput={e => setForm({...form, bufferWeeks: Number(e.detail.value)})} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Minggu Maksimum</IonLabel>
            <IonInput type="number" value={form.maxWeeks} min={1} max={52}
              onIonInput={e => setForm({...form, maxWeeks: Number(e.detail.value)})} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Nama Fail Default</IonLabel>
            <IonInput value={form.defaultFilename} onIonInput={e => setForm({...form, defaultFilename: e.detail.value!})} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Mod Paparan</IonLabel>
            <IonSelect value={form.layoutMode} onIonChange={e => setForm({...form, layoutMode: e.detail.value})} interface="action-sheet">
              <IonSelectOption value="table">Jadual</IonSelectOption>
              <IonSelectOption value="card">Kad</IonSelectOption>
            </IonSelect>
          </IonItem>

          <div style={{ padding: '16px 0' }}>
            <IonButton expand="block" onClick={handleSave}>
              <IonIcon icon={save} slot="start" />
              Simpan Tetapan
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
