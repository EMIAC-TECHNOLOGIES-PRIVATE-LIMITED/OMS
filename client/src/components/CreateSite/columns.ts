 import React from "react";
 import { EditableCell } from "./DataTable/";
 import { projects, storageOptions } from "./strains

 export const columns = [
   {
     accessorKey: "id",
     header: "ID",
   },
   {
     accessorKey: "name",
     header: "Name",
     cell: (cell) => (
       <div style={{ display: "flex", alignItems: "center", width: "110px" }}>
         <EditableCell
           {...cell}
           renderInput={(props) => (
             <input type="text" autoFocus {...props} value={props.value} />
           )}
         />
       </div>
     ),
     meta: {
       editable: true,
     },
   },
   {
     accessorKey: "parent",
     header: "Parent",
     cell: ({ row }) => (
       <div style={{ display: "flex", alignItems: "center", width: "100px" }}>
         {row.getValue("parent")}
       </div>
     ),
   },
   {
     accessorKey: "description",
     header: "Description",
     cell: (cell) => (
       <div style={{ display: "flex", alignItems: "center", width: "400px" }}>
         <EditableCell
           {...cell}
           renderInput={(props) => (
             <input type="text" autoFocus {...props} value={props.value} />
           )}
         />
       </div>
     ),
     meta: {
       editable: true,
     },
   },
   {
     accessorKey: "createdBy",
     header: "Created By",
     cell: ({ row }) => (
       <div style={{ display: "flex", alignItems: "center", width: "150px" }}>
         {row.getValue("createdBy")}
       </div>
     ),
   },
   {
     accessorKey: "createdOn",
     header: "Created On",
     cell: ({ row }) => (
       <div style={{ display: "flex", alignItems: "center", width: "80px" }}>
         {row.getValue("createdOn")}
       </div>
     ),
   },
 ];
