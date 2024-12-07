import {  DataPage } from '../components/';
import { WebsiteData } from '../types';



const Sites = () => {
  return (
    <>
    <DataPage<WebsiteData>
      apiEndpoint={`/data/sites`}
      resource="sites"
      pageTitle="Sites" 
    />
    </>
  );
};

export default Sites;
