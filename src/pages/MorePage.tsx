import React from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonIcon, IonLabel } from '@ionic/react';
import { people, create, documentText, barChart, settings, sync, helpCircle, informationCircle } from 'ionicons/icons';
import { useHistory } from 'react-router';

const MorePage: React.FC = () => {
  const history = useHistory();

  const menuItems = [
    { label: 'Pengurusan Kumpulan', icon: people, path: '/groups' },
    { label: 'Senarai Pesanan', icon: create, path: '/edit-order' },
    { label: 'Laporan Pesanan', icon: documentText, path: '/reports' },
    { label: 'Laporan SKU', icon: barChart, path: '/sku-report' },
    { label: 'Tetapan', icon: settings, path: '/settings' },
    { label: 'Penyelarasan Data', icon: sync, path: '/sync' },
    { label: 'Bantuan', icon: helpCircle, path: '/help' },
    { label: 'Hak Cipta', icon: informationCircle, path: '/copyright' },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar><IonTitle>Menu</IonTitle></IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList lines="full">
          {menuItems.map(item => (
            <IonItem key={item.path} button onClick={() => history.push(item.path)} detail>
              <IonIcon icon={item.icon} slot="start" color="primary" />
              <IonLabel>{item.label}</IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default MorePage;
