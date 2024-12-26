import {  DataPage } from '../../../components';
import { VendorData} from '../../../types';



const Vendors  = () => {
  return (
    <>
    <DataPage<VendorData>
      apiEndpoint={`/data/vendors`}
      resource="vendors"
      pageTitle="Vendors" 
    />
    </>
  );
};

export default Vendors;
