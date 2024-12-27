import DataPageNew from "../../../components/DataPage/DataPageNew";




const Sites = () => {
  return (
    <>
      <DataPageNew
        apiEndpoint="/data/vendor"
        resource="vendor"
        pageTitle="Vendors"
      />
    </>
  );
};

export default Sites;
