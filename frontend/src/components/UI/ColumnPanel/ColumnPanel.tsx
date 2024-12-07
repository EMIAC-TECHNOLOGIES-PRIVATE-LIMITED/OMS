// src/components/UI/ColumnPanelRecoil/ColumnPanelRecoil.tsx

import React, { useState, useRef } from 'react';
import { useRecoilState } from 'recoil';
import { currentFilterConfigState } from '../../../store/atoms/atoms';
import { FilterConfig } from '../../../types';
import Button from '../Button/Button';
import Panel from '../Panel/Panel';
import { EyeSlashIcon } from '@heroicons/react/24/outline';
import ColumnSelectorRecoil from '../ColumnSelector/ColumnSelectorRecoil';

interface ColumnPanelRecoilProps {
  resource: string;
}

const ColumnPanelRecoil: React.FC<ColumnPanelRecoilProps> = ({ resource }) => {
  const [currentFilterConfig] = useRecoilState<FilterConfig | null>(
    currentFilterConfigState(resource)
  );
  const [isColumnPanelOpen, setIsColumnPanelOpen] = useState<boolean>(false);
  const panelRef = useRef<HTMLDivElement>(null);

  if (!currentFilterConfig) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setIsColumnPanelOpen((prev) => !prev)}
        icon={<EyeSlashIcon className="w-5 h-5 mr-1" />}
        label={`Show Columns (${currentFilterConfig.columns.length})`}
      />
      <Panel
        isOpen={isColumnPanelOpen}
        onClose={() => setIsColumnPanelOpen(false)}
        title="Select Columns to Display"
        panelRef={panelRef}
      >
        {/* Column Selector */}
        <ColumnSelectorRecoil resource={resource} />
      </Panel>
    </div>
  );
};

export default ColumnPanelRecoil;
