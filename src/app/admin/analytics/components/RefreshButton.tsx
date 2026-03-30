import React, { useState } from 'react';
import { Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface RefreshButtonProps {
    onRefresh: () => void;
    loading?: boolean;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ onRefresh, loading = false }) => {
    const [lastUpdated, setLastUpdated] = useState<string>('');

    React.useEffect(() => {
        setLastUpdated(dayjs().format('HH:mm:ss'));
    }, []);

    const handleRefresh = () => {
        onRefresh();
        setLastUpdated(dayjs().format('HH:mm:ss'));
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {lastUpdated && (
                <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                    Updated: {lastUpdated}
                </span>
            )}
            <Button
                icon={<ReloadOutlined spin={loading} />}
                onClick={handleRefresh}
                loading={loading}
                size="small"
            />
        </div>
    );
};

export default RefreshButton;
