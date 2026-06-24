import React, { useState, useMemo, useCallback } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonSearchbar, IonSelect, IonSelectOption, IonCheckbox, IonModal, IonInput, IonLabel,
  IonItem, IonList, IonRefresher, IonRefresherContent, IonBadge, IonAlert, useIonActionSheet } from '@ionic/react';
import { add, create, trash, close, checkmark, options, cube } from 'ionicons/icons';
import { useAppContext } from '../App';
import { api } from '../utils/api';
import { determineStockStatus, statusLabel, statusColor, calculateLevels, formatNum } from '../utils/calculations';
import { SKU } from '../utils/types';

const SkusPage: React.FC = () => {
  const { settings, groups, skus, refreshData, showToast } = useAppContext();
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('');
  const [enabledOnly, setEnabledOnly] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [presentActionSheet] = useIonActionSheet();

  const [form, setForm] = useState({
    kod: '', nama: '', saizPek: 100, groupId: '' as string | number,
    stokSemasa: 0, notes: '', usageMonth1: 0, usageMonth2: 0, usageMonth3: 0,
    enabled: true, fullStockAlways: false, useManualLevels: false,
    minManual: 0, penimbalManual: 0, maksManual: 0
  });

  const filtered = useMemo(() => {
    return skus.filter(s => {
      if (enabledOnly && !s.enabled) return false;
      if (groupFilter && s.groupId !== parseInt(groupFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!s.kod.toLowerCase().includes(q) && !s.nama.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [skus, search, groupFilter, enabledOnly]);

  const openAdd = () => {
    setEditId(null);
    setForm({ kod: '', nama: '', saizPek: 100, groupId: '', stokSemasa: 0, notes: '',
      usageMonth1: 0, usageMonth2: 0, usageMonth3: 0, enabled: true, fullStockAlways: false,
      useManualLevels: false, minManual: 0, penimbalManual: 0, maksManual: 0 });
    setShowModal(true);
  };

  const openEdit = (sku: SKU) => {
    setEditId(sku.id);
    setForm({
      kod: sku.kod, nama: sku.nama, saizPek: sku.saizPek, groupId: sku.groupId || '',
      stokSemasa: sku.stokSemasa, notes: sku.notes || '',
      usageMonth1: sku.usageMonth1, usageMonth2: sku.usageMonth2, usageMonth3: sku.usageMonth3,
      enabled: sku.enabled, fullStockAlways: sku.fullStockAlways, useManualLevels: sku.useManualLevels,
      minManual: sku.minManual, penimbalManual: sku.penimbalManual, maksManual: sku.maksManual
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.kod.trim() || !form.nama.trim()) {
      showToast('Kod dan nama diperlukan', 'error');
      return;
    }
    const body = {
      ...form,
      groupId: form.groupId ? Number(form.groupId) : null,
      saizPek: Number(form.saizPek) || 1,
      stokSemasa: Number(form.stokSemasa) || 0,
      usageMonth1: Number(form.usageMonth1) || 0,
      usageMonth2: Number(form.usageMonth2) || 0,
      usageMonth3: Number(form.usageMonth3) || 0,
      minManual: Number(form.minManual) || 0,
      penimbalManual: Number(form.penimbalManual) || 0,
      maksManual: Number(form.maksManual) || 0
    };
    try {
      if (editId) {
        await api.updateSku(editId, body);
        showToast('SKU dikemaskini');
      } else {
        await api.createSku(body);
        showToast('SKU ditambah');
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
      await api.deleteSku(deleteTarget);
      showToast('SKU dipadam');
      await refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
    setShowDeleteAlert(false);
    setDeleteTarget(null);
  };

  const showActions = (sku: SKU) => {
    presentActionSheet({
      header: sku.nama,
      buttons: [
        { text: 'Edit', icon: create, handler: () => openEdit(sku) },
        { text: 'Padam', icon: trash, role: 'destructive', handler: () => confirmDelete(sku.id) },
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
          <IonTitle>Pengurusan SKU</IonTitle>
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

        <div className="filter-bar">
          <IonSearchbar value={search} onIonInput={e => setSearch(e.detail.value!)} placeholder="Cari kod atau nama..." debounce={200} />
          <IonSelect value={groupFilter} onIonChange={e => setGroupFilter(e.detail.value)} placeholder="Semua Kumpulan" interface="action-sheet">
            <IonSelectOption value="">Semua Kumpulan</IonSelectOption>
            {groups.map(g => <IonSelectOption key={g.id} value={String(g.id)}>{g.name}</IonSelectOption>)}
          </IonSelect>
          <IonItem lines="none" style={{ '--padding-start': '0', fontSize: '14px' }}>
            <IonLabel>Aktif sahaja</IonLabel>
            <IonCheckbox slot="end" checked={enabledOnly} onIonChange={e => setEnabledOnly(e.detail.checked)} />
          </IonItem>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <IonIcon icon={cube} style={{ fontSize: '48px', opacity: 0.3 }} />
            <p>Tiada SKU dijumpai</p>
          </div>
        ) : (
          filtered.map(sku => {
            const grp = groups.find(g => g.id === sku.groupId);
            const levels = calculateLevels(sku, settings);
            const status = determineStockStatus(sku, settings);
            return (
              <div className="list-card-item" key={sku.id} onClick={() => showActions(sku)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="lci-title">{sku.nama}</div>
                    <div className="lci-sub" style={{ fontFamily: 'monospace' }}>{sku.kod}</div>
                  </div>
                  <IonBadge color={statusColor(status)}>{statusLabel(status)}</IonBadge>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '8px', fontSize: '12px' }}>
                  <div><span style={{ color: '#6b7280' }}>Stok</span><br /><strong>{formatNum(sku.stokSemasa)}</strong></div>
                  <div><span style={{ color: '#6b7280' }}>AWU</span><br /><strong>{formatNum(levels.awu)}</strong></div>
                  <div><span style={{ color: '#6b7280' }}>Maks</span><br /><strong>{formatNum(levels.maks)}</strong></div>
                </div>
                <div style={{ marginTop: '6px', fontSize: '11px', color: '#9ca3af' }}>
                  {grp ? grp.name : '-'} · Pek: {sku.saizPek}
                </div>
              </div>
            );
          })
        )}

        {/* SKU Modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{editId ? 'Edit SKU' : 'Tambah SKU'}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}><IonIcon icon={close} /></IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="form-section" style={{ paddingTop: '16px' }}>
              <IonItem>
                <IonLabel position="stacked">Kod</IonLabel>
                <IonInput value={form.kod} onIonInput={e => setForm({...form, kod: e.detail.value!})} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Nama</IonLabel>
                <IonInput value={form.nama} onIonInput={e => setForm({...form, nama: e.detail.value!})} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Saiz Pek</IonLabel>
                <IonInput type="number" value={form.saizPek} onIonInput={e => setForm({...form, saizPek: Number(e.detail.value)})} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Kumpulan</IonLabel>
                <IonSelect value={form.groupId} onIonChange={e => setForm({...form, groupId: e.detail.value})} interface="action-sheet">
                  <IonSelectOption value="">Pilih Kumpulan</IonSelectOption>
                  {groups.map(g => <IonSelectOption key={g.id} value={String(g.id)}>{g.name}</IonSelectOption>)}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Stok Semasa</IonLabel>
                <IonInput type="number" value={form.stokSemasa} onIonInput={e => setForm({...form, stokSemasa: Number(e.detail.value)})} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Nota</IonLabel>
                <IonInput value={form.notes} onIonInput={e => setForm({...form, notes: e.detail.value!})} placeholder="Pilihan" />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Penggunaan Bulan 1</IonLabel>
                <IonInput type="number" value={form.usageMonth1} onIonInput={e => setForm({...form, usageMonth1: Number(e.detail.value)})} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Penggunaan Bulan 2</IonLabel>
                <IonInput type="number" value={form.usageMonth2} onIonInput={e => setForm({...form, usageMonth2: Number(e.detail.value)})} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Penggunaan Bulan 3</IonLabel>
                <IonInput type="number" value={form.usageMonth3} onIonInput={e => setForm({...form, usageMonth3: Number(e.detail.value)})} />
              </IonItem>

              <div className="toggle-row">
                <IonLabel>Aktif</IonLabel>
                <IonCheckbox checked={form.enabled} onIonChange={e => setForm({...form, enabled: e.detail.checked})} />
              </div>
              <div className="toggle-row">
                <IonLabel>Sentiasa Stok Penuh</IonLabel>
                <IonCheckbox checked={form.fullStockAlways} onIonChange={e => setForm({...form, fullStockAlways: e.detail.checked})} />
              </div>
              <div className="toggle-row">
                <IonLabel>Guna Tahap Manual</IonLabel>
                <IonCheckbox checked={form.useManualLevels} onIonChange={e => setForm({...form, useManualLevels: e.detail.checked})} />
              </div>

              {form.useManualLevels && (
                <>
                  <IonItem>
                    <IonLabel position="stacked">Min Manual</IonLabel>
                    <IonInput type="number" value={form.minManual} onIonInput={e => setForm({...form, minManual: Number(e.detail.value)})} />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Penimbal Manual</IonLabel>
                    <IonInput type="number" value={form.penimbalManual} onIonInput={e => setForm({...form, penimbalManual: Number(e.detail.value)})} />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Maks Manual</IonLabel>
                    <IonInput type="number" value={form.maksManual} onIonInput={e => setForm({...form, maksManual: Number(e.detail.value)})} />
                  </IonItem>
                </>
              )}

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
          message="Adakah anda pasti mahu memadam SKU ini?"
          buttons={[
            { text: 'Batal', role: 'cancel' },
            { text: 'Padam', role: 'destructive', handler: handleDelete }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default SkusPage;
