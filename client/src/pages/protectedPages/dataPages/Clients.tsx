import {  DataPage } from '../../../components';
import { WebsiteData } from '../../../types';



const Clients = () => {
  return (
    <>
    <DataPage<WebsiteData>
      apiEndpoint={`/data/clients`}
      resource="clients"
      pageTitle="Clients" 
    />
    </>
  );
};

export default Clients;
