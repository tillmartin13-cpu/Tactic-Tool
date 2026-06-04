import { useState, type ReactNode } from 'react';
import { PHOTOGRAPHER_DRAG_TYPE } from '../../lib/photographers';

interface SpotDropTargetProps {
  spotId: string;
  canDrop: boolean;
  onDropPhotographer: (spotId: string, photographerId: string) => void;
  children: ReactNode;
  className?: string;
}

export function SpotDropTarget({
  spotId,
  canDrop,
  onDropPhotographer,
  children,
  className = '',
}: SpotDropTargetProps) {
  const [over, setOver] = useState(false);

  if (!canDrop) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={`${className} ${over ? 'rounded-md ring-2 ring-navy ring-offset-1' : ''}`}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes(PHOTOGRAPHER_DRAG_TYPE)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData(PHOTOGRAPHER_DRAG_TYPE);
        if (id) onDropPhotographer(spotId, id);
      }}
    >
      {children}
    </div>
  );
}
