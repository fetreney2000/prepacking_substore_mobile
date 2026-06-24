import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { IonApp, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, 
  IonLoading, IonAlert, useIonToast } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router';
import { home, cube, people, addCircle, documentText, settings, menu } from 'ionicons/icons';
import { api } from './utils/api';
import { AppSettings, Group, SKU, Order } from './utils/types';
import DashboardPage from './pages/DashboardPage';
import SkusPage from './pages/SkusPage';
import GroupsPage from './pages/GroupsPage';
import CreateOrderPage from './pages/CreateOrderPage';
import EditOrderPage from './pages/EditOrderPage';
import OrderReportPage from './pages/OrderReportPage';
import SkuReportPage from './pages/SkuReportPage';
import SettingsPage from './pages/SettingsPage';
import SyncPage from './pages/SyncPage';
import HelpPage from './pages/HelpPage';
import CopyrightPage from './pages/CopyrightPage';
import MorePage from './pages/MorePage';

interface AppContextType {
  settings: AppSettings;
  groups: Group[];
  skus: SKU[];
  orders: Order[];
  loading: boolean;
  refreshData: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const defaultSettings: AppSettings = {
  minWeeks: 2,
  bufferWeeks: 4,
  maxWeeks: 6,
  defaultFilename: 'substor_bulk_prabungkus',
  appTitle: 'Sistem Inventori Prabungkus Hospital Keningau',
  layoutMode: 'table'
};

export const AppContext = createContext<AppContextType>({
  settings: defaultSettings,
  groups: [],
  skus: [],
  orders: [],
  loading: false,
  refreshData: async () => {},
  showToast: () => {}
});

export const useAppContext = () => useContext(AppContext);

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [groups, setGroups] = useState<Group[]>([]);
  const [skus, setSkus] = useState<SKU[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [present] = useIonToast();

  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    present({
      message: msg,
      duration: 2500,
      position: 'bottom',
      color: type === 'error' ? 'danger' : type === 'info' ? 'primary' : 'success',
      cssClass: 'ion-text-center'
    });
  }, [present]);

  const refreshData = useCallback(async () => {
    try {
      const [s, g, sk, o] = await Promise.all([
        api.getSettings(),
        api.getGroups(),
        api.getSkus(),
        api.getOrders()
      ]);
      setSettings(s as AppSettings);
      setGroups(g);
      setSkus(sk);
      setOrders(o);
    } catch (err: any) {
      console.error('Data load error:', err);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };
    load();
  }, [refreshData]);

  return (
    <IonApp>
      <AppContext.Provider value={{ settings, groups, skus, orders, loading, refreshData, showToast }}>
        <IonReactRouter>
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/dashboard" component={DashboardPage} />
              <Route exact path="/skus" component={SkusPage} />
              <Route exact path="/create-order" component={CreateOrderPage} />
              <Route exact path="/reports" component={OrderReportPage} />
              <Route exact path="/more" component={MorePage} />
              <Route exact path="/groups" component={GroupsPage} />
              <Route exact path="/edit-order" component={EditOrderPage} />
              <Route exact path="/sku-report" component={SkuReportPage} />
              <Route exact path="/settings" component={SettingsPage} />
              <Route exact path="/sync" component={SyncPage} />
              <Route exact path="/help" component={HelpPage} />
              <Route exact path="/copyright" component={CopyrightPage} />
              <Redirect exact from="/" to="/dashboard" />
            </IonRouterOutlet>

            <IonTabBar slot="bottom">
              <IonTabButton tab="dashboard" href="/dashboard">
                <IonIcon icon={home} />
                <IonLabel>Utama</IonLabel>
              </IonTabButton>
              <IonTabButton tab="skus" href="/skus">
                <IonIcon icon={cube} />
                <IonLabel>SKU</IonLabel>
              </IonTabButton>
              <IonTabButton tab="create-order" href="/create-order">
                <IonIcon icon={addCircle} />
                <IonLabel>Pesanan</IonLabel>
              </IonTabButton>
              <IonTabButton tab="reports" href="/reports">
                <IonIcon icon={documentText} />
                <IonLabel>Laporan</IonLabel>
              </IonTabButton>
              <IonTabButton tab="more" href="/more">
                <IonIcon icon={menu} />
                <IonLabel>Menu</IonLabel>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        </IonReactRouter>

        <IonLoading isOpen={loading} message="Memuatkan data..." spinner="crescent" />
      </AppContext.Provider>
    </IonApp>
  );
};

export default App;
