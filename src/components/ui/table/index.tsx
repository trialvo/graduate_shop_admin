import React, { ReactNode } from "react";

// -----------------------------
// Types
// -----------------------------
interface TableProps {
  children: ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
}

interface TableCellProps {
  children: ReactNode;
  isHeader?: boolean;
  className?: string;
}

// -----------------------------
// Helpers
// -----------------------------
const cn = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" ");

// -----------------------------
// Components
// -----------------------------
const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <table
      className={cn(
        "min-w-full border-separate border-spacing-0 text-sm",
        className
      )}
    >
      {children}
    </table>
  );
};

const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return (
    <thead
      className={cn(
        "text-muted-foreground uppercase tracking-wide",
        className
      )}
    >
      {children}
    </thead>
  );
};

const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return <tbody className={cn(className)}>{children}</tbody>;
};

const TableRow: React.FC<TableRowProps> = ({ children, className }) => {
  return <tr className={cn("border-b border-border/60", className)}>{children}</tr>;
};

const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className,
}) => {
  const CellTag = isHeader ? "th" : "td";
  return (
    <CellTag
      className={cn(
        isHeader
          ? "px-4 py-4 text-left font-semibold"
          : "px-4 py-4 text-foreground/90",
        className
      )}
    >
      {children}
    </CellTag>
  );
};

export { Table, TableHeader, TableBody, TableRow, TableCell };
