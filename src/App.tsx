import { lazy, Suspense, useState } from 'react';
import { AppShell } from './components/AppShell';
import { Card } from './components/ui';
import { useFamilyData } from './hooks/useFamilyData';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import type { AppTab } from './types';
import { Onboarding } from './screens/Onboarding';

const tabs: AppTab[] = ['home', 'money', 'bills', 'tasks', 'goals', 'briefing', 'settings'];

const HomeScreen = lazy(() => import('./screens/Home').then((module) => ({ default: module.HomeScreen })));
const MoneyScreen = lazy(() => import('./screens/Money').then((module) => ({ default: module.MoneyScreen })));
const BillsScreen = lazy(() => import('./screens/Bills').then((module) => ({ default: module.BillsScreen })));
const TasksScreen = lazy(() => import('./screens/Tasks').then((module) => ({ default: module.TasksScreen })));
const GoalsScreen = lazy(() => import('./screens/Goals').then((module) => ({ default: module.GoalsScreen })));
const BriefingScreen = lazy(() => import('./screens/Briefing').then((module) => ({ default: module.BriefingScreen })));
const SettingsScreen = lazy(() => import('./screens/Settings').then((module) => ({ default: module.SettingsScreen })));

function tabFromUrl(): AppTab {
  const value = new URLSearchParams(window.location.search).get('tab') as AppTab | null;
  return value && tabs.includes(value) ? value : 'home';
}

export default function App() {
  const { data, setData, resetDemoData, startFresh, regenerateBriefing } = useFamilyData();
  const installPrompt = useInstallPrompt();
  const [tab, setTabState] = useState<AppTab>(() => tabFromUrl());

  const setTab = (next: AppTab) => {
    setTabState(next);
    const url = new URL(window.location.href);
    if (next === 'home') {
      url.searchParams.delete('tab');
    } else {
      url.searchParams.set('tab', next);
    }
    window.history.replaceState(null, '', url);
  };

  const renderScreen = () => {
    switch (tab) {
      case 'money':
        return <MoneyScreen data={data} setData={setData} />;
      case 'bills':
        return <BillsScreen data={data} setData={setData} />;
      case 'tasks':
        return <TasksScreen data={data} setData={setData} />;
      case 'goals':
        return <GoalsScreen data={data} setData={setData} />;
      case 'briefing':
        return <BriefingScreen data={data} regenerateBriefing={regenerateBriefing} />;
      case 'settings':
        return (
          <SettingsScreen
            data={data}
            setData={setData}
            resetDemoData={resetDemoData}
            startFresh={startFresh}
            install={installPrompt.install}
            canInstall={installPrompt.canInstall}
            installed={installPrompt.installed}
          />
        );
      case 'home':
      default:
        return <HomeScreen data={data} setTab={setTab} />;
    }
  };

  if (!data.household.setupComplete) {
    return <Onboarding data={data} setData={setData} />;
  }

  return (
    <AppShell household={data.household} tab={tab} setTab={setTab}>
      <Suspense
        fallback={
          <Card className="p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200/80">FamilyOS</p>
            <p className="mt-2 text-2xl font-black text-white">Loading household view</p>
          </Card>
        }
      >
        {renderScreen()}
      </Suspense>
    </AppShell>
  );
}
