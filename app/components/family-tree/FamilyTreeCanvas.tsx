import { Maximize, Move, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { FC, ReactElement } from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

export interface CanvasNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: React.ReactNode;
  color?: string;
}

export interface CanvasConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  style?: "straight" | "curved" | "stepped";
  color?: string;
  width?: number;
}

interface FamilyTreeCanvasProps {
  className?: string;
  nodes: CanvasNode[];
  connections: CanvasConnection[];
  onNodeMove?: (nodeId: string, x: number, y: number) => void;
  onNodeResize?: (nodeId: string, width: number, height: number) => void;
  onNodeSelect?: (nodeId: string) => void;
  onCanvasClick?: (x: number, y: number) => void;
  selectedNodeId?: string;
  zoom?: number;
  panX?: number;
  panY?: number;
  onZoomChange?: (zoom: number) => void;
  onPanChange?: (x: number, y: number) => void;
  canvasWidth?: number;
  canvasHeight?: number;
  backgroundColor?: string;
  showGridCoordinates?: boolean;
}

export const FamilyTreeCanvas: FC<FamilyTreeCanvasProps> = ({
  className,
  nodes,
  connections,
  onNodeMove,
  onNodeResize,
  onNodeSelect,
  onCanvasClick,
  selectedNodeId,
  zoom = 1,
  panX = 0,
  panY = 0,
  onZoomChange,
  onPanChange,
  canvasWidth = 10000,
  canvasHeight = 8000,
  backgroundColor = "#f8f9fa",
  showGridCoordinates = false,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStartPos, setPanStartPos] = useState({ x: 0, y: 0 });

  // Handle mouse wheel for zooming (with center point)
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      if (!onZoomChange || !onPanChange) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate zoom factor
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(3, zoom * delta));

      // Calculate the point we're zooming towards
      const worldX = (mouseX - panX) / zoom;
      const worldY = (mouseY - panY) / zoom;

      // Calculate new pan to keep the mouse point stable
      const newPanX = mouseX - worldX * newZoom;
      const newPanY = mouseY - worldY * newZoom;

      onZoomChange(newZoom);
      onPanChange(newPanX, newPanY);
    },
    [zoom, panX, panY, onZoomChange, onPanChange],
  );

  // Handle canvas panning (improved)
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only start panning if clicking on the canvas background (not on nodes)
      const target = e.target as Element;
      const isCanvasBackground =
        target === canvasRef.current ||
        target === svgRef.current ||
        target.closest("[data-canvas-background]");

      if (isCanvasBackground) {
        setIsPanning(true);
        setPanStartPos({ x: e.clientX - panX, y: e.clientY - panY });

        // Change cursor to grabbing
        if (canvasRef.current) {
          canvasRef.current.style.cursor = "grabbing";
        }
      }
    },
    [panX, panY],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isPanning && onPanChange) {
        const newPanX = e.clientX - panStartPos.x;
        const newPanY = e.clientY - panStartPos.y;
        onPanChange(newPanX, newPanY);
      }
    },
    [isPanning, panStartPos, onPanChange],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setIsDragging(false);
    setDragNodeId(null);

    // Reset cursor
    if (canvasRef.current) {
      canvasRef.current.style.cursor = "grab";
    }
  }, []);

  // Handle canvas click (for adding nodes or deselecting)
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      // Only trigger if we're clicking on the canvas background
      const target = e.target as Element;
      const isCanvasBackground =
        target === canvasRef.current ||
        target === svgRef.current ||
        target.closest("[data-canvas-background]");

      if (isCanvasBackground && !isPanning && !isDragging && onCanvasClick) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          // Convert screen coordinates to world coordinates
          const worldX = (e.clientX - rect.left - panX) / zoom;
          const worldY = (e.clientY - rect.top - panY) / zoom;
          onCanvasClick(worldX, worldY);
        }
      }
    },
    [isPanning, isDragging, panX, panY, zoom, onCanvasClick],
  );

  // Handle node dragging (improved)
  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation();
      e.preventDefault();

      setIsDragging(true);
      setDragNodeId(nodeId);

      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const node = nodes.find((n) => n.id === nodeId);
        if (node) {
          // Calculate offset from mouse to node position
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          const nodeScreenX = node.x * zoom + panX;
          const nodeScreenY = node.y * zoom + panY;

          setDragStartPos({
            x: mouseX - nodeScreenX,
            y: mouseY - nodeScreenY,
          });
        }
      }

      onNodeSelect?.(nodeId);
    },
    [nodes, zoom, panX, panY, onNodeSelect],
  );

  const handleNodeMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && dragNodeId && onNodeMove && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate new world coordinates
        const newX = (mouseX - dragStartPos.x - panX) / zoom;
        const newY = (mouseY - dragStartPos.y - panY) / zoom;

        // Allow free movement within extended bounds
        // Set generous bounds to allow movement in all directions including negative coordinates
        const minBound = -5000; // Allow movement far into negative space
        const maxBoundX = canvasWidth + 5000; // Extend beyond canvas width
        const maxBoundY = canvasHeight + 5000; // Extend beyond canvas height

        const clampedX = Math.max(minBound, Math.min(maxBoundX, newX));
        const clampedY = Math.max(minBound, Math.min(maxBoundY, newY));

        onNodeMove(dragNodeId, clampedX, clampedY);
      }
    },
    [
      isDragging,
      dragNodeId,
      dragStartPos,
      zoom,
      panX,
      panY,
      onNodeMove,
      canvasWidth,
      canvasHeight,
    ],
  );

  // Add keyboard event listeners for zoom and navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when canvas is focused or no input is focused
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && onZoomChange) {
        switch (e.key) {
          case "=":
          case "+":
            e.preventDefault();
            onZoomChange(Math.min(3, zoom * 1.2));
            break;
          case "-":
            e.preventDefault();
            onZoomChange(Math.max(0.1, zoom * 0.8));
            break;
          case "0":
            e.preventDefault();
            onZoomChange?.(1);
            onPanChange?.(0, 0);
            break;
        }
      }

      // Space bar for pan mode (like Figma)
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        canvasRef.current?.style.setProperty("cursor", "grab");
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        canvasRef.current?.style.setProperty(
          "cursor",
          isPanning ? "grabbing" : "grab",
        );
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [zoom, isPanning, onZoomChange, onPanChange]);

  // Add event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("wheel", handleWheel, { passive: false });
      return () => canvas.removeEventListener("wheel", handleWheel);
    }
  }, [handleWheel]);

  useEffect(() => {
    if (isDragging || isPanning) {
      document.addEventListener(
        "mousemove",
        isDragging ? handleNodeMouseMove : handleMouseMove,
      );
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener(
          "mousemove",
          isDragging ? handleNodeMouseMove : handleMouseMove,
        );
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [
    isDragging,
    isPanning,
    handleNodeMouseMove,
    handleMouseMove,
    handleMouseUp,
  ]);

  // Render connection line between two nodes (memoized)
  const renderConnection = useCallback(
    (connection: CanvasConnection) => {
      const fromNode = nodes.find((n) => n.id === connection.fromNodeId);
      const toNode = nodes.find((n) => n.id === connection.toNodeId);

      if (!fromNode || !toNode) return null;

      const fromX = fromNode.x + fromNode.width / 2;
      const fromY = fromNode.y + fromNode.height / 2;
      const toX = toNode.x + toNode.width / 2;
      const toY = toNode.y + toNode.height / 2;

      const color = connection.color || "#333333";
      // Scale line width based on zoom level: thicker when zoomed in, thinner when zoomed out
      const baseWidth = connection.width || 2;
      const scaledWidth = Math.max(0.5, Math.min(8, baseWidth * zoom));

      switch (connection.style) {
        case "straight":
          return (
            <line
              key={connection.id}
              x1={fromX}
              y1={fromY}
              x2={toX}
              y2={toY}
              stroke={color}
              strokeWidth={scaledWidth}
            />
          );

        case "stepped":
          const midX = (fromX + toX) / 2;
          return (
            <path
              key={connection.id}
              d={`M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX} ${toY}`}
              stroke={color}
              strokeWidth={scaledWidth}
              fill="none"
            />
          );

        case "curved":
        default:
          const controlPointOffset = Math.abs(toY - fromY) * 0.5;
          return (
            <path
              key={connection.id}
              d={`M ${fromX} ${fromY} C ${fromX} ${fromY + controlPointOffset} ${toX} ${toY - controlPointOffset} ${toX} ${toY}`}
              stroke={color}
              strokeWidth={scaledWidth}
              fill="none"
            />
          );
      }
    },
    [nodes, zoom],
  );

  // Memoized zoom handlers
  const handleZoomIn = useCallback(() => {
    onZoomChange?.(Math.min(3, zoom * 1.2));
  }, [onZoomChange, zoom]);

  const handleZoomOut = useCallback(() => {
    onZoomChange?.(Math.max(0.1, zoom * 0.8));
  }, [onZoomChange, zoom]);

  const handleResetView = useCallback(() => {
    if (nodes.length > 0) {
      // Calculate the center of all nodes
      const minX = Math.min(...nodes.map((n) => n.x));
      const minY = Math.min(...nodes.map((n) => n.y));
      const maxX = Math.max(...nodes.map((n) => n.x + n.width));
      const maxY = Math.max(...nodes.map((n) => n.y + n.height));

      const contentCenterX = (minX + maxX) / 2;
      const contentCenterY = (minY + maxY) / 2;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const viewCenterX = rect.width / 2;
      const viewCenterY = rect.height / 2;

      // Set zoom to 1 and pan to center the content
      const newPanX = viewCenterX - contentCenterX;
      const newPanY = viewCenterY - contentCenterY;

      onZoomChange?.(1);
      onPanChange?.(newPanX, newPanY);
    } else {
      // If no nodes, just reset to origin
      onZoomChange?.(1);
      onPanChange?.(0, 0);
    }
  }, [nodes, onZoomChange, onPanChange]);

  // Memoized connections rendering
  const renderedConnections = useMemo(() => {
    return connections.map(renderConnection);
  }, [connections, renderConnection]);

  const handleFitToView = useCallback(() => {
    if (nodes.length > 0) {
      const minX = Math.min(...nodes.map((n) => n.x));
      const minY = Math.min(...nodes.map((n) => n.y));
      const maxX = Math.max(...nodes.map((n) => n.x + n.width));
      const maxY = Math.max(...nodes.map((n) => n.y + n.height));

      const contentWidth = maxX - minX;
      const contentHeight = maxY - minY;
      const padding = 50;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const availableWidth = rect.width - padding * 2;
      const availableHeight = rect.height - padding * 2;

      const scaleX = availableWidth / contentWidth;
      const scaleY = availableHeight / contentHeight;
      const newZoom = Math.min(scaleX, scaleY, 1);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const contentCenterX = minX + contentWidth / 2;
      const contentCenterY = minY + contentHeight / 2;

      const newPanX = centerX - contentCenterX * newZoom;
      const newPanY = centerY - contentCenterY * newZoom;

      onZoomChange?.(newZoom);
      onPanChange?.(newPanX, newPanY);
    }
  }, [nodes, onZoomChange, onPanChange]);

  // Generate grid pattern based on zoom level (optimized)
  const getGridSize = useCallback(() => {
    const baseGridSize = 50; // Base grid size in pixels
    const scaledGridSize = baseGridSize * zoom;

    // Adjust grid size based on zoom level for optimal visibility and performance
    if (scaledGridSize < 5) return baseGridSize * 8; // Much larger grid when zoomed out
    if (scaledGridSize < 10) return baseGridSize * 4;
    if (scaledGridSize > 200) return baseGridSize / 2;
    return baseGridSize;
  }, [zoom]);
  const gridSize = getGridSize();

  // Generate grid coordinates for better navigation (optimized for performance)
  const renderGridCoordinates = useCallback(() => {
    if (!showGridCoordinates || !canvasRef.current) return null;

    const rect = canvasRef.current.getBoundingClientRect();
    const majorGridSize = gridSize * 4; // Show coordinates every 4 grid lines
    const coordinates: ReactElement[] = [];

    // Calculate visible area in world coordinates
    const worldLeft = -panX / zoom;
    const worldTop = -panY / zoom;
    const worldRight = (rect.width - panX) / zoom;
    const worldBottom = (rect.height - panY) / zoom;

    // Calculate grid line positions
    const startX = Math.floor(worldLeft / majorGridSize) * majorGridSize;
    const startY = Math.floor(worldTop / majorGridSize) * majorGridSize;

    // Only show coordinates if zoom is sufficient for readability
    if (zoom < 0.2) return null;

    // Limit the number of coordinates to prevent performance issues
    const maxCoordinates = 50;
    let coordinateCount = 0;

    // Use larger steps when zoomed out to reduce coordinate density
    const step = zoom < 0.5 ? majorGridSize * 2 : majorGridSize;

    for (
      let x = startX;
      x <= worldRight && coordinateCount < maxCoordinates;
      x += step
    ) {
      for (
        let y = startY;
        y <= worldBottom && coordinateCount < maxCoordinates;
        y += step
      ) {
        // Allow coordinates in all quadrants (including negative)
        const screenX = x * zoom + panX;
        const screenY = y * zoom + panY;

        // Only render if coordinate is visible on screen with some margin
        if (
          screenX >= -50 &&
          screenX <= rect.width + 50 &&
          screenY >= -50 &&
          screenY <= rect.height + 50
        ) {
          coordinates.push(
            <div
              key={`coord-${x}-${y}`}
              className="absolute text-xs text-muted-foreground dark:text-gray-400 bg-background/80 dark:bg-gray-800/80 px-1 rounded pointer-events-none select-none"
              style={{
                left: screenX + 4,
                top: screenY + 4,
                fontSize: Math.max(8, 10 * zoom),
                opacity: Math.min(1, zoom * 2), // Fade out when zoomed out
              }}
            >
              {x},{y}
            </div>,
          );
          coordinateCount++;
        }
      }
    }

    return coordinates;
  }, [showGridCoordinates, gridSize, zoom, panX, panY]);

  // Calculate grid offset based on pan position
  const gridOffsetX = panX % (gridSize * zoom);
  const gridOffsetY = panY % (gridSize * zoom);

  return (
    <div
      ref={canvasRef}
      className={cn(
        "relative w-full h-full overflow-hidden select-none",
        isPanning ? "cursor-grabbing" : "cursor-grab",
        className,
      )}
      style={{ backgroundColor }}
      onMouseDown={handleMouseDown}
      onClick={handleCanvasClick}
      data-canvas-background
    >
      {/* Background Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            zoom > 0.1
              ? `
            linear-gradient(to right, rgba(0,0,0,${Math.min(0.1, zoom * 0.15)}) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,${Math.min(0.1, zoom * 0.15)}) 1px, transparent 1px)
          `
              : "none", // Hide grid when zoomed out too much for performance
          backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
          backgroundPosition: `${gridOffsetX}px ${gridOffsetY}px`,
        }}
        data-canvas-background
      />

      {/* Canvas content with zoom and pan transform */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: "0 0",
          width: canvasWidth,
          height: canvasHeight,
        }}
        data-canvas-background
      >
        {/* SVG for connections */}
        <svg
          ref={svgRef}
          className="absolute inset-0 pointer-events-none"
          width={canvasWidth}
          height={canvasHeight}
          data-canvas-background
        >
          {renderedConnections}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <div
            key={node.id}
            className={cn(
              "absolute cursor-move transition-all duration-200",
              selectedNodeId === node.id && "ring-2 ring-primary ring-offset-2",
            )}
            style={{
              left: node.x,
              top: node.y,
              width: node.width,
              height: node.height,
            }}
            onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
          >
            <div className="w-full h-full">{node.content}</div>
          </div>
        ))}
      </div>

      {/* Grid Coordinates Overlay */}
      {showGridCoordinates && renderGridCoordinates()}

      {/* Enhanced Control Panel using shadcn/ui */}
      <TooltipProvider>
        <Card className="absolute bottom-4 right-4 w-48">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="outline" className="h-6 px-2">
                <ZoomIn className="mr-1 h-3 w-3" />
                Controls
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Zoom Controls Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Zoom</span>
                <Badge variant="secondary" className="font-mono">
                  {Math.round(zoom * 100)}%
                </Badge>
              </div>

              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={handleZoomIn}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Zoom In (Ctrl +)</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={handleZoomOut}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Zoom Out (Ctrl -)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <Separator />

            {/* View Controls Section */}
            <div className="space-y-3">
              <span className="text-sm font-medium">View</span>

              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={handleResetView}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Reset View (Ctrl 0)</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={handleFitToView}
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Fit to Screen</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>

      {/* Enhanced Pan Mode Indicator */}
      {isPanning && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <Card className="px-4 py-2">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="h-6 px-2">
                <Move className="mr-1 h-3 w-3" />
                Pan Mode
              </Badge>
              <span className="text-sm text-muted-foreground">
                Release to stop panning
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Enhanced Info Panel using shadcn/ui */}
      <div className="absolute top-4 right-4">
        <Card className="w-64">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-6 px-2">
                <div className="mr-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </Badge>
              <CardTitle className="text-base">Canvas Info</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Content Statistics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Family Members
                </span>
                <Badge variant="secondary">{nodes.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Connections
                </span>
                <Badge variant="secondary">{connections.length}</Badge>
              </div>
            </div>

            <Separator />

            {/* View Information */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Zoom Level
                </span>
                <Badge
                  variant="default"
                  className="bg-primary/10 text-primary hover:bg-primary/20"
                >
                  {Math.round(zoom * 100)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Grid Size</span>
                <Badge variant="outline">{gridSize}px</Badge>
              </div>
            </div>

            <Separator />

            {/* Position Information */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Position X
                </span>
                <Badge variant="outline" className="font-mono text-xs">
                  {Math.round(panX)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Position Y
                </span>
                <Badge variant="outline" className="font-mono text-xs">
                  {Math.round(panY)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
