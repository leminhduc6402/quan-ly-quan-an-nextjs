"use client";
import { getTableLink } from "@/lib/utils";
import QRCode from "qrcode";
import { useEffect, useRef } from "react";

export default function QRCodeTable({
  token,
  tableNumber,
  width = 100,
}: {
  token: string;
  tableNumber: number;
  width?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    var canvas = canvasRef.current;
    QRCode.toCanvas(
      canvas,
      getTableLink({ token, tableNumber }),
      function (error) {
        if (error) console.error(error);
      }
    );
  }, []);
  return (
    <div>
      <canvas ref={canvasRef} />
    </div>
  );
}
