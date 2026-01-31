'use client';

import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Download, Link, User, Loader2 } from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', url: '' });
  const [result, setResult] = useState<{ shortUrl: string; slug: string } | null>(null);
  
  // State untuk custom ukuran
  const [qrSize, setQrSize] = useState(256); // Ukuran QR (px)
  const [logoPercentage, setLogoPercentage] = useState(25); // Ukuran Logo (%)

  const qrRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: formData.name,
          originalUrl: formData.url
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        alert('Gagal: ' + data.error);
      }
    } catch (err) {
      alert('Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async (format: 'png' | 'pdf') => {
    if (!qrRef.current || !result) return;

    try {
      const dataUrl = await htmlToImage.toPng(qrRef.current);
      const fileName = `QR_${formData.name.replace(/\s+/g, '_')}`;

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = dataUrl;
        link.click();
      } else {
        // PDF dengan ukuran pas sesuai QR
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [qrSize, qrSize]
        });
        
        pdf.addImage(dataUrl, 'PNG', 0, 0, qrSize, qrSize);
        pdf.save(`${fileName}.pdf`);
      }
    } catch (err) {
      console.error('Gagal download', err);
    }
  };

  // Menghitung ukuran pixel logo berdasarkan persentase
  const logoPixelSize = qrSize * (logoPercentage / 100);

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Markaz QR Generator
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* KOLOM KIRI: FORM INPUT */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Input Data</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nama Santri</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ahmad Fulan"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Link Google Drive</label>
                <div className="relative">
                  <Link className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate QR Code'}
              </button>
            </form>
          </div>

          {/* KOLOM KANAN: HASIL QR */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
            {!result ? (
              <p className="text-gray-400 text-center">
                Isi form di samping untuk membuat QR Code.
              </p>
            ) : (
              <div className="w-full flex flex-col items-center animate-fade-in">
                
                {/* SETTING SLIDERS */}
                <div className="w-full space-y-4 mb-6 bg-gray-50 p-4 rounded-lg">
                    {/* Slider Ukuran QR */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="text-xs text-gray-600 font-medium">Resolusi QR</label>
                            <span className="text-xs text-blue-600 font-bold">{qrSize}px</span>
                        </div>
                        <input 
                            type="range" 
                            min="150" 
                            max="500" 
                            value={qrSize} 
                            onChange={(e) => setQrSize(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Slider Ukuran Logo */}
                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="text-xs text-gray-600 font-medium">Ukuran Logo</label>
                            <span className="text-xs text-blue-600 font-bold">{logoPercentage}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="10" 
                            max="40" 
                            step="5"
                            value={logoPercentage} 
                            onChange={(e) => setLogoPercentage(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                            *Saran: Jangan lebih dari 30% agar mudah discan.
                        </p>
                    </div>
                </div>

                {/* AREA QR CODE (Rendered) */}
                <div ref={qrRef} className="inline-block">
                  <QRCodeCanvas
                    value={result.shortUrl}
                    size={qrSize}
                    level={"H"} // High Error Correction (Wajib untuk logo besar)
                    imageSettings={{
                      src: "/logo-markaz.png",
                      x: undefined,
                      y: undefined,
                      height: logoPixelSize, 
                      width: logoPixelSize,
                      excavate: true, 
                    }}
                  />
                </div>

                {/* TOMBOL DOWNLOAD */}
                <div className="flex gap-3 mt-6 w-full">
                  <button
                    onClick={() => downloadImage('png')}
                    className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-lg flex justify-center items-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" /> PNG
                  </button>
                  <button
                    onClick={() => downloadImage('pdf')}
                    className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-lg flex justify-center items-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" /> PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}