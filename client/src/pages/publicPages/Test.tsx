import { Autocomplete } from "@/components/UI/TypeAhead/TypeAhead"


function Test() {
    return (
        <>
            <Autocomplete
                route="vendor"
                column="name"
                onSelect={(id) => console.log("the selected value id is : ", id)}
                emptyMessage="No vendors found"

            />
        </>
    )
}

export default Test