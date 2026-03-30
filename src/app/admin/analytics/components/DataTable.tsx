import React from 'react';
import { Card, Table, Input, Button } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';

interface DataTableProps {
    title: string;
    data: any[];
    columns: ColumnType<any>[];
    loading?: boolean;
    searchable?: boolean;
    searchPlaceholder?: string;
    exportable?: boolean;
    exportFilename?: string;
    pagination?: {
        pageSize?: number;
        showSizeChanger?: boolean;
        pageSizeOptions?: string[];
    };
    onRowClick?: (record: any) => void;
}

const DataTable: React.FC<DataTableProps> = ({
    title,
    data,
    columns,
    loading = false,
    searchable = false,
    searchPlaceholder = 'Search...',
    exportable = false,
    exportFilename = 'data',
    pagination = { pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '25', '50', '100'] },
    onRowClick
}) => {
    const [searchText, setSearchText] = React.useState('');
    const [filteredData, setFilteredData] = React.useState(data);

    React.useEffect(() => {
        if (!searchText) {
            setFilteredData(data);
            return;
        }

        const lowercasedFilter = searchText.toLowerCase();
        const filtered = data.filter((item) => {
            return Object.keys(item).some((key) => {
                return String(item[key]).toLowerCase().includes(lowercasedFilter);
            });
        });
        setFilteredData(filtered);
    }, [searchText, data]);

    const exportToCSV = () => {
        if (!data || data.length === 0) return;

        // Extract column headers
        const headers = columns.map(col => col.title as string).join(',');

        // Extract data rows
        const rows = data.map(row => {
            return columns.map(col => {
                const value = row[col.dataIndex as string];
                // Escape commas and quotes in values
                const escaped = String(value || '').replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(',');
        });

        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `${exportFilename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const extra = (
        <div style={{ display: 'flex', gap: '8px' }}>
            {searchable && (
                <Input
                    placeholder={searchPlaceholder}
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 200 }}
                    allowClear
                />
            )}
            {exportable && (
                <Button
                    icon={<DownloadOutlined />}
                    onClick={exportToCSV}
                    disabled={!data || data.length === 0}
                >
                    Export CSV
                </Button>
            )}
        </div>
    );

    return (
        <Card title={title} bordered={false} extra={extra}>
            <Table
                columns={columns}
                dataSource={filteredData}
                loading={loading}
                pagination={pagination}
                rowKey={(record) => record.id || record.key || Math.random().toString()}
                onRow={(record) => ({
                    onClick: () => onRowClick && onRowClick(record),
                    style: onRowClick ? { cursor: 'pointer' } : undefined
                })}
                scroll={{ x: 'max-content' }}
            />
        </Card>
    );
};

export default DataTable;
