import React from 'react';
import Button from '../ui/Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  
  const pageNumbers = [];
  const maxPagesToShow = 5; 

  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    if (currentPage < (totalPages / 2)) {
        endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    } else {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav aria-label="Phân trang" className="flex justify-center items-center space-x-2 mt-10">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        variant="outline"
        size="sm"
        aria-label="Trang trước"
        className="text-textMuted border-borderDefault hover:bg-bgMuted" 
      >
        <i className="fas fa-chevron-left"></i>
      </Button>

      {startPage > 1 && (
        <>
          <Button onClick={() => onPageChange(1)} variant='outline' size="sm" className={"text-textMuted border-borderDefault hover:bg-bgMuted"}>1</Button>
          {startPage > 2 && <span className="text-textSubtle px-1">...</span>}
        </>
      )}

      {pageNumbers.map(number => (
        <Button
          key={number}
          onClick={() => onPageChange(number)}
          variant={number === currentPage ? 'primary' : 'outline'}
          size="sm"
          aria-current={number === currentPage ? 'page' : undefined}
          className={number !== currentPage ? "text-textMuted border-borderDefault hover:bg-bgMuted" : ""}
        >
          {number}
        </Button>
      ))}
      
      {endPage < totalPages && (
         <>
          {endPage < totalPages - 1 && <span className="text-textSubtle px-1">...</span>}
          <Button onClick={() => onPageChange(totalPages)} variant='outline' size="sm" className={"text-textMuted border-borderDefault hover:bg-bgMuted"}>
            {totalPages}
          </Button>
        </>
      )}

      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="outline"
        size="sm"
        aria-label="Trang sau"
        className="text-textMuted border-borderDefault hover:bg-bgMuted"
      >
        <i className="fas fa-chevron-right"></i>
      </Button>
    </nav>
  );
};

export default Pagination;