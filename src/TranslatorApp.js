import React, { useState } from 'react';
import { ArrowRightLeft, X, Clipboard, ClipboardCheck, ClipboardCopy, Settings } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const TranslatorApp = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [preInstructions, setPreInstructions] = useState('[System] You are a Korean to English translator. Please follow these instructions 1. Take user input and translate it into English. 2. Use natural, colloquial language. 3. Include two additional alternatives. [/System] User Input:');
  const [postInstructions, setPostInstructions] = useState('[System] Don\'t include anything in your answer other than the results of your translation. [/System] [Format] 번역 결과: (Insert) \n\n 대안1: (Insert) \n\n 대안2: [/Format]');

  const handleTranslate = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Enhanced prompt with pre and post instructions
      const prompt = `
Instructions: ${preInstructions}
Text to translate: ${inputText}
Additional requirements: ${postInstructions}

Please provide the translation while following the above instructions.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setTranslatedText(response.text());
    } catch (err) {
      console.error('Translation error:', err);
      setError('Failed to translate. Please try again.');
    } finally {
      setIsLoading(false);
      setCopySuccess(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setTranslatedText('');
    setCopySuccess(false);
    setError('');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6">
          {/* Instructions Toggle Button */}
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-800"
          >
            <Settings className="h-4 w-4 mr-2" />
            {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
          </button>

          {/* Instructions Settings */}
          {showInstructions && (
            <div className="mb-6 space-y-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pre-translation Instructions:
                </label>
                <input
                  type="text"
                  value={preInstructions}
                  onChange={(e) => setPreInstructions(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Translate to a formal tone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Post-translation Requirements:
                </label>
                <input
                  type="text"
                  value={postInstructions}
                  onChange={(e) => setPostInstructions(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Maintain technical terms as is"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6">
            {/* Input Section */}
            <div className="flex-1 relative">
              <textarea
                placeholder="Enter text to translate..."
                className="w-full h-48 p-4 text-lg resize-none mt-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              {!inputText && (
                <button
                  className="absolute top-8 right-4 px-3 py-1 text-sm text-gray-500 hover:text-gray-700 flex items-center"
                  onClick={handlePaste}
                >
                  <Clipboard className="h-4 w-4 mr-2" />
                  Paste
                </button>
              )}
            </div>

            {/* Translation Section */}
            <div className="flex-1">
              <textarea
                readOnly
                placeholder="Translation will appear here..."
                className="w-full h-48 p-4 text-lg bg-gray-50 resize-none mt-4 border rounded-lg"
                value={translatedText}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-center mt-4">
              {error}
            </div>
          )}

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={handleTranslate}
              disabled={!inputText || isLoading}
              className={`px-6 py-2 rounded-lg flex items-center ${
                inputText && !isLoading
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ArrowRightLeft className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Translating...' : 'Translate'}
            </button>

            {translatedText && (
              <button
                onClick={handleCopy}
                className="px-6 py-2 rounded-lg flex items-center bg-gray-100 hover:bg-gray-200"
              >
                {copySuccess ? (
                  <>
                    <ClipboardCheck className="mr-2 h-4 w-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <ClipboardCopy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleClear}
              disabled={!inputText && !translatedText}
              className={`px-6 py-2 rounded-lg flex items-center border ${
                inputText || translatedText
                  ? 'border-gray-300 hover:bg-gray-100'
                  : 'border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <X className="mr-2 h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslatorApp;