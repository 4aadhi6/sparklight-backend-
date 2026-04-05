import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SmartDiagnosisProps {
  onSelect: (category: string, details: string) => void;
}

export const SmartDiagnosis: React.FC<SmartDiagnosisProps> = ({ onSelect }) => {
  const [problem, setProblem] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    category: string;
    explanation: string;
    urgency: 'Low' | 'Medium' | 'High';
    estimatedCost: string;
  } | null>(null);

  const analyzeProblem = async () => {
    if (!problem.trim() || problem.length < 10) return;
    
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this home maintenance problem: "${problem}". 
        Categorize it into one of these: Electrical, Plumbing, Home Repair, Cleaning.
        Provide a brief explanation, urgency level (Low, Medium, High), and a rough estimated service fee in INR.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              explanation: { type: Type.STRING },
              urgency: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
              estimatedCost: { type: Type.STRING }
            },
            required: ["category", "explanation", "urgency", "estimatedCost"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setResult(data);
    } catch (err) {
      console.error("AI Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="p-6 border-dashed border-2 border-primary/30 bg-primary/5">
      <div className="flex items-center gap-2 mb-4 text-primary">
        <Sparkles className="w-5 h-5" />
        <h3 className="font-semibold">AI Smart Diagnosis</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Describe your problem in detail, and our AI will suggest the best service for you.
      </p>

      <div className="space-y-4">
        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="e.g., My kitchen sink is leaking and the water is starting to smell..."
          className="w-full p-3 rounded-lg border bg-background min-h-[100px] focus:ring-2 focus:ring-primary outline-none transition-all"
        />
        
        <Button 
          onClick={analyzeProblem} 
          disabled={isAnalyzing || problem.length < 10}
          className="w-full gap-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing Problem...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Get AI Diagnosis
            </>
          )}
        </Button>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-lg bg-background border space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Suggested Category</span>
                  <h4 className="font-bold text-lg">{result.category}</h4>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${
                  result.urgency === 'High' ? 'bg-red-100 text-red-700' :
                  result.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {result.urgency} Urgency
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">{result.explanation}</p>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium">Est. Fee: <span className="text-primary">{result.estimatedCost}</span></span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-1"
                  onClick={() => onSelect(result.category, problem)}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Apply Diagnosis
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};
