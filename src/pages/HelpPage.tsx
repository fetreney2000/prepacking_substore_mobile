import React from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge } from '@ionic/react';

const HelpPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar><IonTitle>Bantuan</IonTitle></IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: '12px 16px' }}>
          <IonCard>
            <IonCardContent>
              <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                <h3 style={{ marginBottom: '12px', color: '#1E3A8A' }}>Pengenalan</h3>
                <p style={{ marginBottom: '16px' }}>Sistem Inventori Farmasi adalah aplikasi pengurusan inventori untuk <strong>Substor Hospital Keningau</strong>. Sistem ini membantu pengurus farmasi menjejaki stok ubat prabungkus, mengira tahap inventori optimum, membuat pesanan pembelian, dan menjana laporan.</p>

                <h3 style={{ marginBottom: '12px', color: '#1E3A8A' }}>Papan Pemuka (Dashboard)</h3>
                <p style={{ marginBottom: '8px' }}>Paparan utama menunjukkan ringkasan inventori:</p>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li><strong>Jumlah SKU Aktif</strong> — Bilangan item aktif dalam sistem</li>
                  <li><strong>Kumpulan</strong> — Bilangan kumpulan item</li>
                  <li><strong>Jumlah Stok Semasa</strong> — Jumlah keseluruhan stok semua item</li>
                  <li><strong>Stok Rendah/Kehabisan</strong> — Bilangan item yang perlu dipesan</li>
                </ul>

                <h3 style={{ marginBottom: '12px', color: '#1E3A8A' }}>Pengurusan SKU</h3>
                <p style={{ marginBottom: '8px' }}>Halaman ini membolehkan anda mengurus item inventori:</p>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li><strong>Tambah SKU</strong> — Klik butang "+" untuk menambah item baharu</li>
                  <li><strong>Edit/Padam</strong> — Ketik pada item untuk menu pilihan</li>
                  <li><strong>Cari</strong> — Gunakan medan carian untuk mencari mengikut kod atau nama</li>
                  <li><strong>Tapis Kumpulan</strong> — Pilih kumpulan untuk menapis senarai</li>
                </ul>
                <p style={{ marginBottom: '16px' }}><strong>Medan Penting:</strong></p>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li><strong>Kod</strong> — Kod unik item</li>
                  <li><strong>Saiz Pek</strong> — Bilangan unit dalam satu pek</li>
                  <li><strong>Penggunaan Bulan 1/2/3</strong> — Jumlah penggunaan untuk 3 bulan terakhir</li>
                  <li><strong>Sentiasa Stok Penuh</strong> — Aktifkan untuk item yang sentiasa ditopup ke stok maksimum</li>
                  <li><strong>Guna Tahap Manual</strong> — Aktifkan untuk menetapkan tahap Min/Penimbal/Maks secara manual</li>
                </ul>

                <h3 style={{ marginBottom: '12px', color: '#1E3A8A' }}>Kumpulan</h3>
                <p style={{ marginBottom: '16px' }}>Kumpulan mengorganisasikan item mengikut kategori. Contoh: APPL (Tablet & Kapsul), CFLNS (Sirap), Bukan Ubat. Setiap SKU perlu dikaitkan dengan satu kumpulan.</p>

                <h3 style={{ marginBottom: '12px', color: '#1E3A8A' }}>Cipta Pesanan</h3>
                <p style={{ marginBottom: '8px' }}>Untuk membuat pesanan baharu:</p>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li><strong>Tarikh</strong> — Tarikh pesanan</li>
                  <li><strong>Nama Pembuat</strong> — Nama orang yang membuat pesanan</li>
                  <li><strong>Tempoh (Minggu)</strong> — Tempoh bekalan dalam minggu. Ubah nilai ini untuk melihat kuantiti pesanan dikira semula secara automatik.</li>
                  <li><strong>Nota</strong> — Nota tambahan untuk pesanan</li>
                </ul>
                <p style={{ marginBottom: '16px' }}>Item akan menunjukkan semua item aktif dengan kuantiti pesanan yang dikira secara automatik berdasarkan AWU × Tempoh − Stok Semasa.</p>

                <h3 style={{ marginBottom: '12px', color: '#1E3A8A' }}>Pengiraan Tahap Inventori</h3>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li><strong>AWU (Penggunaan Mingguan Purata)</strong> = (Bulan 1 + Bulan 2 + Bulan 3) ÷ 12</li>
                  <li><strong>Min</strong> = AWU × Minggu Minimum (dibulatkan ke atas mengikut saiz pek)</li>
                  <li><strong>Penimbal</strong> = AWU × Minggu Penimbal (dibulatkan ke atas mengikut saiz pek)</li>
                  <li><strong>Maks</strong> = AWU × Minggu Maksimum (dibulatkan ke atas mengikut saiz pek)</li>
                </ul>

                <h3 style={{ marginBottom: '12px', color: '#1E3A8A' }}>Status Stok</h3>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li><IonBadge color="success">OK</IonBadge> Stok melebihi tahap penimbal — stok mencukupi</li>
                  <li><IonBadge color="warning">Rendah</IonBadge> Stok antara min dan penimbal — perlu dipesan</li>
                  <li><IonBadge color="danger">Kritikal</IonBadge> Stok di bawah min — perlu dipesan segera</li>
                  <li><IonBadge color="medium">Kehabisan</IonBadge> Stok sifar</li>
                </ul>

                <h3 style={{ marginBottom: '12px', color: '#1E3A8A' }}>Penyelarasan (Sync)</h3>
                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                  <li><strong>Eksport</strong> — Muat turun fail JSON mengandungi semua data</li>
                  <li><strong>Import JSON</strong> — Muat naik fail JSON untuk menggantikan semua data sedia ada</li>
                  <li><strong>Import Excel</strong> — Muat naik fail Excel (.xlsx) untuk mengemas kini stok semasa</li>
                </ul>

                <h3 style={{ marginBottom: '12px', color: '#1E3A8A' }}>Ciri Mudah Alih</h3>
                <p style={{ marginBottom: '16px' }}>Aplikasi ini dioptimumkan untuk telefon pintar. Gunakan tab navigasi di bahagian bawah untuk menukar halaman. Tarik ke bawah untuk muat semula data. Ketik dan tahan pada item untuk menu pilihan.</p>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default HelpPage;
