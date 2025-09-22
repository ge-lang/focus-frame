// src/components/widgets/stocks-widget.tsx
'use client';
import { AnimatedWidget } from '@/components/animated-widget';

interface StocksWidgetProps {
  widgetId: string;
  title?: string;
}

const mockStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 185.32, change: 2.45 },
  { symbol: 'GOOGL', name: 'Alphabet', price: 145.67, change: -0.89 },
  { symbol: 'MSFT', name: 'Microsoft', price: 412.43, change: 1.23 },
];

export default function StocksWidget({ widgetId, title }: StocksWidgetProps) {
  return (
    <AnimatedWidget className="bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="h-full">
        <h3 className="font-semibold text-lg mb-4 text-gray-800">
          {title || 'Stocks'}
        </h3>
        
        <div className="space-y-3">
          {mockStocks.map((stock, index) => (
            <div key={stock.symbol} className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-800">{stock.symbol}</div>
                <div className="text-xs text-gray-600">{stock.name}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-800">${stock.price}</div>
                <div className={`text-xs ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change}%
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
          Refresh
        </button>
      </div>
    </AnimatedWidget>
  );
}