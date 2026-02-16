import React, { useState } from 'react';
import { Button, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import analyticsService from '@/services/analyticsService';

interface ExportButtonProps {
    type: 'overview' | 'users' | 'revenue' | 'geo' | 'extractions';
    dateRange?: { startDate: string; endDate: string };
}

const ExportButton: React.FC<ExportButtonProps> = ({ type, dateRange }) => {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        try {
            setLoading(true);
            let data: any[] = [];
            let filename = `analytics_${type}_${new Date().toISOString().split('T')[0]}`;

            // Fetch data based on type
            switch (type) {
                case 'overview':
                    const overview = await analyticsService.getOverview();
                    data = [overview];
                    break;
                case 'users':
                    data = await analyticsService.getUserAnalytics();
                    break;
                case 'revenue':
                    if (dateRange) {
                        data = await analyticsService.getDailyRevenue(dateRange.startDate, dateRange.endDate);
                    }
                    break;
                case 'geo':
                    data = await analyticsService.getGeographicalStats();
                    break;
                case 'extractions':
                    const stats = await analyticsService.getExtractionStats();
                    // flattens the nested structure for CSV
                    data = [{
                        ...stats,
                        extractionsByUser: JSON.stringify(stats.extractionsByUser)
                    }];
                    break;
            }

            if (!data || data.length === 0) {
                message.warning('No data to export');
                return;
            }

            // Convert to CSV
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map(row =>
                Object.values(row).map(value =>
                    `"${String(value).replace(/"/g, '""')}"`
                ).join(',')
            );
            const csv = [headers, ...rows].join('\n');

            // Download
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            message.success('Export successful');
        } catch (error) {
            console.error('Export failed:', error);
            message.error('Failed to export data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
            loading={loading}
        >
            Export Report
        </Button>
    );
};

export default ExportButton;
