import React, { useState, useMemo } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon,
  IonLabel, IonItem, IonSelect, IonSelectOption, IonInput, IonRefresher, IonRefresherContent } from '@ionic/react';
import { search } from 'ionicons/icons';
import { useAppContext } from '../App';
import { api } from '../utils/api';
import { formatNum } from '../utils/calculations';
import { Order } from '../utils/types';

const OrderReportPage: React.FC = () => {
  const { settings, skus, groups, refreshData, showToast } = useAppContext();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pembuatFilter, setPembuatFilter] = useState('');
  const [skuFilter, setSkuFilter] = useState('');
  const [reportData, setReportData] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);

  const generateReport = async () => {
    setGenerating(true);
    try {
      let orders: Order[] = await api.getOrders();
      if (dateFrom) orders = orders.filter(o => (o.tarikh || '').substring(0, 10) >= dateFrom);
      if (dateTo) orders = orders.filter(o => (o.tarikh || '').substring(0, 10) <= dateTo);
      if (pembuatFilter) orders = orders.filter(o => (o.namaPembuat || '').toLowerCase().includes(pembuatFilter.toLowerCase()));

      let allItems: any[] = [];
      for (const order of orders) {
        const data = await api.getOrder(order.id) as Order;
        (data.items || []).forEach(item => {
          allItems.push({ ...item, _order: order });
        });
      }

      if (skuFilter) {
        const filterSku = skus.find(s => String(s.id) === String(skuFilter));
        if (filterSku) {
          allItems = allItems.filter(item => {
            if (item.skuId != null) return String(item.skuId) === String(filterSku.id);
            return (item.kod || '').toLowerCase() === (filterSku.kod || '').toLowerCase();
          });
        }
      }

      setReportData(allItems);
      if (allItems.length === 0) showToast('Tiada rekod dijumpai', 'info');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
    setGenerating(false);
  };

  const handleRefresh = async (e: CustomEvent) => {
    await refreshData();
    e.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Laporan Pesanan</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingText="Tarik untuk muat semula" refreshingText="Memuatkan..." />
        </IonRefresher>

        <div className="form-section" style={{ paddingTop: '12px' }}>
          <IonItem>
            <IonLabel position="stacked">Dari</IonLabel>
            <IonInput type="date" value={dateFrom} onIonInput={e => setDateFrom(e.detail.value!)} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Hingga</IonLabel>
            <IonInput type="date" value={dateTo} onIonInput={e => setDateTo(e.detail.value!)} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Nama Pembuat</IonLabel>
            <IonInput value={pembuatFilter} onIonInput={e => setPembuatFilter(e.detail.value!)} placeholder="Nama pembuat..." />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Item</IonLabel>
            <IonSelect value={skuFilter} onIonChange={e => setSkuFilter(e.detail.value)} interface="action-sheet" placeholder="-- Semua SKU --">
              <IonSelectOption value="">-- Semua SKU --</IonSelectOption>
              {skus.filter(s => s.enabled !== false).sort((a, b) => (a.nama || '').localeCompare(b.nama || '')).map(s => (
                <IonSelectOption key={s.id} value={String(s.id)}>{s.kod} - {s.nama}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <div style={{ padding: '12px 0' }}>
            <IonButton expand="block" onClick={generateReport} disabled={generating}>
              <IonIcon icon={search} slot="start" />
              Jana Laporan
            </IonButton>
          </div>
        </div>

        {reportData.length > 0 && (
          <>
            <div style={{ padding: '0 16px 8px', fontSize: '13px', color: '#6b7280' }}>
              Jumlah rekod: {reportData.length}
            </div>
            {reportData.map((item, idx) => {
              const sku = skus.find(s => s.id === item.skuId) || skus.find(s => s.kod === item.kod);
              const grp = sku ? groups.find(g => g.id === sku.groupId) : null;
              const order = item._order;
              return (
                <div className="list-card-item" key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="lci-title">{sku ? sku.nama : item.kod}</div>
                      <div className="lci-sub" style={{ fontFamily: 'monospace' }}>{item.kod}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '16px', color: '#1f2937' }}>{formatNum(item.qtyOrdered)}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>Kuantiti</div>
                    </div>
                  </div>
                  <div className="item-meta" style={{ marginTop: '6px' }}>
                    <span>{order?.tarikh}</span>
                    <span>{order?.namaPembuat}</span>
                    {grp && <span>{grp.name}</span>}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {reportData.length === 0 && !generating && (
          <div className="empty-state">
            <IonIcon icon={search} style={{ fontSize: '48px', opacity: 0.3 }} />
            <p>Sila pilih penapis dan jana laporan</p>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default OrderReportPage;
