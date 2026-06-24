import React, { useState, useMemo, useEffect } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonIcon,
  IonInput, IonLabel, IonItem, IonRefresher, IonRefresherContent } from '@ionic/react';
import { save } from 'ionicons/icons';
import { useAppContext } from '../App';
import { api } from '../utils/api';
import { calculateAWU, calculateOrderQty, roundToPackSize, formatNum } from '../utils/calculations';

interface OrderItemDraft {
  kod: string;
  nama: string;
  qtyOrdered: number;
  notes: string;
}

const CreateOrderPage: React.FC = () => {
  const { settings, skus, refreshData, showToast } = useAppContext();
  const [tarikh, setTarikh] = useState(new Date().toISOString().slice(0, 10));
  const [namaPembuat, setNamaPembuat] = useState('Ahmad Fetre');
  const [tempohMinggu, setTempohMinggu] = useState(0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItemDraft[]>([]);
  const [saving, setSaving] = useState(false);

  const enabledSkus = useMemo(() => skus.filter(s => s.enabled), [skus]);

  useEffect(() => {
    const newItems = enabledSkus.map(sku => {
      const qty = tempohMinggu > 0 ? calculateOrderQty(sku, tempohMinggu, settings) : 0;
      const existing = items.find(i => i.kod === sku.kod);
      return {
        kod: sku.kod,
        nama: sku.nama,
        qtyOrdered: tempohMinggu > 0 ? qty : (existing ? existing.qtyOrdered : 0),
        notes: existing ? existing.notes : ''
      };
    });
    setItems(newItems);
  }, [tempohMinggu, enabledSkus.length]);

  const updateQty = (idx: number, val: number) => {
    const copy = [...items];
    copy[idx] = { ...copy[idx], qtyOrdered: val };
    setItems(copy);
  };

  const updateNote = (idx: number, val: string) => {
    const copy = [...items];
    copy[idx] = { ...copy[idx], notes: val };
    setItems(copy);
  };

  const handleSave = async () => {
    if (!tarikh) return showToast('Tarikh diperlukan', 'error');
    if (!namaPembuat.trim()) return showToast('Nama pembuat diperlukan', 'error');
    const orderItems = items.filter(it => it.qtyOrdered > 0).map(it => ({
      kod: it.kod, qtyOrdered: it.qtyOrdered, notes: it.notes
    }));
    setSaving(true);
    try {
      await api.createOrder({ tarikh, namaPembuat: namaPembuat.trim(), tempohMinggu, notes: notes.trim(), items: orderItems });
      showToast('Pesanan dicipta');
      setTarikh(new Date().toISOString().slice(0, 10));
      setNotes('');
      setTempohMinggu(0);
      await refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
    setSaving(false);
  };

  const handleRefresh = async (e: CustomEvent) => {
    await refreshData();
    e.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Cipta Pesanan</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave} disabled={saving}>
              <IonIcon slot="icon-only" icon={save} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingText="Tarik untuk muat semula" refreshingText="Memuatkan..." />
        </IonRefresher>

        <div className="form-section" style={{ paddingTop: '12px' }}>
          <IonItem>
            <IonLabel position="stacked">Tarikh</IonLabel>
            <IonInput type="date" value={tarikh} onIonInput={e => setTarikh(e.detail.value!)} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Nama Pembuat</IonLabel>
            <IonInput value={namaPembuat} onIonInput={e => setNamaPembuat(e.detail.value!)} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Tempoh (Minggu)</IonLabel>
            <IonInput type="number" value={tempohMinggu} min={0} max={12}
              onIonInput={e => setTempohMinggu(Number(e.detail.value))} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Nota</IonLabel>
            <IonInput value={notes} onIonInput={e => setNotes(e.detail.value!)} placeholder="Pilihan" />
          </IonItem>
        </div>

        <div style={{ padding: '0 16px 8px', fontWeight: 700, fontSize: '15px', color: '#1f2937' }}>
          Item Pesanan ({items.filter(i => i.qtyOrdered > 0).length} item)
        </div>

        {items.length === 0 ? (
          <div className="empty-state"><p>Tiada SKU aktif.</p></div>
        ) : (
          items.map((item, idx) => {
            const sku = skus.find(s => s.kod === item.kod);
            const awu = sku ? Math.round(calculateAWU(sku)) : 0;
            const stok = sku ? (sku.stokSemasa || 0) : 0;
            return (
              <div className="order-item-card" key={item.kod}>
                <div className="oic-header">
                  <span className="oic-name">{item.nama}</span>
                  <span className="oic-code">{item.kod}</span>
                </div>
                <div className="oic-stats">
                  <span>AWU: <strong>{awu}</strong></span>
                  <span>Stok: <strong>{stok}</strong></span>
                </div>
                <div className="oic-qty">
                  <IonLabel style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>Kuantiti:</IonLabel>
                  <IonInput type="number" value={item.qtyOrdered} min={0}
                    onIonInput={e => updateQty(idx, Number(e.detail.value))} />
                  <IonInput value={item.notes} placeholder="Nota" style={{ flex: 1 }}
                    onIonInput={e => updateNote(idx, e.detail.value!)} />
                </div>
              </div>
            );
          })
        )}

        <div style={{ padding: '16px' }}>
          <IonButton expand="block" onClick={handleSave} disabled={saving}>
            <IonIcon icon={save} slot="start" />
            Simpan Pesanan
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CreateOrderPage;
