
import React from 'react';
import { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  data: LeaderboardEntry[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-10 px-4 text-gray-400">
        <h3 className="text-xl font-semibold">No Data Yet</h3>
        <p className="mt-2">Add some fencers and bouts to see the leaderboard.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto p-4 md:p-8">
      <div className="bg-secondary shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="border-b-2 border-primary text-left text-gray-300 uppercase text-sm tracking-wider">
              <th className="px-5 py-3 font-semibold">Rank</th>
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold text-right">Points</th>
              <th className="px-5 py-3 font-semibold text-right">Rating</th>
              <th className="px-5 py-3 font-semibold text-right">Wins</th>
              <th className="px-5 py-3 font-semibold text-right">Bouts</th>
              <th className="px-5 py-3 font-semibold text-right">Ref'd</th>
            </tr>
          </thead>
          <tbody>
            {data.map((fencer, index) => (
              <tr key={fencer.id} className="border-b border-primary hover:bg-primary/50 transition-colors duration-200">
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className={`text-lg font-bold ${index < 3 ? 'text-accent' : 'text-gray-400'}`}>
                    {index + 1}
                  </span>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <p className="text-light font-medium">{fencer.name}</p>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-right">
                  <p className="text-light font-semibold">{fencer.points.toFixed(0)}</p>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-right">
                  <p className="text-gray-300">{fencer.rating.toFixed(0)}</p>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-right">
                  <p className="text-gray-300">{fencer.wins}</p>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-right">
                  <p className="text-gray-300">{fencer.bouts}</p>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-right">
                   <p className="text-gray-300">{fencer.refereedBouts}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
