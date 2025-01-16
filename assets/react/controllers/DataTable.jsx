import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

export default function DataTable({ Data }) {
    console.log(Data);
    // Générer dynamiquement les colonnes de base

    const baseColumns = Object.keys(Data[0] || {})
        .filter((key) => !['showUrl', 'editUrl'].includes(key)) // Exclure les colonnes inutiles
        .map((key) => ({
            field: key,
            headerName: key.charAt(0).toUpperCase() + key.slice(1),
            sortable: true,
            flex: 1,
            width: 160,
        }));


    // Ajouter une colonne pour les actions
    const actionColumn = {
        field: 'actions', // Un nom unique pour cette colonne
        headerName: 'Actions',
        sortable: false,
        width: 200,
        renderCell: (params) => (
            <div>
                <a href={params.row.showUrl} style={{ marginRight: '10px' }}>Show</a>
                <a href={params.row.editUrl}>Edit</a>
            </div>
        ),
    };

    // Ajouter toutes les colonnes ensemble
    const columns = [...baseColumns, actionColumn];

    return (
        <Paper sx={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={Data} // Données dynamiques
                columns={columns} // Colonnes avec actions
                initialState={{
                    pagination: { paginationModel: { page: 0, pageSize: 5 } },
                }}
                pageSizeOptions={[5, 10]}
                // checkboxSelection
                sx={{ border: 0 }}
            />
        </Paper>
    );
}
