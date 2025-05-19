import { useState, useEffect } from 'react';
import { DebateFormat } from '../types/debate';

const STORAGE_KEY = 'debateTimerFormats';
const DEFAULT_FORMAT_KEY = 'debateTimerDefaultFormat';

interface FormatSettingsProps {
  formats: DebateFormat[];
  defaultFormat: DebateFormat;
  onFormatsChange: (formats: DebateFormat[]) => void;
  onDefaultFormatChange: (format: DebateFormat) => void;
}

export function FormatSettings({ formats, defaultFormat, onFormatsChange, onDefaultFormatChange }: FormatSettingsProps) {
  const [customFormats, setCustomFormats] = useState<DebateFormat[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    // Combine default formats with custom formats
    const allFormats = [...formats, ...customFormats];
    onFormatsChange(allFormats);
  }, [customFormats, formats, onFormatsChange]);

  const handleExport = (format: DebateFormat) => {
    const blob = new Blob([JSON.stringify(format, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debate-format-${format.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const format = JSON.parse(e.target?.result as string) as DebateFormat;
        
        // Validate the format
        if (!format.name || !format.affirmative || !format.negative) {
          throw new Error('Invalid format structure');
        }

        // Check for duplicate names
        if ([...formats, ...customFormats].some(f => f.name === format.name)) {
          throw new Error('A format with this name already exists');
        }

        setCustomFormats(prev => {
          const newFormats = [...prev, format];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newFormats));
          return newFormats;
        });
      } catch (error) {
        console.error('Error parsing format file:', error);
        alert('Error loading format. Please make sure it\'s a valid debate format file.');
      }
    };
    reader.readAsText(file);
  };

  const handleDelete = (format: DebateFormat) => {
    setCustomFormats(prev => {
      const newFormats = prev.filter(f => f.name !== format.name);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFormats));
      return newFormats;
    });

    // If the deleted format was the default, reset to the first available format
    if (defaultFormat.name === format.name) {
      const firstFormat = formats[0];
      onDefaultFormatChange(firstFormat);
      localStorage.setItem(DEFAULT_FORMAT_KEY, firstFormat.name);
    }
  };

  const handleSetDefault = (format: DebateFormat) => {
    onDefaultFormatChange(format);
    localStorage.setItem(DEFAULT_FORMAT_KEY, format.name);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Timer Formats</h2>
        <label className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer">
          Import Format
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>

      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-2">Default Formats</h3>
          <div className="space-y-2">
            {formats.map(format => (
              <div key={format.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{format.name}</div>
                  <div className="text-sm text-gray-600">
                    {format.affirmative.length} affirmative, {format.negative.length} negative timers
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleExport(format)}
                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Export
                  </button>
                  {defaultFormat.name !== format.name && (
                    <button
                      onClick={() => handleSetDefault(format)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Set Default
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {customFormats.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Custom Formats</h3>
            <div className="space-y-2">
              {customFormats.map(format => (
                <div key={format.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{format.name}</div>
                    <div className="text-sm text-gray-600">
                      {format.affirmative.length} affirmative, {format.negative.length} negative timers
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleExport(format)}
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Export
                    </button>
                    {defaultFormat.name !== format.name && (
                      <button
                        onClick={() => handleSetDefault(format)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(format)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 