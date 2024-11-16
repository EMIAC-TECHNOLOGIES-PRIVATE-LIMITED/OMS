import { DataPage } from '../components/';
import { WebsiteData } from '../types';

const api: string = import.meta.env.VITE_API_URL;

const Sites = () => {
  return (
    <>
    <DataPage<WebsiteData>
      apiEndpoint={`${api}/data/sites`}
      resource="sites"
      pageTitle="Sites"
    />
    </>
  );
};

export default Sites;
