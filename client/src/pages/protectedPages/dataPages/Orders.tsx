import {  DataPage } from '../../../components';
import { VendorData} from '../../../types';



const Orders  = () => {
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

export default Orders;
