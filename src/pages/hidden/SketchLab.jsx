import { useEffect, useRef, useState } from "react";
import BrushRoundedIcon from "@mui/icons-material/BrushRounded";
import AutoFixOffRoundedIcon from "@mui/icons-material/AutoFixOffRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import RedoRoundedIcon from "@mui/icons-material/RedoRounded";
import DeleteSweepRoundedIcon from "@mui/icons-material/DeleteSweepRounded";
import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded";
import HorizontalRuleRoundedIcon from "@mui/icons-material/HorizontalRuleRounded";
import RectangleOutlinedIcon from "@mui/icons-material/RectangleOutlined";
import PanoramaFishEyeRoundedIcon from "@mui/icons-material/PanoramaFishEyeRounded";
import NorthEastRoundedIcon from "@mui/icons-material/NorthEastRounded";
import BackHandRoundedIcon from "@mui/icons-material/BackHandRounded";
import FitScreenRoundedIcon from "@mui/icons-material/FitScreenRounded";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import SaveAltRoundedIcon from "@mui/icons-material/SaveAltRounded";
import GridOnRoundedIcon from "@mui/icons-material/GridOnRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Slider,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

const hiddenPath = "/vault/ink-room-7f3a";
const autosaveKey = "sketch-lab-v2";
const defaultSceneSize = { width: 1600, height: 960 };
const presetColors = [
  "#0f172a",
  "#f8fafc",
  "#38bdf8",
  "#14b8a6",
  "#84cc16",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];
const presetBackgrounds = ["#f8fafc", "#fff7ed", "#ecfeff", "#0b1120", "#052e2b"];
const toolOptions = [
  { value: "brush", label: "Brush", icon: <BrushRoundedIcon fontSize="small" /> },
  { value: "eraser", label: "Eraser", icon: <AutoFixOffRoundedIcon fontSize="small" /> },
  { value: "line", label: "Line", icon: <HorizontalRuleRoundedIcon fontSize="small" /> },
  { value: "rectangle", label: "Rect", icon: <RectangleOutlinedIcon fontSize="small" /> },
  { value: "ellipse", label: "Ellipse", icon: <PanoramaFishEyeRoundedIcon fontSize="small" /> },
  { value: "arrow", label: "Arrow", icon: <NorthEastRoundedIcon fontSize="small" /> },
  { value: "hand", label: "Hand", icon: <BackHandRoundedIcon fontSize="small" /> },
];

export const SKETCH_LAB_PATH = hiddenPath;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getDistance = (start, end) => {
  if (!start || !end) return 0;
  return Math.hypot(end.x - start.x, end.y - start.y);
};

const drawStrokePath = (context, points) => {
  if (!points?.length) return;

  if (points.length === 1) {
    context.beginPath();
    context.arc(points[0].x, points[0].y, context.lineWidth / 2, 0, Math.PI * 2);
    context.fillStyle = context.strokeStyle;
    context.fill();
    return;
  }

  context.beginPath();
  context.moveTo(points[0].x, points[0].y);

  for (let index = 1; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const midpointX = (current.x + next.x) / 2;
    const midpointY = (current.y + next.y) / 2;
    context.quadraticCurveTo(current.x, current.y, midpointX, midpointY);
  }

  const lastPoint = points[points.length - 1];
  context.lineTo(lastPoint.x, lastPoint.y);
  context.stroke();
};

const getShapeBounds = (start, end) => ({
  left: Math.min(start.x, end.x),
  top: Math.min(start.y, end.y),
  width: Math.abs(end.x - start.x),
  height: Math.abs(end.y - start.y),
});

const drawArrow = (context, start, end, lineWidth) => {
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const headSize = Math.max(14, lineWidth * 3.2);

  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.stroke();

  context.beginPath();
  context.moveTo(end.x, end.y);
  context.lineTo(
    end.x - headSize * Math.cos(angle - Math.PI / 7),
    end.y - headSize * Math.sin(angle - Math.PI / 7),
  );
  context.moveTo(end.x, end.y);
  context.lineTo(
    end.x - headSize * Math.cos(angle + Math.PI / 7),
    end.y - headSize * Math.sin(angle + Math.PI / 7),
  );
  context.stroke();
};

