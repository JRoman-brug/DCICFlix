import { useEffect, useRef, type CSSProperties } from "react";

// 1. Definimos la forma de nuestros objetos "Punto"
interface Point {
  x: number;
  y: number;
  vx: number; // Velocidad X
  vy: number; // Velocidad Y
  buddy?: Point; // Referencia opcional al siguiente punto (puede no existir al inicio)
}

export default function LoaderCanvas() {
  // 2. Tipamos el Ref como un elemento HTMLCanvasElement
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let animationFrameId: number;

    // --- Configuración ---
    let points: Point[] = [];
    const velocity2 = 5;
    const radius = 5;
    const boundaryX = 200;
    const boundaryY = 200;
    const numberOfPoints = 20;

    // --- Lógica Matemática ---

    function createPoint() {
      // Calculamos valores primero
      const x = Math.random() * boundaryX;
      const y = Math.random() * boundaryY;

      const vx = (Math.floor(Math.random()) * 2 - 1) * Math.random();
      const vx2 = Math.pow(vx, 2);

      const vy2 = velocity2 - vx2;
      // Math.sqrt puede devolver NaN si es negativo, aseguramos con valor absoluto o validación
      const vy = Math.sqrt(Math.abs(vy2)) * (Math.random() * 2 - 1);

      // Creamos el objeto con la interfaz Point
      const point: Point = { x, y, vx, vy };
      points.push(point);
    }

    function resetVelocity(point: Point, axis: "x" | "y", dir: number) {
      let vx2, vy2;

      if (axis === "x") {
        point.vx = dir * Math.random();
        vx2 = Math.pow(point.vx, 2);
        vy2 = velocity2 - vx2;
        point.vy = Math.sqrt(Math.abs(vy2)) * (Math.random() * 2 - 1);
      } else {
        point.vy = dir * Math.random();
        vy2 = Math.pow(point.vy, 2);
        vx2 = velocity2 - vy2;
        point.vx = Math.sqrt(Math.abs(vx2)) * (Math.random() * 2 - 1);
      }
    }

    // --- Lógica de Dibujo ---

    function drawCircle(x: number, y: number) {
      if (!context) return;
      context.beginPath();
      context.arc(x, y, radius, 0, 2 * Math.PI, false);
      context.fillStyle = "#db202c";
      context.fill();
    }

    function drawLine(x1: number, y1: number, x2: number, y2: number) {
      if (!context) return;
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.strokeStyle = "#db202c";
      context.stroke();
    }

    function draw() {
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        point.x += point.vx;
        point.y += point.vy;

        drawCircle(point.x, point.y);

        // TypeScript nos pide verificar que 'buddy' exista antes de usarlo
        if (point.buddy) {
          drawLine(point.x, point.y, point.buddy.x, point.buddy.y);
        }

        // Rebote en los bordes
        if (point.x < 0 + radius) {
          resetVelocity(point, "x", 1);
        } else if (point.x > boundaryX - radius) {
          resetVelocity(point, "x", -1);
        } else if (point.y < 0 + radius) {
          resetVelocity(point, "y", 1);
        } else if (point.y > boundaryY - radius) {
          resetVelocity(point, "y", -1);
        }
      }
    }

    function init() {
      points = [];
      for (let i = 0; i < numberOfPoints; i++) {
        createPoint();
      }

      // Asignar los compañeros (buddies)
      for (let i = 0; i < points.length; i++) {
        if (i === 0) {
          points[i].buddy = points[points.length - 1];
        } else {
          points[i].buddy = points[i - 1];
        }
      }
    }

    function animate() {
      if (!context) return;
      context.clearRect(0, 0, boundaryX, boundaryY);
      draw();
      animationFrameId = requestAnimationFrame(animate);
    }

    // Arrancar
    init();
    animate();

    // Limpieza al desmontar
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Tipado de estilos CSS
  const containerStyle: CSSProperties = {
    position: "absolute",
    width: "200px",
    height: "200px",
    margin: "auto",
    transform: "rotate(45deg)",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  };

  const wrapperStyle: CSSProperties = {
    position: "relative",
    width: "200px",
    height: "200px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };
  const textStyle: CSSProperties = {
    // CAMBIO 4: Quitamos position absolute y zIndex
    bottom: -60,
    position: "absolute",
    fontFamily: "sans-serif",
    fontSize: "1.5rem",
    letterSpacing: "0.2em",
    fontWeight: 600,
    textTransform: "uppercase",
  };
  return (
    <div style={wrapperStyle}>
      <canvas ref={canvasRef} width={200} height={200} style={containerStyle} />
      <div
        style={textStyle}
        className="animate-pulse text-dcicflix text-shadow-dcicflix"
      >
        Thinking...
      </div>
    </div>
  );
}
