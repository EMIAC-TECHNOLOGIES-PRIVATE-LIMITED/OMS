import { useDataPage } from '../../hooks/';
import { DataTable, FilterComponent, ViewSidebar } from '..';
import { useRecoilValue } from 'recoil';
import { errorState, isModifiedState, totalRecordsState } from '../../store/atoms/atoms';


interface DataPageProps {
  apiEndpoint: string;
  resource: string;
  pageTitle: string;
}

export function DataPage<T extends object>({ apiEndpoint, resource, pageTitle }: DataPageProps) {
  // Initialize the Recoil state via the custom hook
  const { handleSaveView } = useDataPage<T>({ apiEndpoint, resource });
  const error = useRecoilValue(errorState(resource));
  const totalRecords = useRecoilValue(totalRecordsState(resource));
  const isModified = useRecoilValue(isModifiedState(resource));

  // console.log(`The value of error atom received is ${error} and is for page ${resource}`)


  return (
    <>
      <FilterComponent resource={resource} pageTitle={pageTitle} />
      <div className="flex h-screen bg-neutral-50">
        {/* Sidebar */}
        <div className='py-2 px'>
          <ViewSidebar resource={resource} />
        </div>
        {/* Main Content */}
        <div className="flex-1 flex flex-col py px overflow-auto relative">


          {/* Data Grid Container */}
          <div className="relative flex-1 mt-2 rounded-lg shadow-premium overflow-hidden w-full h-full">
            {/* DataTable */}
            <DataTable resource={resource} />

            {/* Watermark Image */}
            <img
              src="./image.png"
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
                Save View
              </button>
            )}

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
    </>
  );
}
