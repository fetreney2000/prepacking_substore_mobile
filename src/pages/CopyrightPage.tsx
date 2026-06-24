import React from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardContent } from '@ionic/react';

const CopyrightPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar><IonTitle>Hak Cipta</IonTitle></IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: '12px 16px' }}>
          <IonCard>
            <IonCardContent>
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <p style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Sistem Inventori Prabungkus Hospital Keningau</p>
                <p style={{ color: '#6b7280', marginBottom: '24px' }}>Versi 2.0</p>

                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', marginBottom: '4px' }}>Ahmad Fetre Bin Mohammad Zime</p>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>Pembangun Aplikasi</p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '13px', color: '#4b5563' }}>016-881 3920</p>
                  <p style={{ fontSize: '13px', color: '#4b5563' }}>fetreney2000@gmail.com</p>
                </div>

                <p style={{ fontSize: '13px', color: '#9ca3af' }}>© 2026 Hospital Keningau, Sabah, Malaysia.</p>
                <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>Hak cipta terpelihara.</p>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CopyrightPage;
