import { Table } from 'antd';
import { LeaderboardEntryDto } from '@/types';

interface LeaderboardTableProps {
  data: LeaderboardEntryDto[];
}

const columns = [
  { title: 'Rank', dataIndex: 'rank', key: 'rank' },
  { title: 'User', dataIndex: 'user', key: 'user', render: (text: string, record: LeaderboardEntryDto) => record.isAnonymous ? 'Anonymous' : text },
  { title: 'Score', dataIndex: 'score', key: 'score' },
  { title: 'Subject', dataIndex: 'subjectId', key: 'subjectId' },
];

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ data }) => (
  <Table
    columns={columns}
    dataSource={Array.isArray(data) ? data.map((item, index) => ({ ...item, rank: index + 1, user: item.userId?.toString() || 'Anonymous' })) : []}
    rowKey="id"
    className="bg-white shadow-md"
    onRow={() => ({ className: 'hover:bg-blue-50' })}
  />
);