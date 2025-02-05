import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

export default function DataTable({ Data, excludeCollum = [] }) {
    console.log('Colonnes exclues : ', excludeCollum);

    // Vérifier si Data est un tableau non vide
    if (!Array.isArray(Data) || Data.length === 0) {
        return <div>Aucune donnée à afficher</div>;
    }

    // Liste des colonnes à exclure par défaut, auxquelles on ajoute celles passées en props
    const defaultExclusions = ['showUrl', 'editUrl'];
    const exclusions = [...defaultExclusions, ...excludeCollum];

    // Générer dynamiquement les colonnes de base en excluant les clés définies dans "exclusions"
    const baseColumns = Object.keys(Data[0])
        .filter((key) => !exclusions.includes(key))
        .map((key) => ({
            field: key,
            headerName: key.charAt(0).toUpperCase() + key.slice(1),
            sortable: true,
            flex: 1,
            width: 160,
        }));

    // Ajouter une colonne pour les actions
    const actionColumn = {
        field: 'actions',
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

    // Combiner les colonnes générées avec la colonne d'actions
    const columns = [...baseColumns, actionColumn];

    return (
        <Paper sx={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={Data}
                columns={columns}
                initialState={{
                    pagination: { paginationModel: { page: 0, pageSize: 5 } },
                }}
                pageSizeOptions={[5, 10]}
                sx={{ border: 0 }}
                disableColumnMenu  // Désactive le menu de colonne (filtrage, masquage, etc.)
                disableSelectionOnClick // Désactive la sélection de ligne au clic
            />
        </Paper>
    );
}
