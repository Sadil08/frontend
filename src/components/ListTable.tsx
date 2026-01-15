import React from 'react';
import { Table, Button, Space } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface ListTableProps<T> {
    data: T[];
    columns: ColumnsType<T>;
    loading?: boolean;
    onEdit?: (record: T) => void;
    onDelete?: (record: T) => void;
    onView?: (record: T) => void;
    rowKey?: string;
    pagination?: any;
}

export function ListTable<T extends { id: number | string }>({
    data,
    columns,
    loading,
    onEdit,
    onDelete,
    onView,
    rowKey = 'id',
    pagination
}: ListTableProps<T>) {

    const actionColumn: ColumnsType<T>[0] = {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
            <Space size="small">
                {onView && (
                    <Button
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => onView(record)}
                        title="View"
                    />
                )}
                {onEdit && (
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => onEdit(record)}
                        title="Edit"
                    />
                )}
                {onDelete && (
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => onDelete(record)}
                        title="Delete"
                    />
                )}
            </Space>
        ),
    };

    const tableColumns = (onEdit || onDelete || onView)
        ? [...columns, actionColumn]
        : columns;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <Table
                dataSource={data}
                columns={tableColumns}
                rowKey={rowKey}
                loading={loading}
                pagination={pagination || {
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`,
                    className: "px-6 py-4"
                }}
                className="w-full"
                rowClassName="hover:bg-gray-50 transition-colors"
                scroll={{ x: true }}
            />
        </div>
    );
}
