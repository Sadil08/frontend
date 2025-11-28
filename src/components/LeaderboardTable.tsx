import { Table } from 'antd';
import { LeaderboardEntryDto } from '@/types';

interface LeaderboardTableProps {
  data: LeaderboardEntryDto[];
  currentUserId?: number;
  loading?: boolean;
}

/**
 * Leaderboard Table Component
 * Displays per-paper leaderboard with rank, student name, marks, and time taken
 * Highlights the current user's entry if they're on the leaderboard
 */
export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  data,
  currentUserId,
  loading = false
}) => {
  const columns = [
    {
      title: 'Rank',
      key: 'rank',
      width: 80,
      render: (_: any, __: any, index: number) => (
        <div className="flex items-center justify-center">
          <span className={`font-bold ${index === 0 ? 'text-yellow-600 text-xl' :
              index === 1 ? 'text-gray-400 text-lg' :
                index === 2 ? 'text-orange-600 text-lg' :
                  'text-gray-600'
            }`}>
            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
          </span>
        </div>
      )
    },
    {
      title: 'Student',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (name: string, record: LeaderboardEntryDto) => (
        <span className={`font-medium ${record.userId === currentUserId ? 'text-blue-600 font-bold' : 'text-gray-900'
          }`}>
          {name} {record.userId === currentUserId && '(You)'}
        </span>
      )
    },
    {
      title: 'Marks',
      dataIndex: 'marks',
      key: 'marks',
      width: 100,
      render: (marks: number) => (
        <span className="font-semibold text-green-600">{marks}</span>
      )
    },
    {
      title: 'Time Taken',
      dataIndex: 'timeTaken',
      key: 'timeTaken',
      width: 120,
      render: (time: number) => (
        <span className="text-gray-700">{time} min</span>
      )
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey={(record, index) => `${record.studentName}-${index}`}
      loading={loading}
      pagination={false}
      className="leaderboard-table"
      rowClassName={(record) =>
        record.userId === currentUserId
          ? 'bg-blue-50 hover:bg-blue-100 font-semibold'
          : 'hover:bg-gray-50'
      }
      locale={{
        emptyText: 'No entries yet. Be the first to opt-in!'
      }}
    />
  );
};