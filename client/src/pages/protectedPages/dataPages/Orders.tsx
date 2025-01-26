import DataPageNew from "../../../components/DataPage/DataPage";




const Sites = () => {
  return (
    <>
      <DataPageNew
        apiEndpoint="/data/order"
        resource="order"
        pageTitle="Orders"
      />
    </>
  );
};

export default Sites;
