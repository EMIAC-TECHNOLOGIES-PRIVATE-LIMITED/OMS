import DataPageNew from "../../../components/DataPage/DataPage";




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
