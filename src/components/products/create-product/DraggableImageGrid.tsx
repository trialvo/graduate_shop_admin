// src/components/products/create-product/DraggableImageGrid.tsx
/**
 * Drag-and-drop + arrow-button image grid for reordering product images.
 *
 * Key design: visual reorder is kept in LOCAL state during a drag.
 * onReorder (→ API call) fires only ONCE when the user releases the card.
 * Arrow / "Set cover" buttons call onReorder immediately (discrete click).
 *
 * Desktop  → grab ⠿ handle, drop anywhere (free-form, any distance)
 * Mobile   → use ‹ › arrow buttons or ★ to jump to position 1
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import {
  GripVertical,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toPublicUrl } from "@/utils/toPublicUrl";
import type { ExistingImage } from "./types";

const ITEM_TYPE = "PRODUCT_IMAGE";
type DragItem = { index: number; id: number };

// ─────────────────────────────────────────────────────────────────────────────
// Single card
// ─────────────────────────────────────────────────────────────────────────────

type ImageCardProps = {
  image: ExistingImage;
  index: number;
  total: number;
  markedForDelete: boolean;
  /** Live swap during drag – updates local state, NO API call */
  onHoverMove: (from: number, to: number) => void;
  /** Called once on drag end – triggers API call in parent */
  onDropEnd: (finalImages: ExistingImage[]) => void;
  /** Get current local order at drop time */
  getCurrentImages: () => ExistingImage[];
  /** Arrow / cover button – discrete, triggers API immediately */
  onDiscreteMove: (from: number, to: number) => void;
  onToggleDelete: (id: number) => void;
};

function ImageCard({
  image,
  index,
  total,
  markedForDelete,
  onHoverMove,
  onDropEnd,
  getCurrentImages,
  onDiscreteMove,
  onToggleDelete,
}: ImageCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  // ── Drag source – fires onDropEnd once when released ──────────────────────
  const [{ isDragging }, drag, preview] = useDrag<
    DragItem,
    void,
    { isDragging: boolean }
  >({
    type: ITEM_TYPE,
    item: { index, id: image.id },
    collect: (m) => ({ isDragging: m.isDragging() }),
    end: () => {
      // Drag finished – push final local order to parent (one API call)
      onDropEnd(getCurrentImages());
    },
  });

  // ── Drop target – updates local state only (no API) ───────────────────────
  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: ITEM_TYPE,
    collect: (m) => ({ isOver: m.isOver() }),
    hover(item) {
      if (item.index === index) return;
      onHoverMove(item.index, index);
      item.index = index;
    },
  });

  drop(preview(ref));

  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-lg border bg-white dark:bg-gray-900 transition-all duration-150",
        markedForDelete
          ? "border-error-300 dark:border-error-900/40 opacity-50"
          : isOver
          ? "border-brand-400 ring-2 ring-brand-300/50"
          : "border-gray-200 dark:border-gray-800",
        isDragging ? "opacity-30 scale-95" : "",
      )}
    >
      {/* Serial badge */}
      {!markedForDelete && (
        <div
          className={cn(
            "absolute top-1 left-1 z-10 rounded px-1.5 py-0.5 text-[10px] font-bold text-white leading-none",
            index === 0 ? "bg-brand-500" : "bg-black/60",
          )}
        >
          {index === 0 ? "Cover" : `#${index + 1}`}
        </div>
      )}

      {/* Drag handle */}
      <div
        ref={drag as unknown as React.Ref<HTMLDivElement>}
        className="absolute top-1 right-1 z-10 cursor-grab active:cursor-grabbing rounded bg-black/50 p-0.5 text-white hover:bg-black/80 transition-colors"
        title="Drag to reorder"
      >
        <GripVertical size={14} />
      </div>

      {/* Image */}
      <div className="aspect-square w-full bg-gray-50 dark:bg-gray-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={toPublicUrl(image.path)}
          alt="product"
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-1 p-1.5">
        {/* ← */}
        <button
          type="button"
          title="Move left"
          disabled={isFirst || markedForDelete}
          onClick={() => onDiscreteMove(index, index - 1)}
          className={cn(
            "flex items-center justify-center rounded border p-1 transition-colors text-gray-600 dark:text-gray-300",
            isFirst || markedForDelete
              ? "opacity-30 cursor-not-allowed border-gray-100 dark:border-gray-800"
              : "border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-white/[0.06]",
          )}
        >
          <ChevronLeft size={13} />
        </button>

        {/* ★ Set as Cover */}
        <button
          type="button"
          title="Set as cover (position 1)"
          disabled={isFirst || markedForDelete}
          onClick={() => onDiscreteMove(index, 0)}
          className={cn(
            "flex flex-1 items-center justify-center rounded border p-1 transition-colors text-[10px] font-semibold gap-0.5",
            isFirst
              ? "border-brand-200 bg-brand-50 text-brand-600 dark:border-brand-900/40 dark:bg-brand-500/10 dark:text-brand-300 cursor-default"
              : markedForDelete
              ? "opacity-30 cursor-not-allowed border-gray-100 dark:border-gray-800 text-gray-400"
              : "border-gray-200 text-gray-600 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-brand-500/10",
          )}
        >
          <Star size={10} />
          {isFirst ? "Cover" : "Set cover"}
        </button>

        {/* → */}
        <button
          type="button"
          title="Move right"
          disabled={isLast || markedForDelete}
          onClick={() => onDiscreteMove(index, index + 1)}
          className={cn(
            "flex items-center justify-center rounded border p-1 transition-colors text-gray-600 dark:text-gray-300",
            isLast || markedForDelete
              ? "opacity-30 cursor-not-allowed border-gray-100 dark:border-gray-800"
              : "border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-white/[0.06]",
          )}
        >
          <ChevronRight size={13} />
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() => onToggleDelete(image.id)}
          title={markedForDelete ? "Undo delete" : "Delete"}
          className={cn(
            "flex items-center justify-center rounded border p-1 transition-colors",
            markedForDelete
              ? "border-error-200 bg-error-50 text-error-600 dark:border-error-900/40 dark:bg-error-500/10 dark:text-error-300"
              : "border-gray-200 text-gray-500 hover:bg-error-50 hover:text-error-600 hover:border-error-200 dark:border-gray-700 dark:text-gray-400",
          )}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Grid — owns local order state during drag; parent is notified once on drop
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  images: ExistingImage[];
  deleteImageIds: number[];
  onReorder: (newImages: ExistingImage[]) => void;
  onToggleDelete: (id: number) => void;
};

