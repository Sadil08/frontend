import React from 'react';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

interface Bundle {
    id: number;
    name: string;
    price: number;
    description: string;
}

interface CartItemProps {
    item: Bundle;
    onRemove: (id: number) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onRemove }) => {
    return (
        <div className="card flex justify-between items-center mb-4">
            <div>
                <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
            </div>
            <div className="flex items-center gap-6">
                <span className="text-lg font-bold text-blue-600">${item.price.toFixed(2)}</span>
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onRemove(item.id)}
                    className="hover:bg-red-50"
                >
                    Remove
                </Button>
            </div>
        </div>
    );
};
