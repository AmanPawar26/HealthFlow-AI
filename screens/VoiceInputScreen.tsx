
import React, { useState } from 'react';
import { PatientDetails, PrescriptionData } from '../types';
import { extractPrescription } from '../services/geminiService';
import { 
  Mic, 
  Info, 
  Lightbulb, 
  Trash2, 
  Cpu, 
  User, 
  AlertCircle, 
  CheckCircle,
  ChevronLeft,
  Sparkles,
  RefreshCcw,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface Props {
  patient: PatientDetails;
  onBack: () => void;
  onNext: (transcription: string, data: PrescriptionData) => void;
  initialTranscription: string;
}

/**
 * Screen for capturing doctor's voice input and processing it via Gemini AI.
 */
const VoiceInputScreen: React.FC<Props> = ({ patient, onBack, onNext, initialTranscription }) => {
  const [text, setText] = useState(initialTranscription);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      // Use Gemini to extract structured prescription data from the voice transcription
      const result = await extractPrescription(text);
      onNext(text, result);
    } catch (err: any) {
      // Gracefully handle Gemini API errors or rate limits
      setError(err.message || "Failed to process transcription. Please try again.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header Info Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
            <User size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              Patient: {patient.name} | {patient.age}{patient.gender[0]}
            </h3>
            <p className="text-slate-500 text-sm font-medium">UPID: <span className="text-slate-900 font-mono tracking-tight">{patient.upid}</span></p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-6 py-3 rounded-xl border border-emerald-100">
          <CheckCircle size={20} className="shrink-0" />
          <span className="font-bold text-sm tracking-wide uppercase">System Connected: Voice Input Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: Input */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Mic className="text-blue-600" /> Doctor's Voice Input
            </h2>
            <button 
              onClick={onBack}
              className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-semibold transition-colors"
            >
              <ChevronLeft size={16} /> Edit Patient Info
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-blue-800 font-bold mb-3">
              <Info size={18} />
              <h4>How to use Whisper Flow</h4>
            </div>
            <ol className="text-sm text-blue-800/80 space-y-2 font-medium">
              <li className="flex gap-3">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                Click inside the blue text area below.
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                Press <kbd className="px-1.5 py-0.5 bg-blue-200 rounded border border-blue-300 font-bold">Ctrl + Win</kbd> and speak.
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                Verify the text and click "Process with AI".
              </li>
            </ol>
          </div>

          <div className="relative group">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start speaking or type clinical notes here... e.g., 'Patient has severe cough. Prescribe Paracetamol 500mg twice daily for 5 days...'"
              className="w-full h-80 p-8 rounded-[32px] bg-white border-2 border-blue-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none text-slate-900 font-bold text-lg leading-relaxed shadow-xl shadow-blue-50 transition-all resize-none placeholder:text-slate-300 placeholder:font-normal"
            />
            {text && (
              <button 
                onClick={() => setText('')}
                className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 text-sm font-bold leading-tight">{error}</p>
            </div>
          )}

          <button
            onClick={handleExtract}
            disabled={!text.trim() || isProcessing}
            className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl ${
              !text.trim() || isProcessing
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 hover:-translate-y-1'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" /> Analyzing Transcription...
              </>
            ) : (
              <>
                <Cpu size={24} /> Process with AI <ArrowRight size={24} />
              </>
            )}
          </button>
        </div>

        {/* RIGHT COLUMN: Suggestions */}
        <div className="space-y-6 lg:mt-14">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900 font-bold mb-6">
              <Lightbulb className="text-orange-400" size={20} />
              <h3>Doctor's Quick Tips</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm mb-1">Clear Dictation</p>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">State the medication name, dosage, and frequency clearly for better extraction.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                  <RefreshCcw size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm mb-1">Contextual Advice</p>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">You can mention follow-up dates and specific dietary instructions verbally.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Cpu size={120} />
            </div>
            <h4 className="text-lg font-bold mb-2">Powered by HealthFlow AI</h4>
            <p className="text-slate-400 text-sm font-medium leading-relaxed relative z-10">
              Our clinical LLM (Gemini 3 Flash) automatically identifies medications, dosages, and schedules from your speech with professional accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceInputScreen;
