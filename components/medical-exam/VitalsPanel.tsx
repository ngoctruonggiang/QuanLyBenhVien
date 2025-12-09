// components/medical-exam/VitalsPanel.tsx
import { Vitals } from "@/interfaces/medical-exam"; // Assuming Vitals interface is here
import { cn } from "@/lib/utils"; // Assuming cn utility is available

interface Props {
  vitals: Vitals;
  showStatus?: boolean; // Show normal/high/low indicators
}

const vitalRanges = {
  temperature: { min: 36.0, max: 37.5, unit: '°C', label: 'Temperature', icon: '🌡️' },
  heartRate: { min: 60, max: 100, unit: 'bpm', label: 'Heart Rate', icon: '❤️' },
  bloodPressureSystolic: { min: 90, max: 120, unit: 'mmHg', label: 'BP Systolic', icon: '📊' },
  bloodPressureDiastolic: { min: 60, max: 80, unit: 'mmHg', label: 'BP Diastolic', icon: '📊' },
  weight: { min: 0.1, max: 500, unit: 'kg', label: 'Weight', icon: '⚖️' },
  height: { min: 1, max: 300, unit: 'cm', label: 'Height', icon: '📏' },
};

function getVitalStatus(key: keyof Vitals, value: number): 'normal' | 'high' | 'low' | 'unknown' {
  const config = vitalRanges[key];
  if (!config || !('min' in config && 'max' in config)) return 'unknown'; // Only for vitals with defined ranges

  if (value < config.min) return 'low';
  if (value > config.max) return 'high';
  return 'normal';
}

export function VitalsPanel({ vitals, showStatus = true }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {(Object.keys(vitals) as Array<keyof Vitals>).map((key) => {
        const value = vitals[key];
        if (value === null || value === undefined) return null;
        
        const config = vitalRanges[key];
        if (!config) return null; // Skip if vital is not configured

        const status = showStatus ? getVitalStatus(key, value) : 'unknown';
        const isBpCombined = key === 'bloodPressureSystolic' && vitals.bloodPressureDiastolic !== undefined;

        return (
          <div
            key={key}
            className={cn(
              "p-4 rounded-lg border",
              {
                "border-red-300 bg-red-50": status === 'high',
                "border-blue-300 bg-blue-50": status === 'low',
                "border-gray-200 bg-gray-50": status === 'normal' || status === 'unknown',
              }
            )}
          >
            <div className="text-2xl mb-1">{config.icon}</div>
            <div className="text-sm text-gray-500">{config.label}</div>
            <div className="text-xl font-semibold">
              {isBpCombined
                ? `${value}/${vitals.bloodPressureDiastolic}`
                : value
              }
              <span className="text-sm font-normal ml-1">{config.unit}</span>
            </div>
            {showStatus && status !== 'unknown' && (
              <div className={cn(
                "text-xs mt-1",
                {
                  "text-red-600": status === 'high',
                  "text-blue-600": status === 'low',
                  "text-green-600": status === 'normal',
                }
              )}>
                {status === 'normal' ? 'Normal' : status === 'high' ? 'High' : 'Low'}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
