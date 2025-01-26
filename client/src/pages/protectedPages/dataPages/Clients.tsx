import DataPageNew from "../../../components/DataPage/DataPage";




const Sites = () => {
  return (
    <>
      <DataPageNew
        apiEndpoint="/data/client"
        resource="client"
        pageTitle="Clients"
      />
    </>
  );
};

export default Sites;
