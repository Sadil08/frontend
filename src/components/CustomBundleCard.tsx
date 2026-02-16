import React from 'react';
import { useRouter } from 'next/navigation';
import { Tag } from 'antd';
import { CustomBundleDto } from '@/services/customBundleService';

interface CustomBundleCardProps {
    bundle: CustomBundleDto;
}

export const CustomBundleCard: React.FC<CustomBundleCardProps> = ({ bundle }) => {
    const router = useRouter();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CREATED': return 'default';
            case 'PURCHASED': return 'orange';
            case 'APPROVED': return 'green';
            default: return 'default';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
            <div className={`h-2 bg-gradient-to-r from-purple-500 to-indigo-600`}></div>

            <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <Tag color="purple">Custom Bundle</Tag>
                    <Tag color={getStatusColor(bundle.status)}>{bundle.status}</Tag>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {bundle.name}
                </h3>

                {bundle.description && (
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">
                        {bundle.description}
                    </p>
                )}

                <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600 text-sm">
                            {bundle.paperIds.length} Papers
                        </span>
                        <span className="font-semibold text-gray-900">
                            ${bundle.totalPrice?.toFixed(2)}
                        </span>
                    </div>

                    <button
                        onClick={() => {
                            if (bundle.status === 'CREATED') {
                                router.push(`/bundles/create-custom`);
                            } else {
                                router.push(`/custom-bundles/${bundle.id}`);
                            }
                        }}
                        className="w-full py-2.5 px-4 bg-gray-50 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors border border-gray-200"
                    >
                        {bundle.status === 'CREATED' ? 'Edit Draft' : 'View Papers'}
                    </button>
                </div>
            </div>
        </div>
    );
};
