import React from 'react';
import Button from '../ui/Button';

interface BackendConnectionErrorProps {
  error?: string | null;
}

const BackendConnectionError: React.FC<BackendConnectionErrorProps> = ({ error }) => {
  return (
    <div className="py-10 px-4 bg-red-50 text-red-800 rounded-lg border border-red-200 my-4 max-w-4xl mx-auto shadow-md">
      <div className="flex items-start gap-4">
        <i className="fas fa-server text-4xl text-red-400 mt-1"></i>
        <div>
          <h3 className="text-xl font-bold text-red-900 mb-2">Lỗi Kết Nối Đến Máy Chủ (Backend)</h3>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <Button 
            variant="outline" 
            className="border-red-300 text-red-700 hover:bg-red-100 mt-6"
            onClick={() => window.location.reload()}
          >
            <i className="fas fa-sync-alt mr-2"></i> Thử Lại
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BackendConnectionError;