import React, { useState, useEffect } from 'react';
import {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem
} from "@/components/ui/context-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { FilterConfig } from '../../../../shared/src/types';
import { EyeOff, ListFilter, ArrowUp, ArrowDown } from 'lucide-react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { filterPanelLocalFiltersAtom, filterPanelOpenStateAtom } from '@/store/atoms/atoms';

interface CustomHeaderProps {
    displayName: string;
    column: any;
    enableSorting: boolean;
    enableMenu: boolean;
    showColumnMenu: (event: React.MouseEvent<HTMLElement>) => void;
    progressSort: (event: React.MouseEvent<HTMLElement>) => void;
    setSort: (event: React.MouseEvent<HTMLElement>, sort: string) => void;
    api: any;
    filterConfig: FilterConfig;
    handleFilterChange: (config: FilterConfig) => void;
    columnDescription?: string;
}

export const CustomHeaderWithContextMenu: React.FC<CustomHeaderProps> = (props) => {
    const [sortState, setSortState] = useState<number>(0);
    const columnId = props.column.getColId();
    const setFilterPanelOpenState = useSetRecoilState(filterPanelOpenStateAtom);
    const [filterPanelLocalFilterState, setFilterPanelLocalState] = useRecoilState(filterPanelLocalFiltersAtom);

    useEffect(() => {

        const currentSort = props.filterConfig?.sort || [];
        const columnSortIndex = currentSort.findIndex(sort => columnId in sort);

        if (columnSortIndex !== -1) {
            const direction = currentSort[columnSortIndex][columnId];
            setSortState(direction === 'asc' ? 1 : 2);
        } else {
            setSortState(0);
        }
    }, [props.filterConfig, columnId]);

    const onSortClicked = () => {
        if (columnId === 'site.categories') {
            return;
        }

        const newSortState = (sortState + 1) % 3;
        setSortState(newSortState);
        updateSortConfig(newSortState);
    };

    const updateSortConfig = (newSortState: number) => {
        const currentFilterConfig = { ...props.filterConfig ?? {} };
        const currentSort = [...(currentFilterConfig.sort || [])];

        const columnSortIndex = currentSort.findIndex(sort => columnId in sort);

        if (newSortState === 0) {
            if (columnSortIndex !== -1) {
                currentSort.splice(columnSortIndex, 1);
            }
        } else {
            const sortDirection = newSortState === 1 ? 'asc' : 'desc';
            if (columnSortIndex !== -1) {
                currentSort[columnSortIndex] = { [columnId]: sortDirection };
            } else {
                currentSort.push({ [columnId]: sortDirection });
            }
        }

        const newConfig: FilterConfig = {
            ...currentFilterConfig,
            sort: currentSort.length > 0 ? currentSort : undefined
        };


        props.handleFilterChange(newConfig);
    };

    const handleFilter = () => {

        let newLocalFilters = [...filterPanelLocalFilterState, { column: columnId, isComplete: false }];

        setFilterPanelLocalState(newLocalFilters);

    };

    useEffect(() => {

        if (filterPanelLocalFilterState.some(filter => filter.column === columnId && !filter.isComplete)) {

            setTimeout(() => {
                setFilterPanelOpenState(true);
            }, 500);
        }
    }, [filterPanelLocalFilterState, columnId]);

    const handleHide = () => {
        const currentFilterConfig = props.filterConfig || { columns: [] };
        const newConfig: FilterConfig = {
            ...currentFilterConfig,
            columns: [...(currentFilterConfig.columns || []), columnId],
        };

        const updatedFilterConfig = { ...newConfig };
        updatedFilterConfig.filters = updatedFilterConfig.filters?.filter((f) => columnId !== f.column);
        updatedFilterConfig.sort = updatedFilterConfig.sort?.filter((s) =>
            Object.keys(s).some(key => columnId !== key)
        );


        props.handleFilterChange(updatedFilterConfig);
    };

    const isHideDesabled = columnId === 'order.id';

    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <ContextMenu>
                    <TooltipTrigger asChild>
                        <ContextMenuTrigger asChild>
                            <div
                                className="flex items-center justify-between w-full h-full px-3 py-2"
                                onClick={onSortClicked}
                            >
                                <span className="truncate">
                                    {props.displayName}
                                </span>

                                <div className="flex items-center space-x-2">
                                    <span className={`transition-opacity duration-200 ${sortState === 0 ? 'opacity-0 group-hover:opacity-50' : 'opacity-100'}`}>
                                        {sortState !== 0 && (
                                            sortState === 1 ? <ArrowUp className="w-4 h-4 text-slate-600" /> : <ArrowDown className="w-4 h-4 text-slate-600" />
                                        )}
                                    </span>
                                </div>
                            </div>
                        </ContextMenuTrigger>
                    </TooltipTrigger>

                    <ContextMenuContent className="w-48">
                        <ContextMenuItem
                            onClick={handleHide}
                            className="flex items-center justify-between px-2 py-1"
                            disabled={isHideDesabled}
                        >
                            <div className="flex items-center gap-2">
                                <EyeOff className="w-4 h-4" />
                                <span className="font-medium">
                                    Hide Column
                                </span>
                            </div>
                        </ContextMenuItem>

                        <ContextMenuItem
                            onClick={handleFilter}
                            className="flex items-center justify-between px-2 py-1"
                        >
                            <div className="flex items-center gap-2">
                                <ListFilter className="w-4 h-4" />
                                <span className="font-medium">
                                    Add Filter
                                </span>
                            </div>
                        </ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>

                {props.columnDescription && (
                    <TooltipContent side="top" sideOffset={5} className="font-normal italic ">
                        {props.columnDescription}
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    );
};