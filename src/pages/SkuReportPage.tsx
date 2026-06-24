import React, { useState, useMemo } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon,
  IonSelect, IonSelectOption, IonLabel, IonItem, IonBadge, IonRefresher, IonRefresherContent } from '@ionic/react';
import { search, print } from 'ionicons/icons';
import { useAppContext } from '../App';
import { determineStockStatus, statusLabel, statusColor, calculateLevels, formatNum, escHtml } from '../utils/calculations';
import { StockStatus } from '../utils/types';

const SkuReportPage: React.FC = () => {
  const { settings, groups, skus, refreshData, showToast } = useAppContext();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [reportData, setReportData] = useState<any[]>([]);
  const [generated, setGenerated] = useState(false);

  const generateReport = () => {
    const enabledSkus = skus.filter(s => s.enabled !== false);
    const data = enabledSkus.map(sku => {
      const levels = calculateLevels(sku, settings);
      const status = determineStockStatus(sku, settings);
      const awu = levels.awu;
      const weeksStock = awu > 0 ? ((sku.stokSemasa || 0) / awu).toFixed(1) : '-';
      return { ...sku, levels, status, awu, weeksStock };
    }).filter(s => !statusFilter || s.status === statusFilter);

    setReportData(data);
    setGenerated(true);
    if (data.length === 0) showToast('Tiada rekod dijumpai', 'info');
  };

  const printReport = () => {
    if (reportData.length === 0) {
      showToast('Sila jana laporan dahulu', 'error');
      return;
    }

    const grouped: any = {};
    reportData.forEach(sku => {
      const grp = groups.find(g => g.id === sku.groupId);
      const groupName = grp ? grp.name : '(Tiada Kumpulan)';
      if (!grouped[groupName]) grouped[groupName] = [];
      grouped[groupName].push(sku);
    });

    let rowsHTML = '';
    Object.keys(grouped).sort().forEach(groupName => {
      rowsHTML += `<tr style="background:#1E3A8A;color:#fff"><td colspan="8"><strong>${escHtml(groupName)}</strong></td></tr>`;
      grouped[groupName].sort((a: any, b: any) => (a.nama || '').localeCompare(b.nama || '')).forEach((sku: any) => {
        const statusMap: Record<string, string> = { ok: 'OK', low: 'Rendah', critical: 'Kritikal', out: 'Habis' };
        rowsHTML += `<tr><td><code>${escHtml(sku.kod)}</code></td><td>${escHtml(sku.nama)}</td><td>${formatNum(sku.stokSemasa)}</td><td>${formatNum(sku.awu)}</td><td>${sku.weeksStock}</td><td>${formatNum(sku.levels.min)}</td><td>${formatNum(sku.levels.maks)}</td><td>${statusMap[sku.status] || sku.status}</td></tr>`;
      });
    });

    const printHTML = `<!DOCTYPE html><html lang="ms"><head><meta charset="UTF-8"><title>Laporan SKU</title><style>*{box-sizing:border-box}body{font-family:sans-serif;font-size:11pt;padding:16px}table{width:100%;border-collapse:collapse;font-size:10pt;margin-top:8px}th,td{border:1px solid #d1d5db;padding:6px 8px;text-align:left}thead tr{background:#dbeafe}th{font-weight:600;color:#1e40af}code{font-size:9pt}.print-actions{text-align:center;margin:16px 0}.print-actions button{padding:8px 20px;margin:0 6px;cursor:pointer;border:none;border-radius:4px;font-size:11pt}.btn-print{background:#2563eb;color:#fff}.btn-close{background:#6b7280;color:#fff}@media print{.print-actions{display:none}}</style></head><body>
      <div style="background:linear-gradient(135deg,#1E3A8A,#2563EB);color:#fff;text-align:center;padding:16px;border-radius:4px;margin-bottom:16px"><h2 style="margin:0;font-size:16pt;color:#fff">${escHtml(settings.appTitle)}</h2><h3 style="margin:4px 0;font-size:13pt;color:#93c5fd">Laporan SKU</h3></div>
      <table><thead><tr><th>Kod</th><th>Nama</th><th>Stok</th><th>AWU</th><th>Minggu</th><th>Min</th><th>Maks</th><th>Status</th></tr></thead><tbody>${rowsHTML}</tbody></table>
      <div class="print-actions"><button class="btn-print" onclick="window.print()">Cetak</button><button class="btn-close" onclick="window.close()">Tutup</button></div>
      </body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(printHTML); w.document.close(); }
    else showToast('Sila benarkan pop-up', 'error');
  };

  const handleRefresh = async (e: CustomEvent) => {
    await refreshData();
    e.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Laporan SKU</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingText="Tarik untuk muat semula" refreshingText="Memuatkan..." />
        </IonRefresher>

        <div className="form-section" style={{ paddingTop: '12px' }}>
          <IonItem>
            <IonLabel position="stacked">Status</IonLabel>
            <IonSelect value={statusFilter} onIonChange={e => setStatusFilter(e.detail.value)} interface="action-sheet" placeholder="-- Semua --">
              <IonSelectOption value="">-- Semua --</IonSelectOption>
              <IonSelectOption value="critical">Tiada Stok / Kritikal</IonSelectOption>
              <IonSelectOption value="low">Amaran / Hampir Habis</IonSelectOption>
              <IonSelectOption value="ok">Baik / Stok Mencukupi</IonSelectOption>
              <IonSelectOption value="out">Kehabisan</IonSelectOption>
            </IonSelect>
          </IonItem>
          <div style={{ display: 'flex', gap: '8px', padding: '12px 0' }}>
            <IonButton expand="block" style={{ flex: 1 }} onClick={generateReport}>
              <IonIcon icon={search} slot="start" />Jana Laporan
            </IonButton>
            <IonButton expand="block" fill="outline" style={{ flex: 1 }} onClick={printReport}>
              <IonIcon icon={print} slot="start" />Cetak
            </IonButton>
          </div>
        </div>

        {generated && reportData.length > 0 && (
          <>
            <div style={{ padding: '0 16px 8px', fontSize: '13px', color: '#6b7280' }}>
              Jumlah rekod: {reportData.length}
            </div>
            {(() => {
              const grouped: Record<string, any[]> = {};
              reportData.forEach(sku => {
                const grp = groups.find(g => g.id === sku.groupId);
                const groupName = grp ? grp.name : '(Tiada Kumpulan)';
                if (!grouped[groupName]) grouped[groupName] = [];
                grouped[groupName].push(sku);
              });
              return Object.keys(grouped).sort().map(groupName => (
                <React.Fragment key={groupName}>
                  <div className="group-header-row">{groupName}</div>
                  {grouped[groupName].sort((a, b) => (a.nama || '').localeCompare(b.nama || '')).map(sku => (
                    <div className="item-row" key={sku.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="item-title">{sku.nama}</span>
                        <IonBadge color={statusColor(sku.status)}>{statusLabel(sku.status)}</IonBadge>
                      </div>
                      <span className="item-subtitle" style={{ fontFamily: 'monospace', fontSize: '11px' }}>{sku.kod}</span>
                      <div className="item-meta">
                        <span>Stok: <strong>{formatNum(sku.stokSemasa)}</strong></span>
                        <span>AWU: {formatNum(sku.awu)}</span>
                        <span>Minggu: {sku.weeksStock}</span>
                        <span>Min: {formatNum(sku.levels.min)}</span>
                        <span>Maks: {formatNum(sku.levels.maks)}</span>
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ));
            })()}
          </>
        )}

        {generated && reportData.length === 0 && (
          <div className="empty-state"><p>Tiada rekod dijumpai.</p></div>
        )}

        {!generated && (
          <div className="empty-state">
            <IonIcon icon={search} style={{ fontSize: '48px', opacity: 0.3 }} />
            <p>Sila pilih penapis dan jana laporan</p>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default SkuReportPage;
