import DataPageNew from "../../../components/DataPage/DataPageNew";




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
