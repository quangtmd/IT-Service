import React from 'react';

const SkeletonProductCard: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col p-2.5 border border-gray-200">
      <div className="relative overflow-hidden rounded-md">
        <div className="w-full h-40 bg-gray-200 animate-pulse"></div>
      </div>
      <div className="pt-3 px-1 flex flex-col flex-grow">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
        <div className="h-5 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
        <div className="mt-auto">
          <div className="flex flex-col items-start mb-3">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
            <div className="h-7 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-3 animate-pulse"></div>
            <div className="h-9 bg-gray-200 rounded-md w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonProductCard;