import DataPageNew from "../../../components/DataPage/DataPageNew";




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
