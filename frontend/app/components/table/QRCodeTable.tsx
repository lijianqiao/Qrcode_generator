import { Box, TextField, useTheme } from '@mui/material';
import React, { useState, useRef, useEffect } from 'react';
import { TableToolbar } from './TableToolbar';
import { QRCodeData } from '@/app/types/api';

interface QRCodeTableProps<T> {
  data: T[];
  columns: {
    id: string;
    header: string;
    accessor: (row: T) => string;
    editable?: boolean;
  }[];
  selectedRow: T | null;
  onRowSelect: (row: T) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onKeyNavigation: (e: React.KeyboardEvent) => void;
  onRowChange?: (rowId: string, field: string, value: string) => void;
  showGenerateQRCode?: boolean;
  onGenerateQRCode?: () => Promise<void>;
  isGeneratingQRCode?: boolean;
  selectedColumn?: string;
  selectedLabelColumn?: string;
  showReupload?: boolean;
  onReupload?: () => void;
  qrCodesData?: Record<string, QRCodeData>;
}

interface EditingCell {
  rowId: string;
  field: string;
}

export function QRCodeTable<T extends { id: string }>({
  data,
  columns,
  selectedRow,
  onRowSelect,
  searchTerm,
  onSearchChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onKeyNavigation,
  onRowChange,
  showGenerateQRCode = false,
  onGenerateQRCode,
  isGeneratingQRCode = false,
  selectedColumn,
  selectedLabelColumn,
  showReupload = false,
  onReupload,
  qrCodesData,
}: QRCodeTableProps<T>) {
  const theme = useTheme();
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);

  // 当选择行变化时，确保表格容器获得焦点
  useEffect(() => {
    if (selectedRow) {
      gridRef.current?.focus();
    }
  }, [selectedRow]);

  // 处理双击编辑
  const handleDoubleClick = (row: T, column: typeof columns[0]) => {
    if (!column.editable) return;
    setEditingCell({ rowId: row.id, field: column.id });
    setEditValue(column.accessor(row));
  };

  // 处理编辑完成
  const handleEditComplete = () => {
    if (editingCell && onRowChange) {
      onRowChange(editingCell.rowId, editingCell.field, editValue);
      setEditingCell(null);
      setEditValue('');
    }
  };

  // 处理编辑取消
  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // 过滤显示的列
  const visibleColumns = columns.filter(column => {
    if (!selectedColumn) return true;
    return column.id === selectedColumn || column.id === selectedLabelColumn;
  });

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <TableToolbar
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={onUndo}
        onRedo={onRedo}
        showGenerateQRCode={showGenerateQRCode}
        onGenerateQRCode={onGenerateQRCode}
        isGeneratingQRCode={isGeneratingQRCode}
        selectedColumn={selectedColumn}
        selectedLabelColumn={selectedLabelColumn}
        showReupload={showReupload}
        onReupload={onReupload}
        qrCodesData={qrCodesData}
      />
      
      <Box 
        component="div"
        role="grid"
        ref={gridRef}
        sx={{ 
          height: 400, 
          width: '100%', 
          overflow: 'auto',
          position: 'relative',
          outline: 'none',
          '&:focus': {
            outline: 'none',
            boxShadow: `inset 0 0 0 1px ${theme.palette.primary.main}15`,
          },
        }}
        tabIndex={0}
        onKeyDown={(e) => {
          if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
            e.preventDefault();
            e.stopPropagation();
            onKeyNavigation(e);
            
            // 如果有选中的行，确保它在视野内
            if (selectedRow) {
              const selectedElement = document.querySelector(`tr[data-row-id="${selectedRow.id}"]`);
              selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
          }
        }}
        onClick={() => {
          gridRef.current?.focus();
        }}
      >
        <table 
          style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
          }}
          role="presentation"
        >
          <thead>
            <tr role="row">
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  role="columnheader"
                  style={{
                    padding: '12px 16px',
                    background: theme.palette.grey[50],
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    textAlign: 'left',
                    color: theme.palette.text.secondary,
                    fontWeight: 600,
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.id}
                role="row"
                data-row-id={row.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRowSelect(row);
                }}
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedRow === row ? theme.palette.action.selected : 'white',
                }}
                tabIndex={-1}
              >
                {visibleColumns.map((column) => (
                  <td
                    key={`${row.id}-${column.id}`}
                    role="gridcell"
                    onDoubleClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDoubleClick(row, column);
                    }}
                    style={{
                      padding: '12px 16px',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      cursor: column.editable ? 'text' : 'pointer',
                    }}
                  >
                    {editingCell?.rowId === row.id && editingCell.field === column.id ? (
                      <TextField
                        size="small"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleEditComplete}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleEditComplete();
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            handleEditCancel();
                          }
                          // 阻止事件冒泡，避免触发表格的键盘导航
                          e.stopPropagation();
                        }}
                        autoFocus
                        fullWidth
                        variant="standard"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      />
                    ) : (
                      column.accessor(row)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
} 