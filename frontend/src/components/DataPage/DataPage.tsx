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
        <div className="flex h-screen">
            {/* Sidebar */}
            <ViewSidebar
                views={views}
                resource={resource}
                currentViewId={currentViewId}
                onSelectView={handleSelectView}
                onDeleteView={handleDeleteView}
            />

            <div className="flex-1 p-4 overflow-auto">
                <h2 className="text-2xl font-bold mb-4">{pageTitle}</h2>
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
                {/* Save View Button */}
                {isModified && (
                    <div className="flex justify-end mb-4">
                        <button
                            type="button"
                            onClick={handleSaveView}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            {isDefaultView() ? 'Save View' : 'Save'}
                        </button>
                    </div>
                )}
                <DataTable
                    data={data}
                    availableColumns={availableColumns}
                    loading={loading}
                    error={error}
                    totalRecords={totalRecords}
                    selectedColumns={columnsToShow}
                />
                {error && <div className="text-red-500 mt-4">{error}</div>}
            </div>
        </div>
    );
}
