import { useEffect, useState } from 'react';
import type { AppData } from '../types';
import { createSeededData, loadAppData, saveAppData, withFreshBriefing } from '../lib/storage';

export function useFamilyData() {
  const [data, setData] = useState<AppData>(() => loadAppData());

  useEffect(() => {
    saveAppData(data);
  }, [data]);

  const resetDemoData = () => {
    setData(createSeededData(true));
  };

  const regenerateBriefing = () => {
    setData((current) => withFreshBriefing(current, current.briefing.version + 1));
  };

  return { data, setData, resetDemoData, regenerateBriefing };
}
