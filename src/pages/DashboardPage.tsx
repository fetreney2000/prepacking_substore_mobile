import React, { useMemo } from 'react';
import { IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge, IonIcon, IonRefresher, IonRefresherContent } from '@ionic/react';
import { cube, people, documentText, warning } from 'ionicons/icons';
import { useAppContext } from '../App';
import { determineStockStatus, statusLabel, statusColor, calculateLevels, formatNum } from '../utils/calculations';

const DashboardPage: React.FC = () => {
  const { settings, groups, skus, refreshData } = useAppContext();

  const enabledSkus = useMemo(() => skus.filter(s => s.enabled), [skus]);

  const lowStock = useMemo(() => enabledSkus.filter(s => {
    const st = determineStockStatus(s, settings);
    return st === 'low' || st === 'critical' || st === 'out';
  }), [enabledSkus, settings]);

  const totalStock = useMemo(() => enabledSkus.reduce((sum, s) => sum + (s.stokSemasa || 0), 0), [enabledSkus]);

  const handleRefresh = async (e: CustomEvent) => {
    await refreshData();
    e.detail.complete();
  };

  return (
    <IonPage>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingText="Tarik untuk muat semula" refreshingText="Memuatkan..." />
        </IonRefresher>

        <div className="page-header">
          <h2>Papan Pemuka</h2>
        </div>

        <div className="stat-grid">
          <div className="summary-card">
            <div className="icon-wrap icon-blue"><IonIcon icon={cube} /></div>
            <div className="info"><h3>{enabledSkus.length}</h3><p>SKU Aktif</p></div>
          </div>
          <div className="summary-card">
            <div className="icon-wrap icon-green"><IonIcon icon={people} /></div>
            <div className="info"><h3>{groups.length}</h3><p>Kumpulan</p></div>
          </div>
          <div className="summary-card">
            <div className="icon-wrap icon-cyan"><IonIcon icon={documentText} /></div>
            <div className="info"><h3>{formatNum(totalStock)}</h3><p>Jumlah Stok</p></div>
          </div>
          <div className="summary-card">
            <div className="icon-wrap icon-red"><IonIcon icon={warning} /></div>
            <div className="info"><h3>{lowStock.length}</h3><p>Stok Rendah</p></div>
          </div>
        </div>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle style={{ fontSize: '16px' }}>Stok Rendah / Kehabisan</IonCardTitle>
          </IonCardHeader>
          <IonCardContent style={{ padding: 0 }}>
            {lowStock.length === 0 ? (
              <div className="empty-state">
                <IonIcon icon={warning} />
                <p>Semua stok mencukupi</p>
              </div>
            ) : (
              lowStock.map(sku => {
                const grp = groups.find(g => g.id === sku.groupId);
                const levels = calculateLevels(sku, settings);
                const status = determineStockStatus(sku, settings);
                return (
                  <div className="item-row" key={sku.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="item-title">{sku.nama}</span>
                      <IonBadge color={statusColor(status)}>{statusLabel(status)}</IonBadge>
                    </div>
                    <span className="item-subtitle" style={{ fontFamily: 'monospace', fontSize: '11px' }}>{sku.kod}</span>
                    <div className="item-meta">
                      <span>{grp ? grp.name : '-'}</span>
                      <span>Stok: <strong>{formatNum(sku.stokSemasa)}</strong></span>
                      <span>Min: {formatNum(levels.min)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default DashboardPage;