export default function DraggableImageGrid({
  images,
  deleteImageIds,
  onReorder,
  onToggleDelete,
}: Props) {
  // Local copy for live visual reorder during drag (no API calls yet)
  const [localImages, setLocalImages] = useState<ExistingImage[]>(images);
  const localRef = useRef<ExistingImage[]>(images);

  // Sync local state when parent's images prop changes (after API response)
  useEffect(() => {
    setLocalImages(images);
    localRef.current = images;
  }, [images]);

  /** During drag: update visual order only — no API */
  const handleHoverMove = useCallback((from: number, to: number) => {
    setLocalImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      localRef.current = next;
      return next;
    });
  }, []);

  /** On drag end: fire onReorder once with the settled order → single API call */
  const handleDropEnd = useCallback(
    (finalImages: ExistingImage[]) => {
      onReorder(finalImages);
    },
    [onReorder],
  );

  const getCurrentImages = useCallback(() => localRef.current, []);

  /** Arrow / cover buttons: discrete click → call onReorder immediately */
  const handleDiscreteMove = useCallback(
    (from: number, to: number) => {
      if (from === to) return;
      const next = [...localRef.current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      localRef.current = next;
      setLocalImages(next);
      onReorder(next);
    },
    [onReorder],
  );

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
        <GripVertical size={12} className="inline" />
        Drag to reorder &middot; use ‹ › buttons on mobile &middot; first image
        is the cover
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {localImages.map((img, idx) => (
          <ImageCard
            key={img.id}
            image={img}
            index={idx}
            total={localImages.length}
            markedForDelete={deleteImageIds.includes(img.id)}
            onHoverMove={handleHoverMove}
            onDropEnd={handleDropEnd}
            getCurrentImages={getCurrentImages}
            onDiscreteMove={handleDiscreteMove}
            onToggleDelete={onToggleDelete}
          />
        ))}
      </div>
    </div>
  );
}
