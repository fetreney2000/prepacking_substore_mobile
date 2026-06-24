import React, { useRef, useState } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonLabel, IonRefresher, IonRefresherContent } from '@ionic/react';
import { download, cloudUpload, document as docIcon } from 'ionicons/icons';
import { useAppContext } from '../App';
import { api } from '../utils/api';
import * as XLSX from 'xlsx';

const SyncPage: React.FC = () => {
  const { settings, refreshData, showToast } = useAppContext();
  const importInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    try {
      const data = await api.exportDb();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (settings.defaultFilename || 'substor') + '_' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data dieksport');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!window.confirm('Import akan menggantikan semua data sedia ada. Teruskan?')) return;
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = await api.importDb(data) as any;
      showToast(`Berjaya import: ${result.counts.settings} tetapan, ${result.counts.groups} kumpulan, ${result.counts.skus} SKU, ${result.counts.orders} pesanan`);
      await refreshData();
    } catch (err: any) {
      showToast('Ralat Import: ' + err.message, 'error');
    }
    setImporting(false);
    e.target.value = '';
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);
      const result = await api.importExcel({ filename: file.name, rows }) as any;

      let msg = `Dikemaskini: ${result.updatedCount} item`;
      if (result.missingFromExcelCount > 0) msg += `. ${result.missingFromExcelCount} item tidak ada dalam Excel`;
      showToast(msg, result.updatedCount > 0 ? 'success' : 'info');
      await refreshData();
    } catch (err: any) {
      showToast('Ralat Import Excel: ' + err.message, 'error');
    }
    setImporting(false);
    e.target.value = '';
  };

  const handleRefresh = async (e: CustomEvent) => {
    await refreshData();
    e.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Penyelarasan Data</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingText="Tarik untuk muat semula" refreshingText="Memuatkan..." />
        </IonRefresher>

        <div style={{ padding: '12px 16px' }}>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle style={{ fontSize: '16px' }}>Eksport Pangkalan Data</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                Muat turun semua data sebagai fail JSON sebagai sandaran.
              </p>
              <IonButton expand="block" onClick={handleExport}>
                <IonIcon icon={download} slot="start" />
                Eksport JSON
              </IonButton>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle style={{ fontSize: '16px' }}>Import Pangkalan Data</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                Import data dari fail JSON sandaran. Semua data sedia ada akan diganti.
              </p>
              <input type="file" ref={importInputRef} accept=".json" style={{ display: 'none' }} onChange={handleImportJson} />
              <IonButton expand="block" color="warning" onClick={() => importInputRef.current?.click()} disabled={importing}>
                <IonIcon icon={cloudUpload} slot="start" />
                Import JSON
              </IonButton>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle style={{ fontSize: '16px' }}>Import Excel (Stok)</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                Import data stok semasa dari fail Excel. Kolom: Drug / Non Drug Code, Drug / Non Drug Description, Quantity Available
              </p>
              <input type="file" ref={excelInputRef} accept=".xls,.xlsx" style={{ display: 'none' }} onChange={handleImportExcel} />
              <IonButton expand="block" fill="outline" onClick={() => excelInputRef.current?.click()} disabled={importing}>
                <IonIcon icon={docIcon} slot="start" />
                Pilih Fail Excel
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SyncPage;
