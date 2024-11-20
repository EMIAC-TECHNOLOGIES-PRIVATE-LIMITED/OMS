// src/components/DataPage/DataPage.tsx

import React from 'react';
import { useDataPage } from '../../hooks/useDataPage';
import { DataTable, ViewSidebar, FilterComponent2 } from '../';

interface DataPageProps<T> {
    apiEndpoint: string;
    resource: string;
    pageTitle: string;
}

export function DataPage<T extends object>({ apiEndpoint, resource, pageTitle }: DataPageProps<T>) {
    const {
        data,
        totalRecords,
        availableColumns,
        loading,
        error,
        currentViewId,
        views,
        initialFilterConfig,
        page,
        pageSize,
        isModified,
        currentFilterConfig,
        handleSelectView,
        handleDeleteView,
        handlePageChange,
        handleSaveView,
        handleFilterChange,
        isDefaultView,
    } = useDataPage<T>({ apiEndpoint, resource });

    const columnsToShow = currentFilterConfig?.columns || initialFilterConfig?.columns || [];

    return (
        <div className="flex h-screen bg-neutral-50">
            {/* Sidebar */}
            <ViewSidebar
                views={views}
                resource={resource}
                currentViewId={currentViewId}
                onSelectView={handleSelectView}
                onDeleteView={handleDeleteView}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col p-6 overflow-auto relative">
                {/* Page Title */}
                <h2 className="text-3xl font-semibold text-neutral-800 mb-1">{pageTitle}</h2>

                {/* Function Bar (FilterComponent2) */}
                {availableColumns && initialFilterConfig && (
                    <FilterComponent2
                        availableColumns={availableColumns}
                        onFilterChange={handleFilterChange}
                        initialFilterConfig={initialFilterConfig}
                        currentFilterConfig={currentFilterConfig || undefined}
                        totalRecords={totalRecords}
                        page={page}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                    />
                )}

                {/* Data Grid Container */}
                <div className="relative flex-1 mt-2 rounded-lg shadow-premium overflow-hidden w-full h-full">
                    {/* DataTable */}
                    <DataTable 
                        data={data}
                        availableColumns={availableColumns}
                        loading={loading}
                        error={error}
                        totalRecords={totalRecords}
                        selectedColumns={columnsToShow}
                    />

                    {/* Watermark Image */}
                    <img
                        src="./image.png" // Replace with actual path
                        alt="Watermark"
                        className="absolute inset-0 w-full h-full object-cover opacity-5 pointer-events-none"
                    />

                    {/* Save View Button */}
                    {isModified && (
                        <button
                            type="button"
                            onClick={handleSaveView}
                            className="absolute bottom-12 right-6 bg-brand text-white font-semibold py-2 px-4 rounded-md shadow-premium hover:bg-brand-light transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-dark z-20"
                        >
                            {isDefaultView() ? 'Create New View' : 'Save'}
                        </button>
                    )}

                    {/* Error Message */} 
                    {error && (
                        <div className="absolute top-4 left-4 bg-red-100 text-red-700 px-4 py-2 rounded-md shadow-lg z-20">
                            {error}
                        </div>
                    )}

                    {/* Fetched Records */}
                    <div className="absolute top-3 right-5 bg-neutral-200 text-neutral-800 px-4 py-1 rounded-md shadow-lg z-10 ">
                        Fetched {totalRecords} records.
                    </div>
                </div>
            </div>
        </div>
    );
}