const paintBackground = (context, sceneSize, backgroundColor) => {
  context.save();
  context.globalCompositeOperation = "source-over";
  context.globalAlpha = 1;
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, sceneSize.width, sceneSize.height);
  context.restore();
};

const drawShape = (context, operation) => {
  const { start, end } = operation;
  if (!start || !end) return;

  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = operation.lineWidth;
  context.strokeStyle = operation.strokeColor;
  context.setLineDash(operation.dashed ? [operation.lineWidth * 2.4, operation.lineWidth * 1.6] : []);
  context.globalAlpha = operation.opacity;

  if (operation.shape === "line") {
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    context.restore();
    return;
  }

  if (operation.shape === "arrow") {
    drawArrow(context, start, end, operation.lineWidth);
    context.restore();
    return;
  }

  const bounds = getShapeBounds(start, end);
  context.beginPath();

  if (operation.shape === "rectangle") {
    context.rect(bounds.left, bounds.top, bounds.width, bounds.height);
  }

  if (operation.shape === "ellipse") {
    context.ellipse(
      bounds.left + bounds.width / 2,
      bounds.top + bounds.height / 2,
      Math.max(bounds.width / 2, 1),
      Math.max(bounds.height / 2, 1),
      0,
      0,
      Math.PI * 2,
    );
  }

  if (operation.filled) {
    context.fillStyle = operation.fillColor;
    context.fill();
  }

  context.stroke();
  context.restore();
};

const drawOperation = ({
  context,
  operation,
  backgroundColor,
  sceneSize,
  imageCacheRef,
  rerender,
}) => {
  if (!context || !operation) return;

  if (operation.type === "clear") {
    paintBackground(context, sceneSize, backgroundColor);
    return;
  }

  if (operation.type === "stroke") {
    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = operation.size;
    context.globalAlpha = operation.opacity;

    if (operation.tool === "eraser") {
      context.globalCompositeOperation = "destination-out";
      context.strokeStyle = "#000000";
    } else {
      context.globalCompositeOperation = "source-over";
      context.strokeStyle = operation.color;
    }

    drawStrokePath(context, operation.points);
    context.restore();
    return;
  }

  if (operation.type === "shape") {
    drawShape(context, operation);
    return;
  }

  if (operation.type === "image" && operation.src) {
    const existing = imageCacheRef.current[operation.src];

    if (existing?.loaded) {
      context.save();
      context.globalAlpha = operation.opacity ?? 1;
      context.drawImage(existing.image, operation.x, operation.y, operation.width, operation.height);
      context.restore();
      return;
    }

    if (!existing) {
      const image = new Image();
      image.onload = () => {
        imageCacheRef.current[operation.src] = { image, loaded: true };
        rerender();
      };
      imageCacheRef.current[operation.src] = { image, loaded: false };
      image.src = operation.src;
    }
  }
};

