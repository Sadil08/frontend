import React from 'react';
import { DatePicker, Space, Button } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface DateRangeSelectorProps {
    onRangeChange: (startDate: string, endDate: string) => void;
    defaultRange?: 'week' | 'month' | 'quarter' | 'year';
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
    onRangeChange,
    defaultRange = 'month'
}) => {
    const [selectedRange, setSelectedRange] = React.useState<[Dayjs, Dayjs] | null>(null);

    React.useEffect(() => {
        // Set default range on mount
        handlePresetClick(defaultRange);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handlePresetClick = (preset: string) => {
        let start: Dayjs;
        let end: Dayjs = dayjs();

        switch (preset) {
            case 'week':
                start = dayjs().subtract(7, 'days');
                break;
            case 'month':
                start = dayjs().subtract(30, 'days');
                break;
            case 'quarter':
                start = dayjs().subtract(90, 'days');
                break;
            case 'year':
                start = dayjs().subtract(365, 'days');
                break;
            default:
                start = dayjs().subtract(30, 'days');
        }

        setSelectedRange([start, end]);
        onRangeChange(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
    };

    const handleRangeChange = (dates: null | [Dayjs | null, Dayjs | null]) => {
        if (dates && dates[0] && dates[1]) {
            setSelectedRange([dates[0], dates[1]]);
            onRangeChange(dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD'));
        }
    };

    return (
        <Space wrap>
            <Button
                size="small"
                onClick={() => handlePresetClick('week')}
                type={selectedRange && dayjs().diff(selectedRange[0], 'days') === 7 ? 'primary' : 'default'}
            >
                Last 7 Days
            </Button>
            <Button
                size="small"
                onClick={() => handlePresetClick('month')}
                type={selectedRange && dayjs().diff(selectedRange[0], 'days') === 30 ? 'primary' : 'default'}
            >
                Last 30 Days
            </Button>
            <Button
                size="small"
                onClick={() => handlePresetClick('quarter')}
                type={selectedRange && dayjs().diff(selectedRange[0], 'days') === 90 ? 'primary' : 'default'}
            >
                Last 90 Days
            </Button>
            <RangePicker
                value={selectedRange}
                onChange={handleRangeChange}
                format="YYYY-MM-DD"
                suffixIcon={<CalendarOutlined />}
                placeholder={['Start Date', 'End Date']}
            />
        </Space>
    );
};

export default DateRangeSelector;
