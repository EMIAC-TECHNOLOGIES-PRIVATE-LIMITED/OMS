 import { DataTable, useDataTable } from "./DataTable";
 import { columns } from "./columns
 import { strains } from "./strains";

 export default function App() {
   const { table, paste, undo, redo } = useDataTable({
     columns,
     data: strains,
     history: true,
   });

   return (
     <div
       style={{
         maxWidth: "100%",
         margin: "0 auto",
         paddingTop: "40px",
         paddingBottom: "40px",
       }}
     >
       <DataTable
         table={table}
         allowCellSelection={true}
         allowRangeSelection={true}
         allowHistory={true}
         allowPaste={true}
         paste={paste}
         undo={undo}
         redo={redo}
       />
     </div>
   );
 }
