import DataPageNew from "../../../components/DataPage/DataPageNew";




const Sites = () => {
  return (
    <>
      <DataPageNew
        apiEndpoint="/data/site"
        resource="site"
        pageTitle="Sites"
      />
    </>
  );
};

export default Sites;