function SketchLab() {
  const theme = useTheme();
  const viewportRef = useRef(null);
  const boardRef = useRef(null);
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const operationsRef = useRef([]);
  const redoRef = useRef([]);
  const draftRef = useRef(null);
  const imageCacheRef = useRef({});
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const backgroundColorRef = useRef("#f8fafc");
  const sceneSizeRef = useRef(defaultSceneSize);
  const interactionRef = useRef({
    isDrawing: false,
    isPanning: false,
    pointerId: null,
    startPoint: null,
    panStart: null,
    originPan: null,
  });
  const pressedKeysRef = useRef({ space: false });
  const [tool, setTool] = useState("brush");
  const [strokeColor, setStrokeColor] = useState("#38bdf8");
  const [fillColor, setFillColor] = useState("#38bdf8");
  const [strokeSize, setStrokeSize] = useState(8);
  const [shapeSize, setShapeSize] = useState(5);
  const [opacity, setOpacity] = useState(100);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [backgroundColor, setBackgroundColor] = useState("#f8fafc");
  const [showGrid, setShowGrid] = useState(true);
  const [filledShapes, setFilledShapes] = useState(false);
  const [dashedShapes, setDashedShapes] = useState(false);
  const [sceneSize, setSceneSize] = useState(defaultSceneSize);
  const [operations, setOperations] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [canvasReady, setCanvasReady] = useState(false);

  const surfaceColor =
    theme.palette.mode === "dark"
      ? alpha(theme.palette.background.paper, 0.86)
      : alpha("#ffffff", 0.88);
  const stageTexture =
    theme.palette.mode === "dark"
      ? "radial-gradient(circle at 20% 20%, rgba(34,197,94,0.12), transparent 22%), radial-gradient(circle at 80% 0%, rgba(56,189,248,0.16), transparent 24%), linear-gradient(180deg, #041312 0%, #081a19 100%)"
      : "radial-gradient(circle at 18% 18%, rgba(59,130,246,0.12), transparent 24%), radial-gradient(circle at 82% 4%, rgba(20,184,166,0.14), transparent 26%), linear-gradient(180deg, #f7fbff 0%, #eef4ff 100%)";

  const syncHistory = (nextOperations, nextRedo = redoRef.current) => {
    operationsRef.current = nextOperations;
    redoRef.current = nextRedo;
    setOperations(nextOperations);
    setRedoStack(nextRedo);
  };

  const setupCanvasElement = (canvas, width, height) => {
    if (!canvas) return null;

    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    return context;
  };

  const renderScene = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    context.clearRect(0, 0, sceneSizeRef.current.width, sceneSizeRef.current.height);
    paintBackground(context, sceneSizeRef.current, backgroundColorRef.current);

    operationsRef.current.forEach((operation) => {
      drawOperation({
        context,
        operation,
        backgroundColor: backgroundColorRef.current,
        sceneSize: sceneSizeRef.current,
        imageCacheRef,
        rerender: renderScene,
      });
    });
  };

  const renderPreview = () => {
    const previewCanvas = previewCanvasRef.current;
    const previewContext = previewCanvas?.getContext("2d");
    if (!previewCanvas || !previewContext) return;

    previewContext.clearRect(0, 0, sceneSizeRef.current.width, sceneSizeRef.current.height);

    if (!draftRef.current) return;

    drawOperation({
      context: previewContext,
      operation: draftRef.current,
      backgroundColor: backgroundColorRef.current,
      sceneSize: sceneSizeRef.current,
      imageCacheRef,
      rerender: renderPreview,
    });
  };

  const fitToViewport = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    const padding = 48;
    const nextZoom = clamp(
      Math.min(
        (rect.width - padding) / sceneSizeRef.current.width,
        (rect.height - padding) / sceneSizeRef.current.height,
      ),
      0.35,
      1.8,
    );
    const nextPan = {
      x: (rect.width - sceneSizeRef.current.width * nextZoom) / 2,
      y: (rect.height - sceneSizeRef.current.height * nextZoom) / 2,
    };

    zoomRef.current = nextZoom;
    panRef.current = nextPan;
    setZoom(nextZoom);
    setPan(nextPan);
  };

  const resetWorkspace = () => {
    syncHistory([], []);
    draftRef.current = null;
    renderPreview();
    renderScene();
  };

  const commitOperation = (operation) => {
    if (!operation) return;

    const nextOperations = [...operationsRef.current, operation];
    syncHistory(nextOperations, []);
    draftRef.current = null;
    renderPreview();
  };

  const getPointerPoint = (event) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * sceneSizeRef.current.width, 0, sceneSizeRef.current.width),
      y: clamp(
        ((event.clientY - rect.top) / rect.height) * sceneSizeRef.current.height,
        0,
        sceneSizeRef.current.height,
      ),
    };
  };

  const beginPan = (event) => {
    interactionRef.current.isPanning = true;
    interactionRef.current.pointerId = event.pointerId;
    interactionRef.current.panStart = { x: event.clientX, y: event.clientY };
    interactionRef.current.originPan = { ...panRef.current };
  };

  const finishInteraction = () => {
    interactionRef.current.isDrawing = false;
    interactionRef.current.isPanning = false;
    interactionRef.current.pointerId = null;
    interactionRef.current.startPoint = null;
    interactionRef.current.panStart = null;
    interactionRef.current.originPan = null;
    draftRef.current = null;
    renderPreview();
  };

  const handlePointerDown = (event) => {
    if (!canvasReady || event.button === 2) return;

    event.currentTarget.setPointerCapture(event.pointerId);

    if (tool === "hand" || pressedKeysRef.current.space || event.button === 1) {
      beginPan(event);
      return;
    }

    const point = getPointerPoint(event);
    if (!point) return;

    interactionRef.current.isDrawing = true;
    interactionRef.current.pointerId = event.pointerId;
    interactionRef.current.startPoint = point;

    if (tool === "brush" || tool === "eraser") {
      draftRef.current = {
        id: createId(),
        type: "stroke",
        tool,
        color: strokeColor,
        size: strokeSize,
        opacity: opacity / 100,
        points: [point],
      };
    } else {
      draftRef.current = {
        id: createId(),
        type: "shape",
        shape: tool,
        start: point,
        end: point,
        strokeColor,
        fillColor,
        lineWidth: shapeSize,
        opacity: opacity / 100,
        filled: filledShapes,
        dashed: dashedShapes,
      };
    }

    renderPreview();
  };

  const handlePointerMove = (event) => {
    if (interactionRef.current.isPanning && interactionRef.current.panStart) {
      const nextPan = {
        x: interactionRef.current.originPan.x + (event.clientX - interactionRef.current.panStart.x),
        y: interactionRef.current.originPan.y + (event.clientY - interactionRef.current.panStart.y),
      };

      panRef.current = nextPan;
      setPan(nextPan);
      return;
    }

    if (!interactionRef.current.isDrawing || !draftRef.current) return;

    const point = getPointerPoint(event);
    if (!point) return;

    if (draftRef.current.type === "stroke") {
      const points = draftRef.current.points;
      const lastPoint = points[points.length - 1];
      if (getDistance(lastPoint, point) >= 0.8) {
        draftRef.current = { ...draftRef.current, points: [...points, point] };
      }
    } else {
      draftRef.current = { ...draftRef.current, end: point };
    }

    renderPreview();
  };

  const handlePointerUp = (event) => {
    if (interactionRef.current.pointerId !== event.pointerId) {
      return;
    }

    if (interactionRef.current.isPanning) {
      finishInteraction();
      return;
    }

    if (!interactionRef.current.isDrawing || !draftRef.current) {
      finishInteraction();
      return;
    }

    const currentDraft = draftRef.current;

    if (currentDraft.type === "stroke") {
      commitOperation(currentDraft);
    } else if (getDistance(currentDraft.start, currentDraft.end) >= 1) {
      commitOperation(currentDraft);
    } else {
      draftRef.current = null;
      renderPreview();
    }

    interactionRef.current.isDrawing = false;
    interactionRef.current.pointerId = null;
    interactionRef.current.startPoint = null;
  };

  const handleUndo = () => {
    if (!operationsRef.current.length) return;

    const nextOperations = operationsRef.current.slice(0, -1);
    const poppedOperation = operationsRef.current[operationsRef.current.length - 1];
    const nextRedo = [...redoRef.current, poppedOperation];
    syncHistory(nextOperations, nextRedo);
  };

  const handleRedo = () => {
    if (!redoRef.current.length) return;

    const nextOperation = redoRef.current[redoRef.current.length - 1];
    const nextRedo = redoRef.current.slice(0, -1);
    syncHistory([...operationsRef.current, nextOperation], nextRedo);
  };

  const handleClear = () => {
    commitOperation({
      id: createId(),
      type: "clear",
    });
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    renderScene();
    const link = document.createElement("a");
    link.download = `sketch-lab-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleImportImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result;
      if (typeof src !== "string") return;

      const image = new Image();
      image.onload = () => {
        const maxWidth = sceneSizeRef.current.width * 0.7;
        const maxHeight = sceneSizeRef.current.height * 0.7;
        const ratio = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
        const width = image.width * ratio;
        const height = image.height * ratio;

        commitOperation({
          id: createId(),
          type: "image",
          src,
          x: (sceneSizeRef.current.width - width) / 2,
          y: (sceneSizeRef.current.height - height) / 2,
          width,
          height,
          opacity: opacity / 100,
        });
      };
      image.src = src;
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(autosaveKey);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.operations)) {
        operationsRef.current = parsed.operations;
        setOperations(parsed.operations);
      }
      if (parsed.strokeColor) setStrokeColor(parsed.strokeColor);
      if (parsed.fillColor) setFillColor(parsed.fillColor);
      if (parsed.backgroundColor) {
        backgroundColorRef.current = parsed.backgroundColor;
        setBackgroundColor(parsed.backgroundColor);
      }
      if (typeof parsed.strokeSize === "number") setStrokeSize(parsed.strokeSize);
      if (typeof parsed.shapeSize === "number") setShapeSize(parsed.shapeSize);
      if (typeof parsed.opacity === "number") setOpacity(parsed.opacity);
      if (typeof parsed.showGrid === "boolean") setShowGrid(parsed.showGrid);
      if (typeof parsed.filledShapes === "boolean") setFilledShapes(parsed.filledShapes);
      if (typeof parsed.dashedShapes === "boolean") setDashedShapes(parsed.dashedShapes);
      if (parsed.sceneSize?.width && parsed.sceneSize?.height) {
        sceneSizeRef.current = parsed.sceneSize;
        setSceneSize(parsed.sceneSize);
      }
    } catch {
      window.localStorage.removeItem(autosaveKey);
    }
  }, []);

  useEffect(() => {
    backgroundColorRef.current = backgroundColor;
    sceneSizeRef.current = sceneSize;

    setupCanvasElement(canvasRef.current, sceneSize.width, sceneSize.height);
    setupCanvasElement(previewCanvasRef.current, sceneSize.width, sceneSize.height);
    renderScene();
    renderPreview();
    setCanvasReady(true);
  }, [backgroundColor, sceneSize]);

  useEffect(() => {
    renderScene();
  }, [operations]);

  useEffect(() => {
    zoomRef.current = zoom;
    panRef.current = pan;
  }, [zoom, pan]);

  useEffect(() => {
    const savePayload = {
      operations,
      strokeColor,
      fillColor,
      backgroundColor,
      strokeSize,
      shapeSize,
      opacity,
      showGrid,
      filledShapes,
      dashedShapes,
      sceneSize,
    };

    window.localStorage.setItem(autosaveKey, JSON.stringify(savePayload));
  }, [
    operations,
    strokeColor,
    fillColor,
    backgroundColor,
    strokeSize,
    shapeSize,
    opacity,
    showGrid,
    filledShapes,
    dashedShapes,
    sceneSize,
  ]);

  useEffect(() => {
    const handleResize = () => {
      renderScene();
      renderPreview();
      fitToViewport();
    };

    const timer = window.setTimeout(() => {
      fitToViewport();
    }, 60);

    window.addEventListener("resize", handleResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "Space") {
        pressedKeysRef.current.space = true;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && event.shiftKey) {
        event.preventDefault();
        handleRedo();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        handleUndo();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        handleRedo();
      } else if (event.key.toLowerCase() === "b") {
        setTool("brush");
      } else if (event.key.toLowerCase() === "e") {
        setTool("eraser");
      } else if (event.key.toLowerCase() === "h") {
        setTool("hand");
      } else if (event.key.toLowerCase() === "l") {
        setTool("line");
      } else if (event.key.toLowerCase() === "r") {
        setTool("rectangle");
      } else if (event.key.toLowerCase() === "o") {
        setTool("ellipse");
      } else if (event.key.toLowerCase() === "a") {
        setTool("arrow");
      }
    };

    const handleKeyUp = (event) => {
      if (event.code === "Space") {
        pressedKeysRef.current.space = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleWheel = (event) => {
    if (!(event.ctrlKey || event.metaKey)) return;

    event.preventDefault();
    const viewport = viewportRef.current;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    const focusX = event.clientX - rect.left;
    const focusY = event.clientY - rect.top;
    const currentZoom = zoomRef.current;
    const nextZoom = clamp(currentZoom * (event.deltaY > 0 ? 0.92 : 1.08), 0.25, 3);
    const sceneX = (focusX - panRef.current.x) / currentZoom;
    const sceneY = (focusY - panRef.current.y) / currentZoom;
    const nextPan = {
      x: focusX - sceneX * nextZoom,
      y: focusY - sceneY * nextZoom,
    };

    zoomRef.current = nextZoom;
    panRef.current = nextPan;
    setZoom(nextZoom);
    setPan(nextPan);
  };

  const setQuickZoom = (nextZoom) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    const sceneCenter = {
      x: sceneSize.width / 2,
      y: sceneSize.height / 2,
    };
    const nextPan = {
      x: rect.width / 2 - sceneCenter.x * nextZoom,
      y: rect.height / 2 - sceneCenter.y * nextZoom,
    };

    zoomRef.current = nextZoom;
    panRef.current = nextPan;
    setZoom(nextZoom);
    setPan(nextPan);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 3 },
        background: stageTexture,
      }}
    >
      <Stack spacing={2.5}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: alpha(theme.palette.divider, 1),
            bgcolor: surfaceColor,
            backdropFilter: "blur(16px)",
          }}
        >
          <Stack spacing={2.2}>
            <Stack
              direction={{ xs: "column", xl: "row" }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 800 }}>
                  Hidden Workspace
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: "-0.05em" }}>
                  Sketch Lab Pro
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.8, maxWidth: 840 }}>
                  A full artboard with smooth brush strokes, shape tools, zoom and pan,
                  autosave, redo, image import, background presets, and canvas export.
                  Hold <strong>Space</strong> to pan, use <strong>Ctrl/Cmd + Wheel</strong> to zoom,
                  and use keyboard shortcuts like <strong>B</strong>, <strong>E</strong>, <strong>R</strong>, and <strong>A</strong>.
                </Typography>
              </Box>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} useFlexGap flexWrap="wrap">
                <Chip
                  label={hiddenPath}
                  sx={{
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    color: "primary.main",
                  }}
                />
                <Chip
                  label={`${sceneSize.width} x ${sceneSize.height}`}
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
                <Chip
                  label={`${Math.round(zoom * 100)}% zoom`}
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              </Stack>
            </Stack>

            <Divider />

            <Stack direction={{ xs: "column", xl: "row" }} spacing={2}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.4,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  minWidth: { xl: 350 },
                  bgcolor: alpha(theme.palette.background.paper, 0.55),
                }}
              >
                <Stack spacing={1.35}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Tools
                  </Typography>
                  <ToggleButtonGroup
                    value={tool}
                    exclusive
                    fullWidth
                    onChange={(_, nextValue) => nextValue && setTool(nextValue)}
                    color="primary"
                    sx={{
                      flexWrap: "wrap",
                      justifyContent: "flex-start",
                      "& .MuiToggleButton-root": {
                        px: 1.25,
                        py: 1,
                        gap: 0.8,
                      },
                    }}
                  >
                    {toolOptions.map((option) => (
                      <ToggleButton key={option.value} value={option.value}>
                        {option.icon}
                        {option.label}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>

                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Button variant="outlined" startIcon={<UndoRoundedIcon />} onClick={handleUndo} disabled={!operations.length}>
                      Undo
                    </Button>
                    <Button variant="outlined" startIcon={<RedoRoundedIcon />} onClick={handleRedo} disabled={!redoStack.length}>
                      Redo
                    </Button>
                    <Button variant="outlined" color="warning" startIcon={<DeleteSweepRoundedIcon />} onClick={handleClear} disabled={!operations.length}>
                      Clear Layer
                    </Button>
                  </Stack>
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 1.4,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  flex: 1,
                  bgcolor: alpha(theme.palette.background.paper, 0.55),
                }}
              >
                <Stack spacing={1.4}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Color and Stroke
                  </Typography>

                  <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
                    <Stack spacing={1} sx={{ minWidth: { lg: 280 } }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PaletteRoundedIcon color="primary" />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          Presets
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {presetColors.map((color) => (
                          <Tooltip key={color} title={color}>
                            <Box
                              component="button"
                              type="button"
                              onClick={() => {
                                setStrokeColor(color);
                                if (!filledShapes) setFillColor(color);
                              }}
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                border: "3px solid",
                                borderColor:
                                  strokeColor === color
                                    ? "primary.main"
                                    : alpha(theme.palette.common.white, 0.7),
                                bgcolor: color,
                                cursor: "pointer",
                              }}
                            />
                          </Tooltip>
                        ))}
                      </Stack>
                    </Stack>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ flex: 1 }}>
                      <TextField
                        label="Stroke"
                        value={strokeColor}
                        onChange={(event) => setStrokeColor(event.target.value)}
                        InputProps={{
                          startAdornment: (
                            <Box
                              sx={{
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                bgcolor: strokeColor,
                                border: "1px solid",
                                borderColor: "divider",
                                mr: 1,
                              }}
                            />
                          ),
                        }}
                        fullWidth
                      />
                      <TextField
                        label="Fill"
                        value={fillColor}
                        onChange={(event) => setFillColor(event.target.value)}
                        InputProps={{
                          startAdornment: (
                            <Box
                              sx={{
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                bgcolor: fillColor,
                                border: "1px solid",
                                borderColor: "divider",
                                mr: 1,
                              }}
                            />
                          ),
                        }}
                        fullWidth
                      />
                    </Stack>
                  </Stack>

                  <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Brush Size
                      </Typography>
                      <Slider value={strokeSize} min={1} max={36} onChange={(_, value) => setStrokeSize(value)} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Shape Stroke
                      </Typography>
                      <Slider value={shapeSize} min={1} max={28} onChange={(_, value) => setShapeSize(value)} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Opacity
                      </Typography>
                      <Slider value={opacity} min={10} max={100} onChange={(_, value) => setOpacity(value)} />
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Switch checked={filledShapes} onChange={(event) => setFilledShapes(event.target.checked)} />
                      <Typography variant="body2">Fill shapes</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Switch checked={dashedShapes} onChange={(event) => setDashedShapes(event.target.checked)} />
                      <Typography variant="body2">Dashed shapes</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Switch checked={showGrid} onChange={(event) => setShowGrid(event.target.checked)} />
                      <Typography variant="body2">Grid overlay</Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 1.4,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  minWidth: { xl: 320 },
                  bgcolor: alpha(theme.palette.background.paper, 0.55),
                }}
              >
                <Stack spacing={1.35}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Workspace
                  </Typography>

                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Button variant="contained" startIcon={<DownloadRoundedIcon />} onClick={handleDownload}>
                      Export PNG
                    </Button>
                    <Button variant="outlined" startIcon={<AddPhotoAlternateRoundedIcon />} onClick={() => fileInputRef.current?.click()}>
                      Import Image
                    </Button>
                    <Button variant="outlined" startIcon={<FitScreenRoundedIcon />} onClick={fitToViewport}>
                      Fit View
                    </Button>
                  </Stack>

                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Button variant="outlined" startIcon={<SaveAltRoundedIcon />} onClick={() => window.localStorage.setItem(autosaveKey, window.localStorage.getItem(autosaveKey) || "")}>
                      Save Snapshot
                    </Button>
                    <Button variant="outlined" startIcon={<RestartAltRoundedIcon />} onClick={resetWorkspace}>
                      Reset Board
                    </Button>
                    <Button variant="outlined" startIcon={<GridOnRoundedIcon />} onClick={() => setQuickZoom(clamp(zoom + 0.15, 0.25, 3))}>
                      Zoom In
                    </Button>
                  </Stack>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                    <TextField
                      label="Width"
                      type="number"
                      value={sceneSize.width}
                      onChange={(event) =>
                        setSceneSize((current) => ({
                          ...current,
                          width: clamp(Number(event.target.value) || defaultSceneSize.width, 600, 3200),
                        }))
                      }
                      fullWidth
                    />
                    <TextField
                      label="Height"
                      type="number"
                      value={sceneSize.height}
                      onChange={(event) =>
                        setSceneSize((current) => ({
                          ...current,
                          height: clamp(Number(event.target.value) || defaultSceneSize.height, 420, 2400),
                        }))
                      }
                      fullWidth
                    />
                  </Stack>

                  <Stack spacing={0.9}>
                    <Typography variant="caption" color="text.secondary">
                      Artboard Background
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {presetBackgrounds.map((color) => (
                        <Tooltip key={color} title={color}>
                          <Box
                            component="button"
                            type="button"
                            onClick={() => setBackgroundColor(color)}
                            sx={{
                              width: 30,
                              height: 30,
                              borderRadius: 2,
                              border: "2px solid",
                              borderColor:
                                backgroundColor === color
                                  ? "primary.main"
                                  : alpha(theme.palette.text.primary, 0.14),
                              bgcolor: color,
                              cursor: "pointer",
                            }}
                          />
                        </Tooltip>
                      ))}
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>
            </Stack>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 4,
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.2),
            bgcolor: surfaceColor,
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 26px 70px rgba(0, 0, 0, 0.34)"
                : "0 28px 70px rgba(15, 23, 42, 0.08)",
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            spacing={1.5}
            sx={{ px: 0.5, pb: 1.5 }}
          >
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip label={`Objects: ${operations.filter((item) => item.type !== "clear").length}`} />
              <Chip label={`Redo: ${redoStack.length}`} variant="outlined" />
              <Chip label={`Mode: ${tool}`} variant="outlined" />
            </Stack>

            <Typography variant="body2" color="text.secondary">
              The board autosaves in your browser, so reloading this hidden page keeps your latest sketch.
            </Typography>
          </Stack>

          <Box
            ref={viewportRef}
            onWheel={handleWheel}
            sx={{
              position: "relative",
              overflow: "hidden",
              minHeight: { xs: 500, md: 700 },
              borderRadius: 3,
              border: "1px solid",
              borderColor: alpha(theme.palette.divider, 1),
              bgcolor: theme.palette.mode === "dark" ? "#051311" : "#edf4ff",
              backgroundImage:
                theme.palette.mode === "dark"
                  ? "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.04), transparent 0), linear-gradient(180deg, rgba(15,23,42,0.28), rgba(0,0,0,0.15))"
                  : "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.7), transparent 0), linear-gradient(180deg, rgba(255,255,255,0.5), rgba(226,232,240,0.55))",
            }}
          >
            <Box
              ref={boardRef}
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                width: sceneSize.width,
                height: sceneSize.height,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "top left",
                borderRadius: 2.5,
                boxShadow:
                  theme.palette.mode === "dark"
                    ? "0 24px 50px rgba(0,0,0,0.34)"
                    : "0 20px 50px rgba(15,23,42,0.12)",
              }}
            >
              <Box
                component="canvas"
                ref={canvasRef}
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "block",
                  borderRadius: 2.5,
                  backgroundColor,
                  backgroundImage: showGrid
                    ? theme.palette.mode === "dark"
                      ? "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)"
                      : "linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)"
                    : "none",
                  backgroundSize: "32px 32px",
                }}
              />
              <Box
                component="canvas"
                ref={previewCanvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "block",
                  borderRadius: 2.5,
                  touchAction: "none",
                  cursor:
                    tool === "hand" || pressedKeysRef.current.space
                      ? "grab"
                      : tool === "eraser"
                        ? "cell"
                        : "crosshair",
                }}
              />
            </Box>
          </Box>
        </Paper>
      </Stack>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleImportImage}
      />
    </Box>
  );
}

export default SketchLab;
