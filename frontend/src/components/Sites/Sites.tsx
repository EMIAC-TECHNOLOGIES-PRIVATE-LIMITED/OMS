import { Container } from '@mui/material';
import { DataGrid, GridColDef, GridRowsProp, GridToolbar } from '@mui/x-data-grid';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { ResponseData } from '../../types';

const api: string = (import.meta.env.VITE_API_URL);
const token: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluM0B0ZXN0LmNvbSIsInVzZXJJZCI6Mywicm9sZSI6ImFkbWluIiwicGVybWlzc2lvbnMiOlt7ImtleSI6IlZJRVdfU0lURVNfUk9VVEUiLCJkZXNjcmlwdGlvbiI6IlBlcm1pc3Npb24gdG8gdmlldyBzaXRlcyByb3V0ZSJ9XSwicmVzb3VyY2VzIjpbeyJrZXkiOiJTaXRlX0FkbWluIiwiY29sdW1ucyI6WyJpZCIsIndlYnNpdGUiLCJuaWNoZSIsInNpdGVfY2F0ZWdvcnkiLCJkYSIsInBhIiwicGVyc29uIiwicGVyc29uX2lkIiwicHJpY2UiLCJzYWlsaW5nX3ByaWNlIiwiZGlzY291bnQiLCJhZHVsdCIsImNhc2lub19hZHVsdCIsImNvbnRhY3QiLCJjb250YWN0X2Zyb20iLCJ3ZWJfY2F0ZWdvcnkiLCJmb2xsb3ciLCJwcmljZV9jYXRlZ29yeSIsInRyYWZmaWMiLCJzcGFtX3Njb3JlIiwiY2JkX3ByaWNlIiwicmVtYXJrIiwiY29udGFjdF9mcm9tX2lkIiwidmVuZG9yX2NvdW50cnkiLCJwaG9uZV9udW1iZXIiLCJzYW1wbGVfdXJsIiwiYmFua19kZXRhaWxzIiwiZHIiLCJ1c2VyX2lkIiwidGltZXN0YW1wIiwid2ViX2lwIiwid2ViX2NvdW50cnkiLCJsaW5rX2luc2VydGlvbl9jb3N0IiwidGF0Iiwic29jaWFsX21lZGlhX3Bvc3RpbmciLCJzZW1ydXNoX3RyYWZmaWMiLCJzZW1ydXNoX2ZpcnN0X2NvdW50cnlfbmFtZSIsInNlbXJ1c2hfZmlyc3RfY291bnRyeV90cmFmZmljIiwic2VtcnVzaF9zZWNvbmRfY291bnRyeV9uYW1lIiwic2VtcnVzaF9zZWNvbmRfY291bnRyeV90cmFmZmljIiwic2VtcnVzaF90aGlyZF9jb3VudHJ5X25hbWUiLCJzZW1ydXNoX3RoaXJkX2NvdW50cnlfdHJhZmZpYyIsInNlbXJ1c2hfZm91cnRoX2NvdW50cnlfbmFtZSIsInNlbXJ1c2hfZm91cnRoX2NvdW50cnlfdHJhZmZpYyIsInNlbXJ1c2hfZmlmdGhfY291bnRyeV9uYW1lIiwic2VtcnVzaF9maWZ0aF9jb3VudHJ5X3RyYWZmaWMiLCJzaW1pbGFyd2ViX3RyYWZmaWMiLCJ2ZW5kb3JfaW52b2ljZV9zdGF0dXMiLCJtYWluX2NhdGVnb3J5Iiwic2l0ZV91cGRhdGVfZGF0ZSIsIndlYnNpdGVfdHlwZSIsImxhbmd1YWdlIiwiZ3N0IiwiZGlzY2xhaW1lciIsImFuY2hvcl90ZXh0IiwiYmFubmVyX2ltYWdlX3ByaWNlIiwiY3BfdXBkYXRlX2RhdGUiLCJwdXJlX2NhdGVnb3J5IiwiYXZhaWxhYmlsaXR5IiwiaW5kZXhlZF91cmwiLCJ3ZWJzaXRlX3N0YXR1cyIsIndlYnNpdGVfcXVhbGl0eSIsIm51bV9vZl9saW5rcyIsInNlbXJ1c2hfdXBkYXRpb25fZGF0ZSIsIm9yZ2FuaWNfdHJhZmZpYyIsIm9yZ2FuaWNfdHJhZmZpY19sYXN0X3VwZGF0ZV9kYXRlIiwiY3JlYXRlZF9hdCJdfV0sImlhdCI6MTczMDkwMTY1NCwiZXhwIjoxNzMwOTA1MjU0fQ.MiYNE2wlYIoGSKSnyvqvgHdx395Cy-scNm-qwwDIGqM";

function Sites() {
    const [data, setData] = useState<ResponseData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [columns, setColumns] = useState<GridColDef[]>([]); // Initial empty array for columns

    // Fetch the data
    useEffect(() => {
        const fetchSitesData = async () => {
            try {
                const response = await axios.get(`${api}/data/sites`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setData(response.data);
            } catch (e: any) {
                setError(e.response ? e.response.data : 'An error occurred while fetching data');
            } finally {
                setLoading(false);
            }
        };

        fetchSitesData();
    }, []);

    // Set columns based on availableColumns in data
    useEffect(() => {
        if (data) {
            const generatedColumns: GridColDef[] = Object.entries(data.availableColumns || {}).map(([key]) => ({
                field: key,
                headerName: key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
            }));
            setColumns(generatedColumns);
        }
    }, [data]); // Re-run this effect whenever `data` updates

    if (loading) {
        return (
            <>
                <h4>Loader / Spinner Here</h4>
            </>
        );
    }

    return (
        <Container>
            <div className='bg-red-200'>
                <DataGrid rows={rows} columns={columns} slots={{ toolbar: GridToolbar }} />
            </div>
        </Container>
    );
}

// Sample rows, adjust as needed
const rows: GridRowsProp = [
    { id: 1, col1: 'Hello', col2: 'World' },
    { id: 2, col1: 'DataGridPro', col2: 'is Awesome' },
];

export default Sites;
