import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';

interface PdfViewerProps {
  pdfUrl: string;
  compileTime?: number | null;
  documentTitle?: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfUrl,
  compileTime,
  documentTitle = 'Curriculum Vitae',
}) => {
  return (
    <div className="flex-1 flex flex-col bg-slate-950/60 overflow-hidden">
      {/* Top Preview Bar */}
      <div className="h-10 border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400 bg-slate-900/50 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">{documentTitle}</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
            Vector PDF
          </span>
        </div>

        <div className="flex items-center gap-3">
          {compileTime != null && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Compiled in {compileTime}s</span>
            </div>
          )}

          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition text-[11px]"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in Tab</span>
          </a>
        </div>
      </div>

      {/* Embedded PDF iframe */}
      <div className="flex-1 bg-slate-900/20 p-2 overflow-hidden flex items-center justify-center">
        <iframe
          key={pdfUrl}
          src={pdfUrl}
          title="Document Preview"
          className="w-full h-full rounded-lg border border-slate-800 shadow-2xl bg-white"
        />
      </div>
    </div>
  );
};
