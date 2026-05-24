import { useEffect, useState } from 'react';
import type { AppData } from '../types';
import { createBlankData, createSeededData, loadAppData, saveAppData, withFreshBriefing } from '../lib/storage';

export function useFamilyData() {
  const [data, setData] = useState<AppData>(() => loadAppData());

  useEffect(() => {
    saveAppData(data);
  }, [data]);

  const resetDemoData = () => {
    setData(createSeededData(true, 'demo'));
  };

  const startFresh = () => {
    setData(createBlankData({ setupComplete: false }));
  };

  const regenerateBriefing = () => {
    setData((current) => withFreshBriefing(current, current.briefing.version + 1));
  };

  return { data, setData, resetDemoData, startFresh, regenerateBriefing };
}
