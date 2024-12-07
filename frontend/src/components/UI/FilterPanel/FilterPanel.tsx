import React, { useState, useRef } from 'react';
import { useRecoilState } from 'recoil';
import { currentFilterConfigState } from '../../../store/atoms/atoms';
import { FilterConfig } from '../../../types';
import Button from '../Button/Button';
import Panel from '../Panel/Panel';
import { FunnelIcon } from '@heroicons/react/24/outline';
import FilterListRecoil from '../FilterList/FilterListRecoil';

interface FilterPanelRecoilProps {
  resource: string;
}

const FilterPanelRecoil: React.FC<FilterPanelRecoilProps> = ({ resource }) => {
  const [currentFilterConfig, setCurrentFilterConfig] = useRecoilState<
    FilterConfig | null
  >(currentFilterConfigState(resource));
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);
  const panelRef = useRef<HTMLDivElement>(null);

  if (!currentFilterConfig) {
    return null;
  }

  const handleGlobalConnectorChange = (connector: 'AND' | 'OR') => {
    setCurrentFilterConfig((prevConfig) =>
      prevConfig
        ? {
          ...prevConfig,
          globalConnector: connector,
        }
        : null
    );
  };

  const { globalConnector } = currentFilterConfig;

  return (
    <div className="relative">
      <Button
        onClick={() => setIsFilterPanelOpen((prev) => !prev)}
        icon={<FunnelIcon className="w-5 h-5 mr-1" />}
        label={`Filters (${currentFilterConfig.filters.length})`}
      />
      <Panel  
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        title="Filters"
        panelRef={panelRef}
      >
        {/* Filter List */}
        <FilterListRecoil resource={resource} />
        {/* Global Connector Selection */}
        <div className="mt-2">
          <h4 className="font-medium text-sm mb-1">
            Connector for All Filters
          </h4>
          <div className="flex items-center space-x-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="globalConnector"
                value="AND"
                checked={globalConnector === 'AND'}
                onChange={() => handleGlobalConnectorChange('AND')}
                className="form-radio h-4 w-4 text-brand"
              />
              <span className="ml-1 text-xs text-neutral-700">AND</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="globalConnector"
                value="OR"
                checked={globalConnector === 'OR'}
                onChange={() => handleGlobalConnectorChange('OR')}
                className="form-radio h-4 w-4 text-brand"
              />
              <span className="ml-1 text-xs text-neutral-700">OR</span>
            </label>
          </div>
        </div>
      </Panel>
    </div>
  );
};

export default FilterPanelRecoil;
