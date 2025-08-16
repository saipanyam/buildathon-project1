import React from 'react';
import type { SearchResult } from '../types';
import ImprovedExtractionCard from './ImprovedExtractionCard';

interface ExtractionResultsProps {
  results: SearchResult[];
}

const ExtractionResults: React.FC<ExtractionResultsProps> = ({ results }) => {
  if (results.length === 0) return null;

  return (
    <div className="space-y-8 max-h-screen overflow-y-auto custom-scrollbar pr-2">
      {results.map((result, index) => (
        <ImprovedExtractionCard
          key={result.file_hash}
          result={result}
          index={index + 1}
        />
      ))}
    </div>
  );
};

export default ExtractionResults;