import DataPageNew from "../../../components/DataPage/DataPage";




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
