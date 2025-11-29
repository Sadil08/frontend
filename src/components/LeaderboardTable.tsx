import { Table } from 'antd';
import { TrophyOutlined, CrownOutlined } from '@ant-design/icons';
import { LeaderboardEntry } from '@/types/leaderboardTypes';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: number;
  loading?: boolean;
}

/**
 * Leaderboard Table Component
 * Displays per-paper leaderboard with rank, student name, marks, and time taken
 * Highlights the current user's entry if they're on the leaderboard
 */
export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  currentUserId,
  loading = false
}) => {
  const columns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank: number) => (
        <div className="flex items-center justify-center">
          {getRankDisplay(rank)}
        </div>
      )
    },
    {
      title: 'Student',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (name: string, record: LeaderboardEntry) => (
        <div className="flex items-center gap-2">
          <span className={`font-medium ${record.isCurrentUser ? 'text-blue-600 font-bold' : 'text-gray-900'}`}>
            {name}
          </span>
          {record.isCurrentUser && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              You
            </span>
          )}
        </div>
      )
    },
    {
      title: 'Score',
      dataIndex: 'marks',
      key: 'marks',
      width: 150,
      render: (marks: number, record: LeaderboardEntry) => (
        <div className="flex flex-col">
          <span className="font-bold text-lg text-gray-900">
            {marks}/{record.paperTotalMarks || 100}
          </span>
          {record.percentage !== undefined && (
            <span className="text-sm text-gray-500">
              {record.percentage.toFixed(1)}%
            </span>
          )}
        </div>
      ),
      sorter: (a: LeaderboardEntry, b: LeaderboardEntry) => b.marks - a.marks
    },
    {
      title: 'Time',
      dataIndex: 'timeTaken',
      key: 'timeTaken',
      width: 100,
      render: (time: number) => (
        <span className="text-gray-600">
          {time} min
        </span>
      ),
      sorter: (a: LeaderboardEntry, b: LeaderboardEntry) => a.timeTaken - b.timeTaken
    },
  ];

  const getRankDisplay = (rank: number) => {
    switch (rank) {
      case 1: return <TrophyOutlined className="text-yellow-500 text-xl" />;
      case 2: return <CrownOutlined className="text-gray-400 text-xl" />;
      case 3: return <span className="text-amber-600 text-xl">🥉</span>;
      default: return <span className="font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRowClassName = (record: LeaderboardEntry) => {
    if (record.isCurrentUser) {
      return 'leaderboard-user-highlight font-medium';
    }
    return 'hover:bg-gray-50 transition-colors';
  };

  return (
    <div
      role="region"
      aria-label={`Leaderboard rankings for paper`}
      aria-live="polite"
    >
      <Table
        columns={columns}
        dataSource={entries}
        rowKey={(record) => `${record.userId}-${record.rank}`}
        loading={loading}
        pagination={false}
        className="leaderboard-table"
        rowClassName={getRowClassName}
        scroll={{ x: 600 }}
        locale={{
          emptyText: 'No entries yet. Be the first to opt-in!'
        }}
        summary={() => {
          const userEntry = entries.find(entry => entry.isCurrentUser);
          if (userEntry) {
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}>
                  <div className="sr-only" aria-live="assertive">
                    Your current ranking is {userEntry.rank} out of {entries.length} participants with a score of {userEntry.marks} out of {userEntry.paperTotalMarks || 100}
                    {userEntry.percentage !== undefined && ` (${userEntry.percentage.toFixed(1)}%)`}.
                  </div>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }
          return null;
        }}
      />
    </div>
  );
};