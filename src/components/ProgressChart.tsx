import { Progress } from 'antd';

interface ProgressChartProps {
  percent: number;
  title: string;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ percent, title }) => (
  <div className="bg-blue-50 p-4 rounded-lg">
    <h3 className="text-lg font-semibold text-green-700 mb-2">{title}</h3>
    <Progress percent={percent} status="active" />
  </div>
);