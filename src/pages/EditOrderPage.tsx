import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonSearchbar, IonModal, IonInput, IonLabel, IonItem, IonSelect, IonSelectOption,
  IonAlert, IonRefresher, IonRefresherContent, useIonActionSheet } from '@ionic/react';
import { create, trash, close, checkmark, save, print, add } from 'ionicons/icons';
import { useAppContext } from '../App';
import { api } from '../utils/api';
import { calculateAWU, calculateOrderQty, calculateLevels, formatNum, escHtml } from '../utils/calculations';
import { Order, OrderItem } from '../utils/types';

const EditOrderPage: React.FC = () => {
  const { settings, skus, orders, refreshData, showToast } = useAppContext();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editItems, setEditItems] = useState<(OrderItem & { _isNew?: boolean })[]>([]);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [presentActionSheet] = useIonActionSheet();

  const [form, setForm] = useState({ tarikh: '', namaPembuat: '', tempohMinggu: 0, notes: '' });

  const filteredOrders = orders.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return o.tarikh.includes(q) || o.namaPembuat.toLowerCase().includes(q) || String(o.id).includes(q);
  });

  const openEdit = async (order: Order) => {
    try {
      const data = await api.getOrder(order.id) as Order;
      setEditOrder(data);
      setForm({
        tarikh: data.tarikh,
        namaPembuat: data.namaPembuat,
        tempohMinggu: data.tempohMinggu || 0,
        notes: data.notes || ''
      });
      setEditItems((data.items || []).map(it => ({ ...it })));
      setShowModal(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const updateEditItem = (idx: number, field: string, val: any) => {
    const copy = [...editItems];
    copy[idx] = { ...copy[idx], [field]: val };
    if (field === 'kod' && val) {
      const sku = skus.find(s => s.kod === val);
      if (sku) {
        copy[idx].skuId = sku.id;
        if (form.tempohMinggu > 0) {
          copy[idx].qtyOrdered = calculateOrderQty(sku, form.tempohMinggu, settings);
        }
      }
    }
    setEditItems(copy);
  };

  const removeEditItem = (idx: number) => {
    setEditItems(editItems.filter((_, i) => i !== idx));
  };

  const addEditItem = () => {
    setEditItems([{ kod: '', qtyOrdered: 0, notes: '', skuId: null, _isNew: true }, ...editItems]);
  };

  const handleUpdate = async () => {
    if (!editOrder) return;
    try {
      await api.updateOrder(editOrder.id, {
        tarikh: form.tarikh,
        namaPembuat: form.namaPembuat.trim(),
        tempohMinggu: form.tempohMinggu,
        notes: form.notes.trim(),
        items: editItems.filter(it => it.kod).map(it => ({
          kod: it.kod, skuId: it.skuId || null, qtyOrdered: it.qtyOrdered || 0, notes: it.notes || ''
        }))
      });
      showToast('Pesanan dikemaskini');
      setShowModal(false);
      await refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const confirmDeleteOrder = (id: number) => {
    setDeleteTarget(id);
    setShowDeleteAlert(true);
  };

  const handleDeleteOrder = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteOrder(deleteTarget);
      showToast('Pesanan dipadam');
      setShowModal(false);
      await refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
    setShowDeleteAlert(false);
    setDeleteTarget(null);
  };

  const buildPrintView = async (orderId: number) => {
    try {
      const [orderData, allSkus, allGroups] = await Promise.all([
        api.getOrder(orderId) as Promise<Order>,
        api.getSkus(),
        api.getGroups()
      ]);
      const items = orderData.items || [];
      const skuMap: any = {};
      allSkus.forEach((s: any) => { skuMap[s.id] = s; skuMap[(s.kod||'').toLowerCase()] = s; });
      const groupMap: any = {};
      allGroups.forEach((g: any) => { groupMap[g.id] = g.name; });

      const orderedSkuIds = new Set<number>();
      items.forEach((item: any) => {
        if (item.skuId) orderedSkuIds.add(item.skuId);
        else {
          const match = allSkus.find((s: any) => (s.kod||'').toLowerCase() === (item.kod||'').toLowerCase());
          if (match) orderedSkuIds.add(match.id);
        }
      });

      const grouped: any = {};
      items.forEach((item: any) => {
        const sku = skuMap[item.skuId] || skuMap[(item.kod||'').toLowerCase()];
        const groupName = (sku && groupMap[sku.groupId]) || '(Tiada Kumpulan)';
        if (!grouped[groupName]) grouped[groupName] = [];
        grouped[groupName].push({ ...item, sku });
      });

      let rowsHTML = '';
      Object.keys(grouped).sort().forEach(groupName => {
        rowsHTML += `<tr style="background:#1E3A8A;color:#fff"><td colspan="8"><strong>${escHtml(groupName)}</strong></td></tr>`;
        grouped[groupName].sort((a: any, b: any) => ((a.sku||{}).nama||'').localeCompare((b.sku||{}).nama||'')).forEach(({ sku, qtyOrdered, notes: itemNotes }: any) => {
          const lvl = sku ? calculateLevels(sku, { minWeeks: 2, bufferWeeks: 4, maxWeeks: 6, defaultFilename: '', appTitle: '' }) : null;
          rowsHTML += `<tr><td class="col-kod"><code>${escHtml((sku||{}).kod||'')}</code></td><td class="col-nama">${escHtml((sku||{}).nama||'')}</td><td class="col-stok">${(sku||{}).stokSemasa||0}</td><td class="col-maks">${lvl ? formatNum(lvl.maks) : '-'}</td><td class="col-awu">${lvl ? formatNum(lvl.awu) : '-'}</td><td class="col-kuantiti">${formatNum(qtyOrdered||0)}</td><td class="col-nota">${escHtml(itemNotes||'')}</td></tr>`;
        });
      });

      const notOrderedSkus = allSkus
        .filter((s: any) => s.enabled !== false && !orderedSkuIds.has(s.id))
        .sort((a: any, b: any) => (a.nama || '').localeCompare(b.nama || ''));

      let notOrderedHTML = '';
      if (notOrderedSkus.length > 0) {
        notOrderedHTML += `<div style="margin-top:24px"><h3 style="font-size:12pt;color:#1e40af;margin-bottom:8px">Item Tidak Dipesan (${notOrderedSkus.length})</h3>`;
        notOrderedHTML += `<table><thead><tr><th class="col-kod">Kod</th><th class="col-nama">Nama</th><th class="col-stok">Stok Semasa</th><th class="col-maks">Maks</th><th class="col-awu">AWU</th></tr></thead><tbody>`;
        notOrderedSkus.forEach((sku: any) => {
          const lvl = calculateLevels(sku, { minWeeks: 2, bufferWeeks: 4, maxWeeks: 6, defaultFilename: '', appTitle: '' });
          notOrderedHTML += `<tr><td class="col-kod"><code>${escHtml(sku.kod)}</code></td><td class="col-nama">${escHtml(sku.nama)}</td><td class="col-stok">${sku.stokSemasa||0}</td><td class="col-maks">${formatNum(lvl.maks)}</td><td class="col-awu">${formatNum(lvl.awu)}</td></tr>`;
        });
        notOrderedHTML += '</tbody></table></div>';
      }

      const printHTML = `<!DOCTYPE html><html lang="ms"><head><meta charset="UTF-8"><title>Pesanan #${orderId}</title><style>*{box-sizing:border-box}body{font-family:sans-serif;font-size:11pt;padding:16px}table{width:100%;border-collapse:collapse;font-size:10pt;margin-top:8px}th,td{border:1px solid #d1d5db;padding:6px 8px;text-align:left}thead tr{background:#dbeafe}th{font-weight:600;color:#1e40af}code{font-size:9pt}.print-actions{text-align:center;margin:16px 0}.print-actions button{padding:8px 20px;margin:0 6px;cursor:pointer;border:none;border-radius:4px;font-size:11pt}.btn-print{background:#2563eb;color:#fff}.btn-close{background:#6b7280;color:#fff}@media print{.print-actions{display:none}.column-toggles{display:none}}.column-toggles{padding:8px 0;margin-bottom:8px;border:1px solid #e5e7eb;border-radius:6px;background:#f9fafb;display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:10pt}.column-toggles label{display:flex;align-items:center;gap:4px;cursor:pointer;padding:2px 8px;border-radius:4px;background:#fff;border:1px solid #d1d5db}.column-toggles label:hover{background:#eff6ff}.hidden{display:none!important}</style></head><body>
      <div style="background:linear-gradient(135deg,#1E3A8A,#2563EB);color:#fff;text-align:center;padding:16px;border-radius:4px;margin-bottom:16px"><h2 style="margin:0;font-size:16pt;color:#fff">${escHtml(settings.appTitle)}</h2><h3 style="margin:4px 0;font-size:13pt;color:#93c5fd">Borang Permohonan Stok</h3></div>
      <div style="margin-bottom:8px;font-size:10pt;border:1px solid #c0d4e8;padding:8px;border-radius:4px;background:#f0f4ff"><strong>ID:</strong> ${orderData.id} | <strong>Tarikh:</strong> ${escHtml(orderData.tarikh)} | <strong>Pembuat:</strong> ${escHtml(orderData.namaPembuat)}</div>
      <div class="column-toggles"><strong>Tukar Kolom:</strong>
        <label><input type="checkbox" checked onchange="document.querySelectorAll('.col-kod').forEach(e=>e.classList.toggle('hidden',!this.checked))"> Kod</label>
        <label><input type="checkbox" checked onchange="document.querySelectorAll('.col-nama').forEach(e=>e.classList.toggle('hidden',!this.checked))"> Nama</label>
        <label><input type="checkbox" checked onchange="document.querySelectorAll('.col-stok').forEach(e=>e.classList.toggle('hidden',!this.checked))"> Stok Semasa</label>
        <label><input type="checkbox" checked onchange="document.querySelectorAll('.col-maks').forEach(e=>e.classList.toggle('hidden',!this.checked))"> Maks</label>
        <label><input type="checkbox" checked onchange="document.querySelectorAll('.col-awu').forEach(e=>e.classList.toggle('hidden',!this.checked))"> AWU</label>
        <label><input type="checkbox" checked onchange="document.querySelectorAll('.col-kuantiti').forEach(e=>e.classList.toggle('hidden',!this.checked))"> Kuantiti</label>
        <label><input type="checkbox" checked onchange="document.querySelectorAll('.col-nota').forEach(e=>e.classList.toggle('hidden',!this.checked))"> Nota</label>
      </div>
      <table><thead><tr><th class="col-kod">Kod</th><th class="col-nama">Nama</th><th class="col-stok">Stok Semasa</th><th class="col-maks">Maks</th><th class="col-awu">AWU</th><th class="col-kuantiti">Kuantiti</th><th class="col-nota">Nota</th></tr></thead><tbody>${rowsHTML}</tbody></table>
      ${notOrderedHTML}
      <div style="display:flex;gap:60px;margin-top:30px"><div style="flex:1"><p style="margin-bottom:60px"><strong>Disediakan oleh:</strong><br><small>(Pembuat Pesanan)</small></p></div><div style="flex:1"><p style="margin-bottom:60px"><strong>Disahkan oleh:</strong><br><small>(Tandatangan & Cop)</small></p></div></div>
      <div class="print-actions"><button class="btn-print" onclick="window.print()">Cetak</button><button class="btn-close" onclick="window.close()">Tutup</button></div>
      </body></html>`;
      const w = window.open('', '_blank');
      if (w) { w.document.write(printHTML); w.document.close(); }
      else showToast('Sila benarkan pop-up', 'error');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const showActions = (order: Order) => {
    presentActionSheet({
      header: `Pesanan #${order.id}`,
      buttons: [
        { text: 'Edit', icon: create, handler: () => openEdit(order) },
        { text: 'Cetak', icon: print, handler: () => buildPrintView(order.id) },
        { text: 'Padam', icon: trash, role: 'destructive', handler: () => confirmDeleteOrder(order.id) },
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
          <IonTitle>Senarai Pesanan</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingText="Tarik untuk muat semula" refreshingText="Memuatkan..." />
        </IonRefresher>

        <div className="filter-bar">
          <IonSearchbar value={search} onIonInput={e => setSearch(e.detail.value!)} placeholder="Cari pesanan..." debounce={200} />
        </div>

        {filteredOrders.length === 0 ? (
          <div className="empty-state"><p>Tiada pesanan</p></div>
        ) : (
          filteredOrders.map(o => (
            <div className="list-card-item" key={o.id} onClick={() => showActions(o)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="lci-title">Pesanan #{o.id}</div>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{o.tarikh}</span>
              </div>
              <div className="lci-sub">{o.namaPembuat} · {o.tempohMinggu || 0} minggu · {o.itemCount || 0} item</div>
              {o.notes && <div style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>{o.notes}</div>}
            </div>
          ))
        )}

        {/* Edit Order Modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Edit Pesanan #{editOrder?.id}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}><IonIcon icon={close} /></IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="form-section" style={{ paddingTop: '12px' }}>
              <IonItem>
                <IonLabel position="stacked">Tarikh</IonLabel>
                <IonInput type="date" value={form.tarikh} onIonInput={e => setForm({...form, tarikh: e.detail.value!})} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Nama Pembuat</IonLabel>
                <IonInput value={form.namaPembuat} onIonInput={e => setForm({...form, namaPembuat: e.detail.value!})} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Tempoh (Minggu)</IonLabel>
                <IonInput type="number" value={form.tempohMinggu} min={0} max={12}
                  onIonInput={e => setForm({...form, tempohMinggu: Number(e.detail.value)})} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Nota</IonLabel>
                <IonInput value={form.notes} onIonInput={e => setForm({...form, notes: e.detail.value!})} />
              </IonItem>
            </div>

            <div style={{ padding: '0 16px 8px', fontWeight: 700, fontSize: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Item Pesanan</span>
              <IonButton size="small" fill="outline" onClick={addEditItem}>
                <IonIcon icon={add} slot="start" />Tambah
              </IonButton>
            </div>

            {editItems.map((item, idx) => {
              const selectedSku = item.kod ? skus.find(s => s.kod === item.kod) : null;
              const levels = selectedSku ? calculateLevels(selectedSku, settings) : null;
              return (
              <div className="order-item-card" key={idx}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IonButton size="small" fill="clear" color="danger" onClick={() => removeEditItem(idx)}>
                    <IonIcon icon={close} />
                  </IonButton>
                </div>
                <IonSelect value={item.kod} onIonChange={e => updateEditItem(idx, 'kod', e.detail.value)} interface="action-sheet" placeholder="Pilih SKU">
                  {skus.map(s => <IonSelectOption key={s.id} value={s.kod}>{s.kod} - {s.nama}</IonSelectOption>)}
                </IonSelect>
                {selectedSku && (
                  <div style={{ padding: '4px 16px 8px', fontSize: '12px', color: '#6b7280', background: '#f9fafb', borderRadius: '6px', margin: '0 8px 8px' }}>
                    <div><strong>{selectedSku.nama}</strong></div>
                    <div>Stok Semasa: <strong>{formatNum(selectedSku.stokSemasa)}</strong> · AWU: <strong>{levels ? formatNum(levels.awu) : '-'}</strong></div>
                  </div>
                )}
                <IonItem>
                  <IonLabel position="stacked">Kuantiti</IonLabel>
                  <IonInput type="number" value={item.qtyOrdered} onIonInput={e => updateEditItem(idx, 'qtyOrdered', Number(e.detail.value))} />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Nota</IonLabel>
                  <IonInput value={item.notes} onIonInput={e => updateEditItem(idx, 'notes', e.detail.value!)} />
                </IonItem>
              </div>
              );
            })}

            <div style={{ padding: '16px' }}>
              <IonButton expand="block" onClick={handleUpdate}>
                <IonIcon icon={save} slot="start" />
                Simpan
              </IonButton>
              <IonButton expand="block" color="danger" fill="outline" onClick={() => editOrder && confirmDeleteOrder(editOrder.id)} style={{ marginTop: '8px' }}>
                <IonIcon icon={trash} slot="start" />
                Padam Pesanan
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Pengesahan"
          message="Adakah anda pasti mahu memadam pesanan ini?"
          buttons={[
            { text: 'Batal', role: 'cancel' },
            { text: 'Padam', role: 'destructive', handler: handleDeleteOrder }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default EditOrderPage;
